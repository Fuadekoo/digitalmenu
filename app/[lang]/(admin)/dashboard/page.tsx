"use client";
import React from "react";
import Card from "./card";
import Graph from "./graph";

function Page() {
  return (
    <div className="overflow-y-auto p-4">
      <Card />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
        <div className="md:col-span-3 h-100 border-2 border-black rounded-xl">
          <Graph />
        </div>
        <div className="md:col-span-1 h-100 border-2 border-black rounded-xl">
          {/* <PayChart /> */}
        </div>
      </div>
    </div>
  );
}

export default Page;
