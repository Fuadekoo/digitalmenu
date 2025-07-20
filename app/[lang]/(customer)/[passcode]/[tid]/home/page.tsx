"use client";
import Footer from "@/components/footer";
import React, { useState } from "react";
import { Input } from "@heroui/react";
import { ChevronLeft, ChevronRight, PlusCircle, Search } from "lucide-react";
import useAction from "@/hooks/useActions";
import {
  getPromotion,
  allFood,
  categoryListFood,
  specialOffers,
} from "@/actions/customer/home";
import Link from "next/link";

// --- Reusable Components for Loading/Empty States ---

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-10 text-gray-500">{message}</div>
);

function Page() {
  const [search, setSearch] = useState("");
  const [promotionData, , isLoadingPromotion] = useAction(getPromotion, [
    true,
    () => {},
  ]);
  const [categoryData, , isLoadingCategory] = useAction(categoryListFood, [
    true,
    () => {},
  ]);
  const [specialOfferData, , isLoadingSpecialOffers] = useAction(
    specialOffers,
    [true, () => {}]
  );
  const [allFoodData, , isLoadingAllFood] = useAction(allFood, [
    true,
    () => {},
  ]);

  const [activeIndex, setActiveIndex] = useState(0);

  // Carousel auto-scroll effect
  React.useEffect(() => {
    if (!promotionData || promotionData.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) =>
        prev === promotionData.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(timer);
  }, [promotionData]);

  const nextSlide = () => {
    if (!promotionData) return;
    setActiveIndex((prev) =>
      prev === promotionData.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    if (!promotionData) return;
    setActiveIndex((prev) =>
      prev === 0 ? promotionData.length - 1 : prev - 1
    );
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gray-50">
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search for food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </div>

      {/* --- Promotions Carousel --- */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg mb-6 h-60">
        {isLoadingPromotion ? (
          <SkeletonLoader className="w-full h-full" />
        ) : promotionData && promotionData.length > 0 ? (
          <>
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {promotionData.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-full h-full relative"
                >
                  <img
                    src={item.photo}
                    alt={item.title ?? "Promotion"}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/60 hover:bg-white/90 rounded-full p-2 z-10"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/60 hover:bg-white/90 rounded-full p-2 z-10"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        ) : (
          <EmptyState message="No promotions available right now." />
        )}
      </div>

      {/* --- Categories Section --- */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          <Link
            href="/categories"
            className="text-sm font-semibold text-primary-600"
          >
            View All
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {isLoadingCategory
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex flex-col items-center w-24 gap-2"
                >
                  <SkeletonLoader className="w-20 h-20 rounded-full" />
                  <SkeletonLoader className="w-16 h-4" />
                </div>
              ))
            : categoryData?.map((cat) => (
                <div
                  key={cat.id}
                  className="flex-shrink-0 flex flex-col items-center w-24 gap-2 text-center"
                >
                  <img
                    src={cat.photo ?? "/default-category.png"}
                    alt={cat.cname}
                    className="w-20 h-20 object-cover rounded-full shadow-md"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {cat.cname}
                  </span>
                </div>
              ))}
        </div>
      </div>

      {/* --- Special Offers Section --- */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 px-1">
          Special Offers
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {isLoadingSpecialOffers
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64">
                  <SkeletonLoader className="h-48 rounded-xl" />
                </div>
              ))
            : specialOfferData?.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-lg font-bold text-primary-600">
                      ${item.price}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* --- All Food Section --- */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2 px-1">All Food</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoadingAllFood
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-2">
                  <SkeletonLoader className="h-32 rounded-lg mb-2" />
                  <SkeletonLoader className="w-3/4 h-5 mb-1" />
                  <SkeletonLoader className="w-1/2 h-4" />
                </div>
              ))
            : allFoodData?.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md flex flex-col"
                >
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-t-xl"
                  />
                  <div className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 truncate">
                        {item.name}
                      </h3>
                      <p className="text-lg font-bold text-primary-600">
                        ${item.price}
                      </p>
                    </div>
                    <button className="mt-2 w-full bg-primary-500 text-white rounded-lg py-1.5 text-sm font-semibold hover:bg-primary-600 transition flex items-center justify-center gap-1">
                      <PlusCircle size={16} /> Add
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Page;
