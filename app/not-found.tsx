"use client";
import React from "react";
import { UtensilsCrossedIcon } from "lucide-react";
import { useRouter } from "next/navigation";

function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-red-900 flex flex-col justify-center items-center text-white font-sans px-4">
      <div className="flex items-center justify-center text-[80px] md:text-[100px] font-bold gap-6 mb-10">
        <span>4</span>
        <span className="bg-white text-red-900 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
          0
        </span>
        <span>4</span>
      </div>
      <p className="text-2xl md:text-3xl font-semibold mb-2">
        Whoops, nothing delicious to find here.
      </p>
      <div className="my-2"></div>
      <UtensilsCrossedIcon className="w-10 h-10 mx-auto text-white" />
      <p className="text-base md:text-lg mb-8 max-w-lg text-center text-white/90">
        Seems like the page you were trying to find is no longer available.
      </p>
      <div className="flex gap-4">
        <button
          className="bg-white text-red-900 px-6 py-2 rounded-md font-bold shadow hover:bg-red-100 transition"
          onClick={() => router.push("/")}
        >
          GO HOME
        </button>
        <button
          className="bg-white text-red-900 px-6 py-2 rounded-md font-bold shadow hover:bg-red-100 transition"
          onClick={() => router.back()}
        >
          BACK
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
