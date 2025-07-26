import { createServer } from "http";
import express from "express";
import cors from "cors";
import next from "next";
import { Server, Socket } from "socket.io";
import prisma from "./lib/db";

// --- Helper Functions for Socket Logic ---

async function handleUserConnection(socket: Socket) {
  if (!socket.data.id) return;
  try {
    await prisma.user.update({
      where: { id: socket.data.id },
      data: { socket: socket.id },
    });
  } catch (error) {
    console.error(`Failed to update socket for user ${socket.data.id}:`, error);
  }
}

/**
 * Handles registering a customer's socket in the database.
 * @param socket The connecting table's socket.
 * @param tableId The ID of the table to associate with.
 * @param guestId The unique ID of the guest.
 */
async function handleTableRegistration(
  socket: Socket,
  tableId: string,
  guestId: string
) {
  if (!tableId || !guestId) return;
  try {
    // Create a new entry in the TableSocket table for this connection.
    await prisma.tableSocket.create({
      data: {
        tableId: tableId,
        guestId: guestId,
        socketId: socket.id,
      },
    });
    console.log(
      `Socket ${socket.id} registered for guest ${guestId} at table ${tableId}`
    );
  } catch (error) {
    console.error(`Error during table socket registration:`, error);
  }
}

async function createCustomerOrder(socket: Socket, io: Server, orderData: any) {
  // --- THIS IS THE FIX (Part 1) ---
  // Destructure guestId from the incoming data.
  const { tableId, cartItems, totalPrice, guestId } = orderData;

  // Add a robust check to ensure all required data, including guestId, is present.
  // This prevents the server from crashing.
  if (!tableId || !cartItems || !totalPrice || !guestId) {
    console.error("Validation Error: Invalid order data received.", orderData);
    socket.emit("order_error", { message: "Invalid order data provided." });
    return;
  }
  // --- END OF FIX (Part 1) ---

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tableId,
          totalPrice,
          // --- THIS IS THE FIX (Part 2) ---
          // Directly use the validated guestId from the payload.
          // The complex and error-prone cookie logic has been removed.
          guestId: guestId,
          status: "pending",
          // Make the creator dynamic using the validated guestId.
          createdBy: `guest_${guestId.substring(0, 8)}`,
          // --- END OF FIX (Part 2) ---
          orderItems: {
            create: cartItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { table: true },
      });

      let newNotification = null;
      const admin = await tx.user.findFirst({ where: { role: "admin" } });
      if (admin) {
        newNotification = await tx.notification.create({
          data: {
            title: "New Order Received",
            message: `Order #${order.orderCode.slice(-5)} from table ${
              order.table ? order.table.name : "unknown"
            }.`,
            type: "new_order",
            fromTableId: tableId,
            toUserId: admin.id,
          },
        });
      }
      return { order, adminSocket: admin?.socket, newNotification };
    });

    socket.emit("order_created_successfully", result.order);

    if (result.adminSocket && result.newNotification) {
      io.to(result.adminSocket).emit(
        "new_order_notification",
        result.newNotification
      );
    }
  } catch (error) {
    console.error("Error creating order:", error);
    socket.emit("order_error", { message: "Failed to create the order." });
  }
}

/**
 * Handles an admin confirming an order and notifies all guests at the table.
 * @param socket The admin's socket instance.
 * @param io The main Socket.IO server instance.
 * @param orderId The ID of the order to confirm.
 */
async function handleOrderConfirmation(
  socket: Socket,
  io: Server,
  orderId: string
) {
  const adminUserId = socket.data.id;
  if (!orderId || !adminUserId) return;
  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: "confirmed" },
        include: { table: true },
      });
      if (order.tableId) {
        await tx.notification.create({
          data: {
            title: "Order Confirmed",
            message: `Your order #${order.orderCode.slice(
              -5
            )} has been confirmed.`,
            type: "order_confirmed",
            fromUserId: adminUserId,
            toTableId: order.tableId,
          },
        });
      }
      return order;
    });

    if (updatedOrder.tableId) {
      // 1. Find all active sockets for this table from the database.
      const activeSockets = await prisma.tableSocket.findMany({
        where: { tableId: updatedOrder.tableId },
      });

      // 2. Emit the update to each active socket individually.
      for (const s of activeSockets) {
        io.to(s.socketId).emit("order_status_update", updatedOrder);
      }
      console.log(
        `Sent 'order_status_update' to ${activeSockets.length} sockets for table ${updatedOrder.tableId}`
      );
    }
  } catch (error) {
    console.error("Error confirming order:", error);
  }
}

/**
 * Handles cleaning up the database when a socket disconnects.
 * @param socket The disconnecting socket.
 */
async function handleDisconnect(socket: Socket) {
  console.log("Socket disconnected:", socket.id);
  // Clear user socket
  if (socket.data.id) {
    try {
      await prisma.user.update({
        where: { id: socket.data.id },
        data: { socket: null },
      });
    } catch (error) {
      console.error(`Error clearing socket for user ${socket.data.id}:`, error);
    }
  }

  // When a guest disconnects, remove their entry from the TableSocket table.
  try {
    await prisma.tableSocket.deleteMany({
      where: { socketId: socket.id },
    });
    console.log(`De-registered disconnected socket ${socket.id}`);
  } catch (error) {
    console.error(`Error de-registering socket ${socket.id}:`, error);
  }
}

// --- Main Server Setup ---
process.loadEnvFile(".env");
const hostname = process.env.HOST || "localhost",
  port = parseInt(process.env.PORT || "3000", 10),
  dev = process.env.NODE_ENV !== "production",
  app = next({ dev, hostname, port, turbo: true });

app
  .prepare()
  .then(async () => {
    const expressApp = express();
    expressApp.use(express.json());
    expressApp.use(express.urlencoded({ extended: true }));
    expressApp.use(
      cors({
        origin: "*",
        methods: "GET,POST,PUT,DELETE",
        allowedHeaders: "Content-Type,Authorization",
      })
    );

    const handler = app.getRequestHandler();
    expressApp.use((req, res) => handler(req, res));

    const httpServer = createServer(expressApp);
    const io = new Server(httpServer, { pingTimeout: 60000 });

    io.use(async (socket, next) => {
      socket.data.id = socket.handshake.auth.id;
      const tid = socket.handshake.query.tid as string | undefined;
      if (tid) {
        socket.data.tableId = tid;
      }
      next();
    });

    io.on("connection", async (socket) => {
      console.log("Socket connected:", socket.id);
      await handleUserConnection(socket);

      socket.on("register_table_socket", ({ tableId, guestId }) =>
        handleTableRegistration(socket, tableId, guestId)
      );
      socket.on("create_order", (orderData) =>
        createCustomerOrder(socket, io, orderData)
      );
      socket.on("confirm_order", ({ orderId }) =>
        handleOrderConfirmation(socket, io, orderId)
      );
      socket.on("disconnect", () => handleDisconnect(socket));
      socket.on("error", (err) => console.log("Socket error:", err.message));
    });

    httpServer.listen({ host: hostname, port }, () => {
      console.log(
        `> Server listening at http://${hostname}:${port} as ${
          dev ? "development" : "production"
        }`
      );
    });

    httpServer.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("Error during server setup:", err);
    process.exit(1);
  });
