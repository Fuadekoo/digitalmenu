"use client";
import React, { useState } from "react";
import { Bell, Tag, ShoppingCart, CheckCheck } from "lucide-react";

// --- Interfaces and Mock Data ---
interface Notification {
  id: number;
  type: "order" | "promotion" | "announcement";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const sampleNotifications: Notification[] = [
  {
    id: 1,
    type: "order",
    title: "Order Confirmed!",
    message:
      "Your order #ORD-2025-C8D9 has been confirmed and is being prepared.",
    timestamp: "15 minutes ago",
    isRead: false,
  },
  {
    id: 2,
    type: "promotion",
    title: "Weekend Special",
    message: "Get 20% off on all pizzas this weekend. Use code: PIZZA20",
    timestamp: "2 hours ago",
    isRead: false,
  },
  {
    id: 3,
    type: "order",
    title: "Order Completed",
    message: "Your order #ORD-2025-A4B3 has been delivered. Enjoy your meal!",
    timestamp: "1 day ago",
    isRead: true,
  },
  {
    id: 4,
    type: "announcement",
    title: "New Opening Hours",
    message: "We are now open until 11 PM on Fridays and Saturdays.",
    timestamp: "3 days ago",
    isRead: true,
  },
];

// --- Helper to get icon based on type ---
const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "order":
      return <ShoppingCart size={24} className="text-blue-500" />;
    case "promotion":
      return <Tag size={24} className="text-green-500" />;
    case "announcement":
      return <Bell size={24} className="text-orange-500" />;
    default:
      return <Bell size={24} className="text-gray-500" />;
  }
};

// --- Main Page Component ---
function Page() {
  const [notifications, setNotifications] =
    useState<Notification[]>(sampleNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* --- Header --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-primary-600 text-white text-sm font-bold px-3 py-1 rounded-full">
              {unreadCount} New
            </span>
          )}
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex justify-end gap-4 mb-6">
          <button
            onClick={markAllAsRead}
            className="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-2 disabled:opacity-50"
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
          <button
            onClick={clearAll}
            className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
        </div>

        {/* --- Notifications List --- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 transition-colors ${
                  !notification.isRead ? "bg-primary-50" : "bg-white"
                } ${
                  index < notifications.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-800">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {notification.timestamp}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="flex-shrink-0 mt-1">
                    <span
                      className="w-3 h-3 bg-primary-500 rounded-full block"
                      title="Unread"
                    ></span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center p-10 text-gray-500">
              <Bell size={40} className="mx-auto mb-4" />
              <h2 className="text-xl font-semibold">No Notifications</h2>
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
