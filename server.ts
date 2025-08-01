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
    const user = await prisma.user.findUnique({
      where: { id: socket.data.id, role: "admin" },
    });

    // --- Join the admin room if the user is an admin ---
    if (user && user.role === "admin") {
      socket.join("admin_room");
      console.log(`Admin user ${user.id} joined 'admin_room'`);
    }
  } catch (error) {
    console.error(
      `Failed to process connection for user ${socket.data.id}:`,
      error
    );
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
    // Join the table-specific room for real-time updates
    socket.join(`table_${tableId}`);
    socket.emit("join_room", `table_${tableId}`);
    console.log(`Socket ${socket.id} joined room table_${tableId}`);
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

      // --- Create a single notification payload to broadcast ---
      const admins = await tx.user.findMany({ where: { role: "admin" } });
      let notificationPayload = null;
      if (admins.length > 0) {
        const message = `Order #${order.orderCode.slice(-5)} from table ${
          order.table?.name || "unknown"
        }.`;

        notificationPayload = {
          id: order.id,
          title: "New Order Received",
          message: message,
          isRead: false,
          orderCode: order.orderCode,
          table: order.table ? { name: order.table.name } : null,
          createdAt: new Date().toISOString(),
          fromTable: order.table ? { name: order.table.name } : null,
        };

        // Create the notification records in the database for persistence
        for (const admin of admins) {
          await tx.notification.create({
            data: {
              title: notificationPayload.title,
              message: notificationPayload.message,
              type: "new_order",
              fromTableId: tableId,
              toUserId: admin.id,
            },
          });
        }
      }
      return { order, notificationPayload };
    });

    // Let the customer know their order was created successfully
    socket.emit(Events.ORDER_CREATED_SUCCESS, result.order);

    // Broadcast the notification to the 'admin_room'
    if (result.notificationPayload) {
      io.to("admin_room").emit(
        Events.NEW_ORDER_NOTIFICATION,
        result.notificationPayload
      );
      console.log("Broadcasted new order notification to 'admin_room'");
    }
  } catch (error) {
    console.error("Error creating order:", error);
    socket.emit(Events.ORDER_ERROR, {
      message: "Failed to create the order.",
    });
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

    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
    });
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Permission denied. Admin role required.");
    }

    // --- Transaction: update order and create notification ---
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: "confirmed" },
        include: { table: true },
      });

      let notificationPayload = null;

      if (order.tableId) {
        // Create notification in DB
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

        // Prepare notification payload for socket (for admin, optional)
        notificationPayload = {
          id: order.id,
          title: "Order Confirmed",
          message: `Your order #${order.orderCode.slice(
            -5
          )} has been confirmed.`,
          isRead: false,
          orderCode: order.orderCode,
          table: order.table ? { name: order.table.name } : null,
          createdAt: new Date().toISOString(),
          fromTable: order.table ? { name: order.table.name } : null,
        };
      }

      return { order, notificationPayload };
    });

    // --- Broadcast to all sockets for this table (customer) ---
    // if (result.order.tableId) {
    //   io.to(`table_${result.order.tableId}`).emit(Events.ORDER_STATUS_UPDATE, {
    //     ...result.order,
    //     status: "confirmed",
    //   });
    //   console.log(
    //     `Broadcasted order confirmation to table_${result.order.tableId}`
    //   );
    // }

    // --- Broadcast only to the guest who placed the order ---
    if (result.order.guestId) {
      const guestSockets = await prisma.tableSocket.findMany({
        where: { guestId: result.order.guestId },
      });

      for (const s of guestSockets) {
        io.to(s.socketId).emit(Events.ORDER_STATUS_UPDATE, {
          ...result.order,
          status: "confirmed",
        });
        console.log(
          `Broadcasted order confirmation to guest ${result.order.guestId} at socket ${s.socketId}`
        );
      }
    }

    // Optionally: broadcast notification to admin_room if needed
    // (Uncomment if you want admins to see a notification when confirming)
    // if (result.notificationPayload) {
    //   io.to("admin_room").emit(
    //     Events.NEW_ORDER_NOTIFICATION,
    //     result.notificationPayload
    //   );
    //   console.log(
    //     "Broadcasted order confirmation notification to 'admin_room'"
    //   );
    // }

    return result;
  } catch (error: any) {
    console.error("Error confirming order:", error);
    socket.emit(Events.ORDER_ERROR, {
      message: error.message || "Failed to confirm order.",
    });
  }
}

async function handleDisconnect(socket: Socket) {
  console.log("Socket disconnected:", socket.id);
  try {
    // Clean up guest sockets on disconnect
    await prisma.tableSocket.deleteMany({ where: { socketId: socket.id } });
    console.log(`De-registered disconnected guest socket ${socket.id}`);
  } catch (error) {
    console.error(`Error de-registering socket ${socket.id}:`, error);
  }
}

// --- Main Server Setup ---
process.loadEnvFile(".env");
const hostname = process.env.HOSTNAME,
  port = parseInt(process.env.PORT || "3000", 10),
  dev = process.env.NODE_ENV !== "production",
  app = next({ dev, hostname, port, turbo: true });

app
  .prepare()
  .then(async () => {
    const expressApp = express();
    expressApp.use(express.json({ limit: "50mb" }));
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
