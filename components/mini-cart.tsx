"use client";

import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Loader2 } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { addToast } from "@heroui/toast";
import { useParams } from "next/navigation";
import { useSocket } from "@/components/SocketProvider";
import useGuestSession from "@/hooks/useGuestSession"; // Import the hook to get the user's unique session ID
// --- THIS IS THE FIX (Part 1) ---
// Import the hook to get the user's unique session ID.
// import { useGuestSession } from "@/hooks/useGuestSession";
// --- END OF FIX (Part 1) ---

function MiniCart() {
  const { items, totalPrice, totalItems, clearCart, addOrderId, isHydrated } =
    useCart();
  const params = useParams();
  const socket = useSocket();
  const [isLoading, setIsLoading] = useState(false);
  // --- THIS IS THE FIX (Part 2) ---
  // Get the guestId from our cookies
  const guestId = useGuestSession();
  // --- END OF FIX (Part 2) ---

  const successAudio = useMemo(() => {
    if (typeof window !== "undefined") {
      return new Audio("/sound/notice.wav");
    }
    return null;
  }, []);

  useEffect(() => {
    if (!socket || !successAudio) return;

    interface OrderSuccessPayload {
      orderCode: string;
      [key: string]: any;
    }

    const handleOrderSuccess = (order: OrderSuccessPayload) => {
      setIsLoading(false);
      successAudio?.play().catch((error: unknown) => {
        console.error("Audio playback failed:", error);
      });
      addToast({
        title: "Order Created",
        description: "Your order has been successfully created!",
      });
      addOrderId(order.orderCode);
      clearCart();
    };

    const handleOrderError = (error: { message: string }) => {
      setIsLoading(false);
      addToast({
        title: "Order Error",
        description: error.message || "There was an error creating your order.",
      });
    };

    socket.on("order_created_successfully", handleOrderSuccess);
    socket.on("order_error", handleOrderError);

    return () => {
      socket.off("order_created_successfully", handleOrderSuccess);
      socket.off("order_error", handleOrderError);
    };
  }, [socket, clearCart, addOrderId, successAudio]);

  const handleCreateOrder = () => {
    // Add guestId and isHydrated to the check to prevent sending invalid data.
    if (!isHydrated || isLoading || items.length === 0 || !socket || !guestId) {
      console.error("Order creation blocked. Missing data:", {
        isHydrated,
        isLoading,
        itemCount: items.length,
        socket: !!socket,
        guestId,
      });
      return;
    }

    setIsLoading(true);

    const orderData = {
      totalPrice,
      tableId: params.tid as string,
      // --- THIS IS THE FIX (Part 3) ---
      // Add the guestId to the data payload sent to the server.
      guestId: guestId,
      // --- END OF FIX (Part 3) ---
      cartItems: items.map((item) => ({
        productId: item.id as string,
        quantity: item.quantity as number,
        price: item.price as number,
      })),
    };

    socket.emit("create_order", orderData);
  };

  // Do not render the cart at all until it has been hydrated from storage.
  if (!isHydrated || !items || items.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50 animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-gray-800/90 backdrop-blur-sm text-white rounded-xl shadow-lg p-3 flex items-center justify-between gap-4">
        <div className="relative">
          <ShoppingCart className="h-8 w-8 text-white" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </div>

        <div className="flex-grow text-center">
          <p className="text-lg font-bold">{totalPrice.toFixed(2)} Br</p>
        </div>

        <button
          onClick={handleCreateOrder}
          disabled={isLoading || !socket || !guestId} // Also disable button if guestId is missing
          className="bg-white text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-gray-200 transition-colors flex items-center justify-center w-28 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

export default MiniCart;
