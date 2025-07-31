"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) {
    // Return an empty array or throw an error if the user is not logged in
    return [];
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        toUserId: session.user.id,
      },
      include: {
        fromTable: {
          select: {
            id: true,
            roomNumber: true,
            tNumber: true,
            createdAt: true,
            name: true, // Include table name for better context in notifications
          },
        }, // Include table details to show the table name
      },
      orderBy: {
        createdAt: "desc", // Show the newest notifications first
      },
    });
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return { Message: "Notification marked as read" };
  } catch {
    return { Message: "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsAsRead(notificationId: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    await prisma.notification.updateMany({
      where: { id: { in: notificationId } },
      data: { isRead: true },
    });
    return { Message: "All notifications marked as read" };
  } catch {
    return { Message: "Failed to update notifications status" };
  }
}
