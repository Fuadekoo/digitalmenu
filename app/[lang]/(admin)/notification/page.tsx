"use client";

import React, { useEffect, useState } from "react";
import { Bell, Clock } from "lucide-react";
import { getNotifications } from "@/actions/admin/notifications";
import { useSocket } from "@/components/SocketProvider";
import { Toaster } from "react-hot-toast";

// Define a type for our notification object for better type safety
type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
};

function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();

  // Effect to fetch initial notifications from the server
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      const initialNotifications = await getNotifications();
      // The type assertion is needed because the server action returns a more complex type
      setNotifications(initialNotifications as unknown as Notification[]);
      setIsLoading(false);
    };

    fetchNotifications();
  }, []);

  // Effect to listen for real-time notifications from the socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotification: any) => {
      // The sound is already played by the SocketProvider, so we just update the list
      setNotifications((prevNotifications) => [
        newNotification,
        ...prevNotifications,
      ]);
    };

    // The event name 'new_order_notification' should match what's sent from your server
    socket.on("new_order_notification", handleNewNotification);

    // Cleanup the listener when the component unmounts
    return () => {
      socket.off("new_order_notification", handleNewNotification);
    };
  }, [socket]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Bell className="mr-2" /> Notifications
      </h1>
      <div className="space-y-4">
        {isLoading ? (
          <p>Loading notifications...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-md border-l-4 ${
                notification.isRead
                  ? "bg-gray-50 border-gray-300"
                  : // New notifications will be highlighted
                    "bg-blue-50 border-blue-500 animate-in fade-in"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-lg">{notification.title}</h2>
                  <p className="text-gray-700">{notification.message}</p>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                  <Clock size={14} />
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">You have no notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationPage;
