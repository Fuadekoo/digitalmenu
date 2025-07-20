"use client";
import React, { useState } from "react";
import { X, FileText, ShoppingBag, Loader2 } from "lucide-react";
import useAction from "@/hooks/useActions";
import { gateOrderIds } from "@/actions/customer/myorder"; // Ensure this action exists and accepts an array of IDs
import { useCart } from "@/hooks/useCart"; // To get order IDs from localStorage

// --- Interfaces for our data structures (matching Prisma schema) ---
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  table: {
    name: string;
  };
  totalPrice: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  orderItems: OrderItem[];
}

// --- Helper to get status color ---
const getStatusClass = (status: Order["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function Page() {
  const { orderIds } = useCart(); // Get the list of order IDs from the cart store
  console.log("Order IDs from cart:", orderIds);
  // Pass the orderIds array to the useAction hook to fetch the data
  const [orderdata, refresh, isLoadingOrder] = useAction(
    gateOrderIds,
    [true, () => {}],
    orderIds
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      {/* Loading State */}
      {isLoadingOrder && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="ml-4 text-gray-600">Loading your orders...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingOrder && (!orderdata || orderdata.length === 0) && (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No orders found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't placed any orders yet.
          </p>
        </div>
      )}

      {/* Orders List */}
      {!isLoadingOrder && orderdata && orderdata.length > 0 && (
        <div className="space-y-4">
          {orderdata.map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-500">Order Code</p>
                  <p className="text-gray-900 font-bold">
                    #
                    {(order.orderCode ?? order.id)
                      .substring(0, 8)
                      .toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Table Number</p>
                  <p className="text-gray-900">{order.table?.tNumber}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Total</p>
                  <p className="text-gray-900 font-bold">
                    ${order.totalPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(
                      order.status as "pending" | "completed" | "cancelled"
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full sm:w-auto bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in-0 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Order Details
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="mb-6 border-b pb-4 text-sm text-gray-600">
              <p>
                <strong>Order Code:</strong> #
                {selectedOrder.id.substring(0, 8).toUpperCase()}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Items</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {selectedOrder.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <p className="text-gray-700 flex-1">{item.product.name}</p>
                  <p className="text-gray-500 w-20 text-center">
                    {item.quantity} x ${item.price.toFixed(2)}
                  </p>
                  <p className="font-semibold text-gray-800 w-20 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t mt-6 pt-4 flex justify-end">
              <p className="text-xl font-bold text-gray-900">
                Total: ${selectedOrder.totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
