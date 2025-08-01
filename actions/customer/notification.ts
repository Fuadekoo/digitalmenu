"use server";
import prisma from "@/lib/db";
// get table id from the URL
// import { useSocket } from "./SocketProvider";
// import { useParams } from "next/navigation";

export async function getCustomerNotifications(tableId: string) {
  const notifications = await prisma.notification.findMany({
    where: {
      toTableId: tableId,
      type: "order_confirmed",
    },
    orderBy: {
      createdAt: "desc", // Show the newest notifications first
    },
  });
  return notifications;
}

export async function markCustomerNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return { message: "Notification marked as read!" };
  } catch {
    return { message: "Failed to mark notification as read." };
  }
}

export async function allMarkCustomerNotificationAsRead(
  notificationId: string[]
) {
  try {
    // use a transaction to mark all notifications as read
    await prisma.notification.updateMany({
      where: { id: { in: notificationId } },
      data: { isRead: true },
    });
    return { message: "All notifications marked as read!" };
  } catch {
    return { message: "Failed to mark all notifications as read." };
  }
}
