"use client";
import prisma from "@/lib/db";
// get table id from the URL
// import { useSocket } from "./SocketProvider";
import { useParams } from "next/navigation";

export default async function getNotification() {
  const params = useParams();
  const tableId = params.tid as string;
  const notifications = await prisma.notification.findMany({
    where: {
      toTableId: tableId,
    },
    orderBy: {
      createdAt: "desc", // Show the newest notifications first
    },
  });
  return notifications;
}

export async function markAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}
