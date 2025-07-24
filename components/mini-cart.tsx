"use client";

import { useCart } from "@/hooks/useCart"; // You will need a hook to manage cart state
import { ShoppingCart, Loader2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import useAction from "@/hooks/useActions";
import { addToast } from "@heroui/toast";
// import { createCustomerOrder } from "@/server";
import { createCustomerOrder } from "@/actions/customer/order"; // Adjust the import based on your project structure
import { useParams } from "next/navigation";
import { Redirect } from "next";
// import { useRouter } from "next/router";

/**
 * A floating mini-cart component that appears at the bottom of the screen
 * when items are in the cart.
 */
function MiniCart() {
  // This component assumes you have a custom hook `useCart` that provides
  // the cart's state. You'll need to implement this with Zustand, Context, or another state manager.
  const { items, totalPrice, totalItems, clearCart, addOrderId } = useCart();
  const params = useParams();
  //   const router = useRouter();

  const [createResponse, createAction, isLoadingOrder] = useAction(
    createCustomerOrder,
    [
      ,
      (response) => {
        if (response) {
          addToast({
            title: "Order Created",
            description: "Your order has been successfully created!",
          });
          addOrderId(response.orderCode);
          clearCart();
          //   Redirect(`/${params.lang}/myorder`);

          // Optionally, redirect to the order confirmation page
          // redirect(`/order/${response.orderId}`);
        } else {
          addToast({
            title: "Order Error",
            description: "There was an error creating your order.",
          });
        }
      },
    ]
  );
  const handleCreateOrder = () => {
    // Prevent action if already loading or cart is empty
    if (isLoadingOrder || items.length === 0) return;

    const orderData = {
      totalPrice,
      status: "pending", // or another appropriate status
      createdBy: "fufu", // replace 'uid' with the correct param key for user id
      tableId: params.tid as string,
      orderItems: items.map((item) => ({
        productId: item.id as string,
        quantity: item.quantity as number,
        price: item.price as number,
      })),
    };
    createAction(orderData);
  };

  // If the cart is empty, the component renders nothing.
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50 animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-gray-800/90 backdrop-blur-sm text-white rounded-xl shadow-lg p-3 flex items-center justify-between gap-4">
        {/* Cart Icon and Item Count Badge */}
        <div className="relative">
          <ShoppingCart className="h-8 w-8 text-white" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </div>

        {/* Total Price Display */}
        <div className="flex-grow text-center">
          <p className="text-lg font-bold">{totalPrice.toFixed(2)} Br</p>
        </div>

        {/* Buy Now Button */}
        <button
          onClick={handleCreateOrder}
          disabled={isLoadingOrder}
          className="bg-white text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-gray-200 transition-colors flex items-center justify-center w-28 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoadingOrder ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Buy Now"
          )}
        </button>
      </div>
    </div>
  );
}

export default MiniCart;
