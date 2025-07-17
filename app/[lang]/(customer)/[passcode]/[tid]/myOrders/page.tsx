"use client";
import React, { useState } from "react";
import { X, FileText } from "lucide-react";

// --- Interfaces for our data structures ---
interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderCode: string;
  tableName: string;
  totalPrice: number;
  status: "Pending" | "Completed" | "Cancelled";
  date: string;
  items: OrderItem[];
}

// --- Mock Data (replace with API call later) ---
const sampleOrders: Order[] = [
  {
    id: 1,
    orderCode: "ORD-2025-A4B3",
    tableName: "Table 5",
    totalPrice: 420.5,
    status: "Completed",
    date: "2025-07-16",
    items: [
      {
        id: 101,
        productName: "Char-Grilled Filet Mignon",
        quantity: 1,
        price: 380.0,
      },
      { id: 102, productName: "Sparkling Water", quantity: 1, price: 40.5 },
    ],
  },
  {
    id: 2,
    orderCode: "ORD-2025-C8D9",
    tableName: "Table 2",
    totalPrice: 180.0,
    status: "Pending",
    date: "2025-07-17",
    items: [
      { id: 201, productName: "Classic Burger", quantity: 2, price: 90.0 },
    ],
  },
  {
    id: 3,
    orderCode: "ORD-2025-E1F2",
    tableName: "Table 5",
    totalPrice: 95.0,
    status: "Cancelled",
    date: "2025-07-15",
    items: [{ id: 301, productName: "Caesar Salad", quantity: 1, price: 95.0 }],
  },
];

// --- Helper to get status color ---
const getStatusClass = (status: Order["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function Page() {
  const [orders] = useState<Order[]>(sampleOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-500">Order Code</p>
                <p className="text-gray-900 font-bold">{order.orderCode}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-500">Table</p>
                <p className="text-gray-900">{order.tableName}</p>
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
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                    order.status
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6"
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
            <div className="mb-6 border-b pb-4">
              <p>
                <strong>Order Code:</strong> {selectedOrder.orderCode}
              </p>
              <p>
                <strong>Date:</strong> {selectedOrder.date}
              </p>
            </div>
            <h3 className="text-lg font-semibold mb-3">Items</h3>
            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <p className="text-gray-700">{item.productName}</p>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                  <p className="font-semibold text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t mt-6 pt-4 flex justify-end">
              <p className="text-xl font-bold">
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
