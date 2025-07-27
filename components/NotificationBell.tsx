"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { useSocket } from "@/components/SocketProvider";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/actions/admin/notifications";
import useAction from "@/hooks/useActions";
import { addToast } from "@heroui/toast";
import { formatDistanceToNow } from "date-fns";

// Define the type for a notification based on your Prisma schema
type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string; // Comes as string from server
  fromTable: {
    name: string;
  } | null;
};

const NotificationBell = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notificationSound = useMemo(() => {
    if (typeof window !== "undefined") {
      return new Audio("/sound/notification.mp3"); // Ensure this file is in /public/sound
    }
    return null;
  }, []);

  const [, markAsReadAction] = useAction(markNotificationAsRead, [, () => {}]);

  // Fetch initial notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      const initialNotifications = await getNotifications();
      setNotifications(
        (initialNotifications as any[]).map((n) => ({
          ...n,
          createdAt:
            n.createdAt instanceof Date
              ? n.createdAt.toISOString()
              : n.createdAt,
          fromTable: n.fromTable ? { name: n.fromTable.name } : null,
        }))
      );
    };
    fetchNotifications();
  }, []);

  // Set up socket listener for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewOrderNotification = (data: Notification) => {
      // Play sound
      notificationSound?.play().catch(console.error);

      // Add the new notification to the top of the list
      setNotifications((prev) => [data, ...prev]);

      // Show a toast
      addToast({
        // type: "info",
        title: data.title || "New Notification",
        description: data.message,
      });
    };

    // --- THIS IS THE FIX ---
    // The event name now matches the one in your server.ts file.
    const adminEvent = "new_order_notification";
    socket.on(adminEvent, handleNewOrderNotification);

    return () => {
      socket.off(adminEvent, handleNewOrderNotification);
    };
    // --- END OF FIX ---
  }, [socket, notificationSound]);

  // ... (rest of the component is the same)

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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      // Optimistically update the UI
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      // Call the server action
      markAsReadAction(notification.id);
    }
    setIsOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in duration-150">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start p-3 gap-3 cursor-pointer hover:bg-gray-50 ${
                    !notification.isRead ? "bg-primary-50" : ""
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
                    <p className="text-sm text-gray-700">
                      {notification.message}{" "}
                      {notification.fromTable && (
                        <span className="font-semibold">
                          from Table {notification.fromTable.name}
                        </span>
                      )}
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
                <p>You have no notifications.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
