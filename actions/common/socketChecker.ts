"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function clientConnected(tid: string, guestId: string) {
  const connected = await prisma.tableSocket.findFirst({
    where: { guestId: guestId, tableId: tid },
    select: { socketId: true },
  });
  // if this is found return status true else false
  return connected ? { status: true } : { status: false };
}

export async function adminConnected() {
  // get the user id from the session
  const session = await auth();
  if (!session || !session.user) {
    return { status: false };
  }
  // check if the user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "admin") {
    return { status: false };
  }

  const connected = await prisma.user.findFirst({
    where: { id: session.user.id },
    select: { socket: true },
  });
  // if this is found return status true else false
  return connected ? { status: true } : { status: false };
}
