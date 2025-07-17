"use client";
import React from "react";

const cardData = [
  {
    title: "Total Task",
    value: "08",
    percent: "↑ 25%",
    desc: "Less than last week",
  },
  {
    title: "Completed",
    value: "05",
    percent: "↑ 10%",
    desc: "More than last week",
  },
  {
    title: "Pending",
    value: "03",
    percent: "↓ 5%",
    desc: "Less than last week",
  },
  {
    title: "Overdue",
    value: "01",
    percent: "↑ 2%",
    desc: "More than last week",
  },
];

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg shadow p-4 flex flex-col items-start"
        >
          <div className="text-lg font-semibold">{card.title}</div>
          <div className="text-2xl font-bold mt-2">{card.value}</div>
          <div className="text-sm text-green-600 mt-1">{card.percent}</div>
          <div className="text-xs text-gray-500 mt-2">{card.desc}</div>
        </div>
      ))}
    </div>
  );
}
