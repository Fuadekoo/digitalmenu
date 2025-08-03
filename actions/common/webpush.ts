"use server";

import prisma from "@/lib/db";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:fuadabdurahman0859@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type SubscriptionInput = {
  endpoint: string;
  keys: { auth: string; p256dh: string };
  // Optionally add type here if you want to support it
  type?: string;
};

// Store or update a subscription in the database
export async function subscribeUser(sub: SubscriptionInput, guestId: string) {
  await prisma.subscription.upsert({
    where: { guestId: guestId },
    update: {
      endpoint: sub.endpoint,
      keysAuth: sub.keys.auth,
      keysP256dh: sub.keys.p256dh,
    },
    create: {
      endpoint: sub.endpoint,
      guestId: guestId,
      type: sub.type ?? "guest",
      keysAuth: sub.keys.auth,
      keysP256dh: sub.keys.p256dh,
    },
  });
  return { success: true };
}

// Remove a subscription from the database by endpoint
export async function unsubscribeUser(endpoint: string) {
  // await prisma.subscription.deleteMany({ where: { endpoint } });
  // return { success: true };
  return null;
}

// Send a notification to all valid subscriptions in the database
export async function sendNotification(message: string) {
  const subscriptions = await prisma.subscription.findMany();
  if (!subscriptions.length) throw new Error("No subscriptions available");

  let successCount = 0;
  let failCount = 0;

  for (const sub of subscriptions) {
    try {
      const buf = Buffer.from(sub.keysP256dh, "base64");
      if (buf.length !== 65) {
        console.warn(
          "Skipping invalid subscription (p256dh not 65 bytes):",
          sub.endpoint
        );
        failCount++;
        continue;
      }
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.keysAuth,
            p256dh: sub.keysP256dh,
          },
        },
        JSON.stringify({
          title: "Test Notification",
          body: message,
          icon: "/logo.png",
        })
      );
      console.log("Notification sent to", sub.endpoint);
      successCount++;
    } catch (error) {
      console.error("Error sending push notification to", sub.endpoint, error);
      failCount++;
    }
  }

  return { success: true, sent: successCount, failed: failCount };
}
