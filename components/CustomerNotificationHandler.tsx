"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { BellPlus, CheckCircle, Loader2 } from "lucide-react";
// import { Button } from "@heroui/react";
// import {  } from "lucide-react";
import { Alert, Button } from "@heroui/react";
// import CustomAlert from "./CustomAlert"; // Adjust the path as needed
import { useSocket } from "@/components/SocketProvider";
import { addToast } from "@heroui/toast";
import { formatDistanceToNow } from "date-fns";
import {
  markCustomerNotificationAsRead,
  getCustomerNotifications,
  allMarkCustomerNotificationAsRead,
} from "@/actions/customer/notification";
import useAction from "@/hooks/useActions";
import { useParams } from "next/navigation";
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

type CustomerNotification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function CustomerNotificationBell() {
  const params = useParams() as { lang: string; passcode: string; tid: string };
  const tid = params?.tid;
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Push notification subscription state
  const guestId = useGuestSession();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Confirmation alert state
  const [showConfirm, setShowConfirm] = useState(false);

  // Actions
  const [, markAction] = useAction(markCustomerNotificationAsRead, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Notification",
          description: response.message,
        });
      } else {
        addToast({
          title: "Notification",
          description: "Notification marked as read!",
        });
      }
    },
  ]);
  const [, allMarkAction] = useAction(allMarkCustomerNotificationAsRead, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Notification",
          description: response.message,
        });
      } else {
        addToast({
          title: "Notification",
          description: "All notifications marked as read!",
        });
      }
    },
  ]);
  const [notificationResponse, refreshNotification, isLoadingNotification] =
    useAction(getCustomerNotifications, [true, () => {}], tid);

  // Memoize notifications array
  const notifications: CustomerNotification[] = useMemo(
    () =>
      Array.isArray(notificationResponse)
        ? notificationResponse.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            isRead: n.isRead,
            createdAt:
              typeof n.createdAt === "string"
                ? n.createdAt
                : n.createdAt.toISOString(),
          }))
        : [],
    [notificationResponse]
  );

  // Memoize unread count and unread IDs
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications]
  );
  const unreadCount = unreadNotifications.length;
  const unreadIds = useMemo(
    () => unreadNotifications.map((n) => n.id),
    [unreadNotifications]
  );

  // Push notification: check subscription
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    }
  }

  async function subscribeToPush() {
    if (loading) return;
    setLoading(true);
    try {
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
        addToast({
          title: "Subscribed",
          description: "You will now receive push notifications.",
        });
      } else {
        console.error("guestId is null. Cannot subscribe user.");
      }
    } catch (err) {
      addToast({
        title: "Subscription Failed",
        description: "subscription are blocked goto setting and turn on.",
      });
      console.error(err);
    }
    setLoading(false);
  }

  // Modified bell click handler
  const handleBellClick = async () => {
    if (!subscription) {
      setShowConfirm(true); // Show confirmation alert
      return;
    }
    await refreshNotification();
    setIsOpen((prev) => !prev);
  };

  // Handler for confirming subscription
  const handleConfirmSubscribe = async () => {
    setShowConfirm(false);
    await subscribeToPush();
  };

  // Handler for cancel
  const handleCancelSubscribe = () => {
    setShowConfirm(false);
  };

  // "Mark all as read" handler
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unreadIds.length > 0) {
      await allMarkAction(unreadIds);
      await refreshNotification();
    }
  };

  // Listen for real-time order status updates and refresh notifications
  useEffect(() => {
    if (!socket) return;

    interface OrderStatusUpdate {
      orderCode: string;
      status: string;
    }

    const handleSocketNotification = (order: OrderStatusUpdate) => {
      addToast({
        title: "Order Update!",
        description: `Your order #${order.orderCode
          .slice(-5)
          .toUpperCase()} has been ${order.status}.`,
      });
      refreshNotification();
    };

    socket.on("order_status_update", handleSocketNotification);

    return () => {
      socket.off("order_status_update", handleSocketNotification);
    };
  }, [socket, refreshNotification]);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: CustomerNotification) => {
    if (!notification.isRead) {
      markAction(notification.id); // Use markAction for a single notification
      refreshNotification(); // Refresh the list after marking as read
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center h-12">
        <BellPlus className="w-7 h-7 text-white" />
        <button
          className="ml-2 flex items-center gap-1 text-red-600 focus:outline-none"
          onClick={async () => {
            await refreshNotification();
            setIsOpen((prev) => !prev);
          }}
          title="Show notifications"
        >
          <BellPlus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-0 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        title={
          subscription
            ? "Show notifications"
            : loading
            ? "Subscribing..."
            : "Subscribe to push notifications"
        }
        disabled={loading}
      >
        <span style={{ fontSize: "1.5rem" }}>{subscription ? "🔔" : "🔕"}</span>
        {subscription && unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Confirmation Alert */}
      {showConfirm && (
        <div className="absolute z-50 right-0 mt-2 w-80">
          <Alert
            color="primary"
            title="Are you sure you want to subscribe?"
            className="mb-2"
          >
            <div className="flex items-center gap-2 mt-3">
              <Button
                className="bg-background text-default-700 font-medium border-1 shadow-small"
                size="sm"
                variant="bordered"
                onClick={handleConfirmSubscribe}
              >
                Subscribe
              </Button>
              <Button
                className="text-default-500 font-medium underline underline-offset-4"
                size="sm"
                variant="light"
                onClick={handleCancelSubscribe}
              >
                Cancel
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {/* Notification Dropdown */}
      {subscription && isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Order Updates
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:underline focus:outline-none"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoadingNotification ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start p-3 gap-3 cursor-pointer hover:bg-gray-50 ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex-shrink-0">
                    {!notification.isRead ? (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5"></div>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-semibold text-gray-800">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-700">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>You have no new updates.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
