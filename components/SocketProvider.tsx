"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import io, { Socket } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { addToast } from "@heroui/toast";

export const SocketContext = createContext<{ socket: typeof Socket | null }>({
  socket: null,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context.socket;
};

// This single provider handles connections for both Admins and Customers.
export function SocketProvider({
  children,
  userId,
  tableId,
}: {
  children: React.ReactNode;
  userId?: string; // Optional: for admin/waiter
  tableId?: string; // Optional: for customer
}) {
  // useMemo creates the socket instance only ONCE, preventing reconnections on re-renders.
  const socket = useMemo(() => {
    // Only connect if we have an identifier (userId or tableId)
    if (!userId && !tableId) return null;

    return io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      // Send authentication details if they exist
      auth: {
        id: userId,
        tableId: tableId,
      },
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }, [userId, tableId]);

  useEffect(() => {
    if (!socket) return;

    // --- Define all event handlers ---
    const onConnect = () => {
      console.log("Socket connected persistently with ID:", socket.id);
      // If it's a customer, register the table
      if (tableId) {
        socket.emit("register_table_socket", { tableId });
      }
    };

    const onDisconnect = (reason: string) => {
      console.log("Socket disconnected. Reason:", reason);
      if (reason === "io server disconnect") {
        // Attempt to reconnect
        socket.connect();
      }
    };

    // Handler for new order notifications (for Admin)
    const onNewOrderNotification = (order: any) => {
      const audio = new Audio("/sounds/notification.mp3");
      audio
        .play()
        .catch((error) => console.error("Audio playback failed:", error));
      toast.success(
        `New Order #${order.orderCode?.slice(-5)} from Table ${
          order.table?.name
        }`,
        { duration: 8000, position: "top-right", icon: "🔔" }
      );
    };

    // Handler for order status updates (for Customer)
    const onOrderStatusUpdate = (order: any) => {
      if (order.status === "confirmed") {
        addToast({
          title: "Order Confirmed!",
          description: `Your order #${order.orderCode.slice(
            -5
          )} has been confirmed.`,
          //   type: "success",
        });
      }
    };

    // --- Attach event listeners ---
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_order_notification", onNewOrderNotification);
    socket.on("order_status_update", onOrderStatusUpdate);

    // --- Cleanup on unmount (when user logs out or closes tab) ---
    return () => {
      //   console.log("Cleaning up persistent socket connection.");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_order_notification", onNewOrderNotification);
      socket.off("order_status_update", onOrderStatusUpdate);
      //   socket.off('all')
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {/* Render both Toaster types to support both libraries */}
      {/* <Toaster /> */}
      {children}
    </SocketContext.Provider>
  );
}
