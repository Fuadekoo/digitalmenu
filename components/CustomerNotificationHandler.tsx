"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { useSocket } from "@/components/SocketProvider";
import { addToast } from "@heroui/toast";
import { formatDistanceToNow } from "date-fns";
import {
  markCustomerNotificationAsRead,
  getCustomerNotifications,
} from "@/actions/customer/notification";
import useAction from "@/hooks/useActions";
import { useParams } from "next/navigation";

// Define a type for the customer-facing notification
type CustomerNotification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const CustomerNotificationBell = () => {
  const { tableId } = useParams();
  const socket = useSocket();
  const [notifications, setNotifications] = useState<CustomerNotification[]>(
    []
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notificationSound = useMemo(() => {
    if (typeof window !== "undefined") {
      return new Audio("/sound/success.mp3"); // Customer-specific sound
    }
    return null;
  }, []);

  // Action to mark notifications as read
  const [, markAsReadAction] = useAction(markCustomerNotificationAsRead, [
    ,
    () => {},
  ]);

  // Fetch initial notifications for the customer on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (typeof tableId === "string") {
          // You will need to create this server action
          const initialNotifications = await getCustomerNotifications(tableId);
          setNotifications(
            (initialNotifications as any[]).map((n) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              isRead: n.isRead,
              createdAt:
                typeof n.createdAt === "string"
                  ? n.createdAt
                  : n.createdAt.toISOString(),
            }))
          );
        } else {
          console.warn("No valid tableId found for fetching notifications.");
        }
      } catch (error) {
        console.error("Failed to fetch customer notifications:", error);
      }
    };
    fetchNotifications();
  }, [tableId]);

  // Set up socket listener for real-time order status updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderStatusUpdate = (order: any) => {
      notificationSound?.play().catch(console.error);

      const newNotification: CustomerNotification = {
        id: order.id, // Use order ID as a unique key
        title: "Order Update!",
        message: `Your order #${order.orderCode
          .slice(-5)
          .toUpperCase()} has been ${order.status}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      // Add the new notification to the top of the list
      setNotifications((prev) => [newNotification, ...prev]);

      // Show a toast to alert the customer
      addToast({
        // type: "success",
        title: newNotification.title,
        description: newNotification.message,
      });
    };

    const customerEvent = "order_status_update";
    socket.on(customerEvent, handleOrderStatusUpdate);

    return () => {
      socket.off(customerEvent, handleOrderStatusUpdate);
    };
  }, [socket, notificationSound]);

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
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      // You will need to create this server action
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
          <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Order Updates
            </h3>
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
};

export default CustomerNotificationBell;
