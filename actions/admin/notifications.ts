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
        fromTable: true, // Include table details to show the table name
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
