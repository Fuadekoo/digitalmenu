"use server";
import prisma from "@/lib/db";

export async function clientConnected(tid: string, guestId: string) {
  const connected = await prisma.tableSocket.findFirst({
    where: { guestId: guestId, tableId: tid },
    select: { socketId: true },
  });
  // if this is found return status true else false
  return connected ? { status: true } : { status: false };
}

export async function adminConnected() {}
