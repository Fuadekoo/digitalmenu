"use client";
import React from "react";
import { listProductByCategory } from "@/actions/customer/home";
import useAction from "@/hooks/useActions";
import MiniCart from "@/components/mini-cart";
import { ArrowLeft } from "lucide-react";
import { useCart, CartItem } from "@/hooks/useCart";
import { Minus, Plus, PlusCircle } from "lucide-react";
import Image from "next/image";
const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

// --- Add to Cart Button Component ---
function AddToCartButton({ item }: { item: CartItem }) {
  const { items, addItem, updateItemQuantity } = useCart();
  const cartItem = items.find((i) => i.id === item.id);

  return (
    <button
      className="bg-primary-600 text-white px-3 py-1 rounded mt-2"
      onClick={() => {
        if (cartItem) {
          updateItemQuantity(item.id, cartItem.quantity + 1);
        } else {
          addItem({ ...item });
        }
      }}
    >
      {cartItem ? (
        <>
          <Minus
            className="inline-block mr-1"
            onClick={(e) => {
              e.stopPropagation();
              updateItemQuantity(item.id, cartItem.quantity - 1);
            }}
          />
          {cartItem.quantity}
          <Plus
            className="inline-block ml-1"
            onClick={(e) => {
              e.stopPropagation();
              updateItemQuantity(item.id, cartItem.quantity + 1);
            }}
          />
        </>
      ) : (
        <>
          <PlusCircle className="inline-block mr-1" />
          Add to Cart
        </>
      )}
    </button>
  );
}

interface ProductPerCategoryIdProps {
  categoryId: string;
  onBack: () => void;
}

function ProductPerCategoryId({
  categoryId,
  onBack,
}: ProductPerCategoryIdProps) {
  const [productsData, , isLoadingProducts] = useAction(
    listProductByCategory,
    [true, () => {}],
    categoryId
  );

  return (
    <div>
      <button onClick={onBack}>
        <ArrowLeft /> <span>Back</span>
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {isLoadingProducts ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-2">
              <SkeletonLoader className="h-32 rounded-lg mb-2" />
              <SkeletonLoader className="w-3/4 h-5 mb-1" />
              <SkeletonLoader className="w-1/2 h-4" />
            </div>
          ))
        ) : productsData && productsData.length > 0 ? (
          productsData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md flex flex-col"
            >
              <Image
                src={`/api/filedata/${item.photo}`}
                alt={item.name}
                width={400}
                height={128}
                className="w-full h-32 object-cover rounded-t-xl"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
              <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 truncate">
                    {item.name}
                  </h3>
                  <p className="text-lg font-bold text-primary-600">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <AddToCartButton item={item} />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-red-500 py-10">
            No product found.
            <div className="flex justify-center mt-6">
              <Image
                src="/coming-soon.png"
                alt="No products"
                width={160}
                height={160}
                className="w-40 h-40 object-contain animate-bounce"
                priority={false}
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
      <MiniCart />
    </div>
  );
}

export default ProductPerCategoryId;
