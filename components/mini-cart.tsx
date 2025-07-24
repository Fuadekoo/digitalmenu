"use client";

import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Loader2 } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import { addToast } from "@heroui/toast";
import { useParams } from "next/navigation";
import { useSocket } from "@/components/SocketProvider";

/**
 * A floating mini-cart component that appears at the bottom of the screen
 * when items are in the cart.
 */
function MiniCart() {
  const { items, totalPrice, totalItems, clearCart, addOrderId } = useCart();
  const params = useParams();
  const socket = useSocket();

  const [isLoading, setIsLoading] = useState(false);

  // --- THIS IS THE FIX (Part 1) ---
  // Create the Audio object once using useMemo. This is more efficient.
  // Make sure the file exists at 'public/sound/notice.wav'
  const successAudio = useMemo(() => {
    // Ensure this code only runs on the client where 'window' is available
    if (typeof window !== "undefined") {
      return new Audio("/sound/notice.wav");
    }
    return null;
  }, []);
  // --- END OF FIX (Part 1) ---

  useEffect(() => {
    if (!socket || !successAudio) return;

    // Listen for a success event from the server
    const handleOrderSuccess = (order: any) => {
      setIsLoading(false);

      // Play the sound that was prepared earlier
      successAudio.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });

      addToast({
        title: "Order Created",
        description: "Your order has been successfully created!",
        // type: "success", // Re-enabled for correct styling
      });
      addOrderId(order.orderCode);
      clearCart();
    };

    // Listen for an error event from the server
    const handleOrderError = (error: { message: string }) => {
      setIsLoading(false);
      addToast({
        title: "Order Error",
        description: error.message || "There was an error creating your order.",
        // type: "error", // Re-enabled for correct styling
      });
    };

    socket.on("order_created_successfully", handleOrderSuccess);
    socket.on("order_error", handleOrderError);

    // Cleanup listeners when the component unmounts
    return () => {
      socket.off("order_created_successfully", handleOrderSuccess);
      socket.off("order_error", handleOrderError);
    };
  }, [socket, clearCart, addOrderId, successAudio]);

  const handleCreateOrder = () => {
    if (isLoading || items.length === 0 || !socket || !successAudio) return;

    // --- THIS IS THE FIX (Part 2) ---
    // "Prime" the audio by playing and immediately pausing it during the user's click event.
    // This satisfies the browser's user interaction requirement.
    successAudio.play();
    successAudio.pause();
    // --- END OF FIX (Part 2) ---

    setIsLoading(true);

    const orderData = {
      totalPrice,
      tableId: params.tid as string,
      cartItems: items.map((item) => ({
        productId: item.id as string,
        quantity: item.quantity as number,
        price: item.price as number,
      })),
    };

    socket.emit("create_order", orderData);
  };

  if (!items || items.length === 0) {
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
          disabled={isLoading || !socket}
          className="bg-white text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-gray-200 transition-colors flex items-center justify-center w-28 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

export default MiniCart;
