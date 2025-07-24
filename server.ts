import { createServer } from "http";
import express from "express";
import cors from "cors";
import next from "next";
import { Server } from "socket.io";
import prisma from "./lib/db"; // Corrected import path

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
      socket.data.role = socket.handshake.auth.role;
      const tid = socket.handshake.query.tid as string | undefined;
      if (tid) {
        socket.data.tableId = tid;
      }
      next();
    });

    io.on("connection", async (socket) => {
      console.log("Socket connected:", socket.id);

      // --- User (Admin/Waiter) Connection Logic ---
      if (socket.data.id) {
        if (socket.data.role == "admin") {
          await prisma.user.update({
            where: { id: socket.data.id },
            data: { socket: socket.id },
          });
        } else {
          
        }
        try {
          console.log(`User ${socket.data.id} connected. Saving socket ID...`);
          console.log(`Successfully saved socket for user ${socket.data.id}.`);
        } catch (error) {
          console.error(
            `Failed to update socket for user ${socket.data.id}:`,
            error
          );
        }
      }

      // --- Table (Customer) Connection Logic ---
      socket.on(
        "register_table_socket",
        async ({ tableId }: { tableId: string }) => {
          if (tableId) {
            try {
              // First, check if a table with the given ID actually exists.
              const tableExists = await prisma.table.findUnique({
                where: { id: tableId },
              });

              // Only if the table exists, update its socket ID.
              if (tableExists) {
                await prisma.table.update({
                  where: { id: tableId },
                  data: { socket: socket.id },
                });
                socket.data.tableId = tableId;
                console.log(
                  `Successfully updated socket for existing table ${tableId}`
                );
              } else {
                // If the table does not exist, log a warning and do nothing.
                console.warn(
                  `Warning: Attempted to connect to a non-existent table with ID: ${tableId}. No update was performed.`
                );
              }
            } catch (error) {
              console.error(
                `Error during socket registration for table ${tableId}:`,
                error
              );
            }
          }
        }
      );

      // --- Order Creation Logic ---
      socket.on("create_order", async (orderData) => {
        const { tableId, cartItems, totalPrice, clientName, phone } = orderData;
        if (!tableId || !cartItems || !totalPrice) {
          socket.emit("order_error", {
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
                clientName,
                phone,
                status: "pending",
                createdBy: `table_${tableId}`,
                orderItems: {
                  create: cartItems.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                },
              },
              include: {
                orderItems: { include: { product: true } },
                table: true,
              },
            });
            const admin = await tx.user.findFirst({ where: { role: "admin" } });
            if (admin) {
              await tx.notification.create({
                data: {
                  title: "New Order Received",
                  message: `Order #${order.orderCode.slice(-5)} from table ${
                    order.table?.name
                  }.`,
                  type: "new_order",
                  fromTableId: tableId,
                  toUserId: admin.id,
                },
              });
            }
            return { order, adminSocket: admin?.socket };
          });
          if (result.adminSocket) {
            io.to(result.adminSocket).emit(
              "new_order_notification",
              result.order
            );
            console.log(
              `Sent 'new_order_notification' to admin socket ${result.adminSocket}`
            );
          }
        } catch (error) {
          console.error("Error creating order:", error);
          socket.emit("order_error", {
            message: "Failed to create the order.",
          });
        }
      });

      // --- Order Confirmation Logic ---
      socket.on("confirm_order", async ({ orderId }: { orderId: string }) => {
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
          if (updatedOrder.table?.socket) {
            io.to(updatedOrder.table.socket).emit(
              "order_status_update",
              updatedOrder
            );
            console.log(
              `Sent 'order_status_update' to table socket ${updatedOrder.table.socket}`
            );
          }
        } catch (error) {
          console.error("Error confirming order:", error);
        }
      });

      // --- Disconnect Logic ---
      socket.on("disconnect", async (reason) => {
        console.log("Socket disconnected:", socket.id, "Reason:", reason);
        if (socket.data.id) {
          try {
            await prisma.user.update({
              where: { id: socket.data.id },
              data: { socket: null },
            });
          } catch (error) {
            console.error(
              `Error clearing socket for user ${socket.data.id}:`,
              error
            );
          }
        }
        if (socket.data.tableId) {
          try {
            // Use findUnique to avoid crashing if the table was deleted
            const tableExists = await prisma.table.findUnique({
              where: { id: socket.data.tableId },
            });
            if (tableExists) {
              await prisma.table.update({
                where: { id: socket.data.tableId },
                data: { socket: null },
              });
            }
          } catch (error) {
            console.error(
              `Error clearing socket for table ${socket.data.tableId}:`,
              error
            );
          }
        }
      });

      socket.on("error", (err) => {
        console.log("Socket error:", err.message);
      });
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
