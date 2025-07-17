"use client";
import Footer from "@/components/footer";
import React, { useState } from "react";
import { Input } from "@heroui/react";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";

function Page() {
  const catagoryData = [
    { id: 1, cname: "Category 1", photo: "/fu.jpg" },
    { id: 2, cname: "Category 2", photo: "/fu.jpg" },
    { id: 2, cname: "Category 2", photo: "/fu.jpg" },
    { id: 2, cname: "Category 2", photo: "/fu.jpg" },
    { id: 3, cname: "Category 3", photo: "/fu.jpg" },
    { id: 4, cname: "Category 4", photo: "/fu.jpg" },
    { id: 5, cname: "Category 5", photo: "/fu.jpg" },
    { id: 6, cname: "Category 6", photo: "/fu.jpg" },
    { id: 7, cname: "Category 7", photo: "/fu.jpg" },
    { id: 8, cname: "Category 8", photo: "/fu.jpg" },
    { id: 9, cname: "Category 9", photo: "/fu.jpg" },
    { id: 10, cname: "Category 10", photo: "/fu.jpg" },
  ];

  const food = [
    { id: 1, name: "Pizza", price: 12.99, photo: "/fu.jpg" },
    { id: 2, name: "Burger", price: 9.99, photo: "/fu.jpg" },
    { id: 3, name: "Pasta", price: 11.49, photo: "/fu.jpg" },
    { id: 4, name: "Salad", price: 7.99, photo: "/fu.jpg" },
    { id: 5, name: "Sushi", price: 15.99, photo: "/fu.jpg" },
  ];

  const carouselItems = [
    { id: 1, content: "f", photo: "/fu.jpg" },
    { id: 2, content: "u", photo: "/fu.jpg" },
    { id: 3, content: "n", photo: "/fu.jpg" },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) =>
        prev === carouselItems.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);
  const nextSlide = () => {
    setActiveIndex((prev) =>
      prev === carouselItems.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setActiveIndex((prev) =>
      prev === 0 ? carouselItems.length - 1 : prev - 1
    );
  };
  return (
    <div className="w-dvw h-dvh">
      <div className="mb-4 flex items-center">
        <Input
          type="text"
          placeholder="Search categories..."
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="relative overflow-hidden rounded-2xl shadow-lg mb-6">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {carouselItems.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-full h-60 flex items-center justify-center relative"
            >
              <img
                src={item.photo}
                alt={`Slide ${item.id}`}
                className="object-cover w-full h-full rounded-2xl"
              />
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-lg font-semibold">
                {item.content}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/60 hover:bg-white/90 rounded-full p-2 z-10 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-gray-800" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/60 hover:bg-white/90 rounded-full p-2 z-10 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-gray-800" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                activeIndex === index ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="overflow-hidden">
        {/* <div className="grid grid-cols-2 justify-between  gap-1">
          <h1>Category</h1>
          <h1>View All</h1>
        </div> */}
        <div className="flex gap-4 overflow-x-auto pb-2 ">
          {catagoryData.map((cat) => (
            <div
              key={cat.id}
              className="m-2 flex-shrink-0 flex flex-col items-center w-20 gap-1"
            >
              <div className=" rounded-full overflow-hidden w-24 h-24 bg-primary-600 flex items-center justify-center">
                <img
                  src={cat.photo}
                  alt={cat.cname}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="mt-2 text-center">{cat.cname}</span>
            </div>
          ))}
        </div>
      </div>

      {/* thsi is rthe second x-scrol */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="font-bold text-lg text-blue-700">Special Offers</h1>
          <button className="px-3 py-1 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition">
            Go
          </button>
        </div>
        <div className="bg-white/100 flex gap-4 overflow-x-auto pb-2">
          {catagoryData.map((cat) => (
            <div
              key={cat.id}
              className="border-3 border-black rounded-xl bg-white/100 m-4 flex-shrink-0 flex flex-col items-center w-60 h-60 gap-2"
            >
              <div className="overflow-hidden bg-primary-600 flex items-center justify-center w-full h-full">
                <img
                  src={cat.photo}
                  alt={cat.cname}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="mt-2 text-center">{cat.cname}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-2 py-4">
        <h1 className="text-2xl font-bold text-gray-800">
          All Restaurants Food
        </h1>
        {/* <span className="text-sm text-gray-500">Browse delicious meals from all categories</span> */}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 m-2">
        {food.map((item) => (
          <div
            key={item.id}
            className="border-2 border-blue-500 rounded-xl h-60 p-4 flex flex-col justify-between"
          >
            <div className="w-full h-32 overflow-hidden flex items-center justify-center">
              <img
                src={item.photo}
                alt={item.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="w-20 h-16  overflow-hidden">
                <h2 className="text-lg font-semibold mb-1">{item.name}</h2>
                <p className="text-sm text-primary-700 mb-1">
                  <span className="font-medium">Price:</span> ${item.price}
                </p>
              </div>
              <button className="ml-2 px-1 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                <PlusCircle />
              </button>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Page;
