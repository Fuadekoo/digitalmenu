"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";

interface CartItemType {
  id: number;
  name: string;
  price: number;
  photo: string;
  quantity: number;
}
// Sample data for cart items
const sampleCartItems = [
  {
    id: 1,
    name: "Char-Grilled Filet Mignon",
    price: 380.0,
    photo: "/fu.jpg", // Replace with your actual image path
    quantity: 1,
  },
  {
    id: 2,
    name: "Classic Burger",
    price: 150.5,
    photo: "/fu.jpg", // Replace with your actual image path
    quantity: 2,
  },
];

// A reusable component for a single item in the cart

interface CartItemProps {
  item: CartItemType;
  onRemove: (itemId: number) => void;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
}

function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const totalItemPrice = (item.price * quantity).toFixed(2);

  return (
    <div className="flex items-center bg-white rounded-xl shadow-lg p-3 gap-4 my-4">
      {/* Image */}
      <div className="flex-shrink-0">
        <Image
          src={item.photo}
          alt={item.name}
          width={80}
          height={80}
          className="rounded-lg object-cover"
        />
      </div>

      {/* Details and Quantity */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-md">{item.name}</h3>
          <p className="text-sm text-gray-500">
            Price per 1: ${item.price.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleDecrease}
            className="bg-gray-200 rounded-full p-1.5 hover:bg-gray-300 transition-colors"
          >
            <Minus size={16} className="text-gray-700" />
          </button>
          <span className="font-semibold text-lg">{quantity}</span>
          <button
            onClick={handleIncrease}
            className="bg-gray-200 rounded-full p-1.5 hover:bg-gray-300 transition-colors"
          >
            <Plus size={16} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Price and Delete */}
      <div className="flex flex-col items-end justify-between h-full">
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={20} />
        </button>
        <p className="font-bold text-lg text-gray-800">${totalItemPrice}</p>
      </div>
    </div>
  );
}

function Page() {
  const [cartItems, setCartItems] = useState(sampleCartItems);

  interface CartItemType {
    id: number;
    name: string;
    price: number;
    photo: string;
    quantity: number;
  }

  interface CartItemProps {
    item: CartItemType;
    onRemove: (itemId: number) => void;
    onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  }

  const handleRemoveItem = (itemId: number) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold mb-2">Items List</h1>
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onRemove={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
          />
        ))}
      </div>
      <div className="mt-8">
        <h1 className="text-2xl font-bold">Order Summary</h1>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Total Pay:</span>
            <span>
              $
              {cartItems
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tax Fee (0%):</span>
            {/* <span>$0.00</span> */}
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-800 pt-2 border-t">
            <span>Total Price:</span>
            <span>
              $
              {cartItems
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <button className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors">
          Checkout Order
        </button>
      </div>
    </div>
  );
}

export default Page;
