// filepath: c:\Users\Fuad\Documents\pro\digitalmenu\pages\api\socket\io.ts
// Note: This file should be in the `pages/api` directory, not `app/api`.
// If you don't have a `pages` directory, you may need to create it.
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { NextApiRequest} from "next";
import { NextApiResponseServerIO } from "@/types/socket";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");
    const httpServer: NetServer = res.socket.server;
    const io = new ServerIO(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;
  }
  res.end();
};
