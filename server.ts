import { createServer } from "http";
import express from "express";
import cors from "cors";
import next from "next";
import { Server } from "socket.io";
import prisma from "./lib/db";

process.loadEnvFile(".env");

const hostname = process.env.HOST || "localhost",
  port = parseInt(process.env.PORT || "3000", 10),
  dev = process.env.NODE_ENV !== "production",
  app = next({ dev, hostname, port, turbo: true });

app.prepare().then(async () => {
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

  // Fix: Use app.getRequestHandler() directly, not as a function call
  const handler = app.getRequestHandler();
  expressApp.use((req, res) => handler(req, res));

  const httpServer = createServer(expressApp);

  const io = new Server(httpServer, { pingTimeout: 60000 });

  io.use(async (socket, next) => {
    socket.data.id = socket.handshake.auth.id;
    next();
  });

  io.on("connection", async (socket) => {
    console.log("connect", socket.id);
    if (socket.data.id) {
      socket.except(socket.id).emit("user:+", socket.data.id);
      await prisma.user.update({
        where: { id: socket.data.id },
        data: { socket: socket.id },
      });
    }

    // One-to-one chat
    socket.on("msg", async ({ id, msg }: { id: string; msg: string }) => {
      console.log("MSG >> ", socket.data.id, "to", id);
      const user = await prisma.user.findFirst({
        where: { id },
        select: { id: true, socket: true },
      });
      if (socket.data.id && user) {
        const chat = await prisma.chat.create({
          data: { fromUserId: socket.data.id, toUserId: user.id, msg },
        });

        // Emit to receiver
        if (user.socket) {
          io.to(user.socket).emit("msg", {
            id: chat.id,
            fromUserId: socket.data.id,
            toUserId: user.id,
            msg: chat.msg,
            createdAt: chat.createdAt,
            self: false,
          });
        }
        // (Optional) Emit to sender for confirmation (self: true)
        // socket.emit("msg", {
        //   id: chat.id,
        //   fromUserId: socket.data.id,
        //   toUserId: user.id,
        //   msg: chat.msg,
        //   createdAt: chat.createdAt,
        //   self: true,
        // });
      }
    });

    socket.on("disconnect", async (reason) => {
      console.log("DISCONNECT >> ", reason);
      if (socket.data.id) {
        socket.except(socket.id).emit("user:-", socket.data.id);
        await prisma.user.update({
          where: { id: socket.data.id },
          data: { socket: "" },
        });
      }
    });

    socket.on("error", (err) => {
      console.log("error-message ", err.message);
      console.log("error-cause ", err.cause);
    });
  });

  httpServer.listen({ host: hostname, port }, () => {
    console.log(
      `> Server listening at http://${hostname}:${port} as ${
        process.env.NODE_ENV ?? "development"
      }`
    );
  });
});
