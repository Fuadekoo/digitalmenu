"use client";

import { useEffect, useMemo } from "react";
import { useSocket } from "@/components/SocketProvider";
import { addToast } from "@heroui/toast";

// This is a non-visual component. Its only job is to listen for socket events.
const CustomerNotificationHandler = () => {
  const socket = useSocket();

  const notificationSound = useMemo(() => {
    if (typeof window !== "undefined") {
      // You can use a different sound for customers if you like
      return new Audio("/sound/success.mp3");
    }
    return null;
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOrderStatusUpdate = (order: any) => {
      notificationSound?.play().catch(console.error);

      addToast({
        // type: "success",
        title: "Order Update!",
        description: `Your order #${order.orderCode
          .slice(-5)
          .toUpperCase()} has been ${order.status}.`,
      });

      // Here, you could also update your global state (Zustand, Redux, etc.)
      // to change the order status on the page without a full refresh.
    };

    const customerEvent = "order_status_update";
    socket.on(customerEvent, handleOrderStatusUpdate);

    return () => {
      socket.off(customerEvent, handleOrderStatusUpdate);
    };
  }, [socket, notificationSound]);

  // This component renders nothing.
  return null;
};

export default CustomerNotificationHandler;
