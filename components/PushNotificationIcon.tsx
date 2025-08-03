"use client";
import { useEffect, useState } from "react";
import { subscribeUser } from "@/actions/common/webpush";
import useGuestSession from "@/hooks/useGuestSession";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationIcon() {
  const guestId = useGuestSession();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
    // eslint-disable-next-line
  }, []);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    }
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    if (guestId) {
      await subscribeUser(serializedSub, guestId);
    } else {
      console.error("guestId is null. Cannot subscribe user.");
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      {!subscription ? (
        <button onClick={subscribeToPush}>
          Subscribe to push notifications
        </button>
      ) : (
        <p>You are already subscribed to push notifications.</p>
      )}
    </div>
  );
}
