"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { useSocket } from "@/components/SocketProvider";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/actions/admin/notifications";
import useAction from "@/hooks/useActions";
import { addToast } from "@heroui/toast";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  fromTable: {
    name: string;
  } | null;
};

const NotificationBell = () => {
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Actions
  const [, markAsReadAction] = useAction(markNotificationAsRead, [, () => {}]);
  const [, markAllAction] = useAction(markAllNotificationsAsRead, [, () => {}]);
  const [notificationResponse, refreshNotification, isLoadingNotification] =
    useAction(getNotifications, [true, () => {}]);

  // Memoize notifications array
  const notifications: Notification[] = useMemo(
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
            fromTable: n.fromTable || null,
          }))
        : [],
    [notificationResponse]
  );

  // Memoize unread notifications and IDs
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications]
  );
  const unreadCount = unreadNotifications.length;
  const unreadIds = useMemo(
    () => unreadNotifications.map((n) => n.id),
    [unreadNotifications]
  );

  // Refresh notifications when bell is clicked
  const handleBellClick = async () => {
    await refreshNotification();
    setIsOpen((prev) => !prev);
  };

  // "Mark all as read" handler
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unreadIds.length > 0) {
      await markAllAction(unreadIds);
      await refreshNotification();
    }
  };

  // Listen for real-time new order notifications (uncomment and adjust event name as needed)
  useEffect(() => {
    if (!socket) return;

    const handleNewOrderNotification = (data: Notification) => {
      addToast({
        title: data.title || "New Notification",
        description: data.message,
      });
      refreshNotification();
    };

    socket.on("new_order_notification", handleNewOrderNotification);

    return () => {
      socket.off("new_order_notification", handleNewOrderNotification);
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadAction(notification.id);
      refreshNotification();
    }
    // setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-0 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in duration-150">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
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
                    {notification.fromTable?.name && (
                      <p className="text-xs text-gray-400">
                        Table: {notification.fromTable.name}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>You have no new notifications.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
