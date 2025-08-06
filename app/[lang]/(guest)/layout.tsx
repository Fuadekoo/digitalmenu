"use client";
import React from "react";
import NavbarComponent from "@/components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavbarComponent />
      {children}
    </div>
  );
}
