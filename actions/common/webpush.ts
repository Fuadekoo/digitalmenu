"use server";
import prisma from "@/lib/db";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:fuadabdurahman0859@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type Subscription = PushSubscription & {
  keys: { auth: string; p256dh: string };
};

let subscription: Subscription | null = null;

export async function subscribeUser(sub: Subscription, guestId: string) {
  subscription = sub;
  // In a production environment, you would want to store the subscription in a database
  // Check if a subscription already exists for this guestId
  const existing = await prisma.subscription.findFirst({
    where: { guestId },
  });

  if (existing) {
    // Update the existing subscription with new endpoint and keys
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        endpoint: sub.endpoint,
        keysAuth: sub.keys.auth,
        keysP256dh: sub.keys.p256dh,
      },
    });
  } else {
    // Create a new subscription
    await prisma.subscription.create({
      data: {
        guestId: guestId,
        endpoint: sub.endpoint,
        keysAuth: sub.keys.auth,
        keysP256dh: sub.keys.p256dh,
      },
    });
  }
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

export async function sendNotification(message: string) {
  console.log("Sending notification:", message);
  console.log("Current subscription:", subscription);
  if (!subscription) {
    throw new Error("No subscription available");
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Test Notification",
        body: message,
        icon: "/logo.png",
      })
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}

export async function deleteAllSubscription() {
  try {
    await prisma.subscription.deleteMany({});
    return { success: true, mesage: "All subscriptions deleted" };
  } catch {
    return { success: false, error: "Failed to delete subscriptions" };
  }
}
