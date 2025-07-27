import { createServer } from "http";
import express from "express";
import cors from "cors";
import next from "next";
import { Server, Socket } from "socket.io";
import prisma from "./lib/db";

// --- Constants for Socket Events ---
const Events = {
  // Client to Server
  REGISTER_TABLE: "register_table_socket",
  CREATE_ORDER: "create_order",
  CONFIRM_ORDER: "confirm_order",

  // Server to Client
  ORDER_CREATED_SUCCESS: "order_created_successfully",
  NEW_ORDER_NOTIFICATION: "new_order_notification",
  ORDER_STATUS_UPDATE: "order_status_update",

  // Error Events
  GENERAL_ERROR: "socket_error",
  ORDER_ERROR: "order_error",
};

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

async function handleTableRegistration(
  socket: Socket,
  tableId: string,
  guestId: string
) {
  if (!tableId || !guestId) return;
  try {
    await prisma.tableSocket.create({
      data: { tableId, guestId, socketId: socket.id },
    });
    console.log(
      `Socket ${socket.id} registered for guest ${guestId} at table ${tableId}`
    );
  } catch (error) {
    console.error(`Error during table socket registration:`, error);
    socket.emit(Events.GENERAL_ERROR, {
      message: "Failed to register table.",
    });
  }
}

async function createCustomerOrder(socket: Socket, io: Server, orderData: any) {
  const { tableId, cartItems, totalPrice, guestId } = orderData;

  if (!tableId || !cartItems || !totalPrice || !guestId) {
    console.error("Validation Error: Invalid order data received.", orderData);
    socket.emit(Events.ORDER_ERROR, {
      message: "Invalid order data provided.",
    });
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tableId,
          totalPrice,
          guestId,
          status: "pending",
          createdBy: `guest_${guestId.substring(0, 8)}`,
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

      // --- IMPROVEMENT: Notify all admins ---
      const admins = await tx.user.findMany({ where: { role: "admin" } });
      const notifications = [];
      if (admins.length > 0) {
        for (const admin of admins) {
          const newNotification = await tx.notification.create({
            data: {
              title: "New Order Received",
              message: `Order #${order.orderCode.slice(-5)} from table ${
                order.table?.name || "unknown"
              }.`,
              type: "new_order",
              fromTableId: tableId,
              toUserId: admin.id,
            },
          });
          notifications.push({
            notification: newNotification,
            socketId: admin.socket,
          });
        }
      }
      return { order, notifications };
    });

    socket.emit(Events.ORDER_CREATED_SUCCESS, result.order);

    // Emit notification to each connected admin
    if (result.notifications.length > 0) {
      result.notifications.forEach(({ notification, socketId }) => {
        if (socketId) {
          io.to(socketId).emit(Events.NEW_ORDER_NOTIFICATION, notification);
        }
      });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    socket.emit(Events.ORDER_ERROR, { message: "Failed to create the order." });
  }
}

async function handleOrderConfirmation(
  socket: Socket,
  io: Server,
  orderId: string
) {
  try {
    const adminUserId = socket.data.id;
    if (!orderId || !adminUserId) {
      throw new Error("Order ID and User ID are required.");
    }

    // --- IMPROVEMENT: Security check for admin role ---
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
    });
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Permission denied. Admin role required.");
    }

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
      const activeSockets = await prisma.tableSocket.findMany({
        where: { tableId: updatedOrder.tableId },
      });
      for (const s of activeSockets) {
        io.to(s.socketId).emit(Events.ORDER_STATUS_UPDATE, updatedOrder);
      }
      console.log(
        `Sent 'order_status_update' to ${activeSockets.length} sockets for table ${updatedOrder.tableId}`
      );
    }
  } catch (error: any) {
    console.error("Error confirming order:", error);
    socket.emit(Events.ORDER_ERROR, {
      message: error.message || "Failed to confirm order.",
    });
  }
}

async function handleDisconnect(socket: Socket) {
  console.log("Socket disconnected:", socket.id);
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
  try {
    await prisma.tableSocket.deleteMany({ where: { socketId: socket.id } });
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
    expressApp.use(express.json({ limit: "50mb" })); // Increase limit for base64 images
    expressApp.use(express.urlencoded({ extended: true, limit: "50mb" }));
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

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);
      handleUserConnection(socket);

      socket.on(Events.REGISTER_TABLE, ({ tableId, guestId }) =>
        handleTableRegistration(socket, tableId, guestId)
      );
      socket.on(Events.CREATE_ORDER, (orderData) =>
        createCustomerOrder(socket, io, orderData)
      );
      socket.on(Events.CONFIRM_ORDER, ({ orderId }) =>
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
