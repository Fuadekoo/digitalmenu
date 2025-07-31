"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Bell, CheckCircle } from "lucide-react";
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

  // Actions
  const [markResponse, markAction, markAsReadAction] = useAction(
    markCustomerNotificationAsRead,
    [, () => {}]
  );
  const [allMarkResponse, allMarkAction, allMarkAsReadAction] = useAction(
    allMarkCustomerNotificationAsRead,
    [, () => {}]
  );
  const [notificationResponse, refreshNotification, isLoadingNotification] =
    useAction(getCustomerNotifications, [true, () => {}], tid);

  // Memoize notifications array
  const notifications: CustomerNotification[] = useMemo(
    () =>
      Array.isArray(notificationResponse)
        ? notificationResponse.map((n: any) => ({
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

  // Refresh notifications when bell is clicked
  const handleBellClick = async () => {
    await refreshNotification();
    setIsOpen((prev) => !prev);
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

    const handleSocketNotification = (order: any) => {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-0 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
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
            {notifications.length > 0 ? (
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
