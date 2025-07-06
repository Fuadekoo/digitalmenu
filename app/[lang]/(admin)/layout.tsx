import React from "react";
import { auth } from "@/lib/auth";
import UserLayout from "@/components/userLayout";
import { redirect } from "next/navigation";
import {
  Home,
  User,
  CreditCard,
  Package,
  ShoppingCart,
  Folder,
  Settings,
} from "lucide-react";

const menu = [
  { label: "Dashboard", url: "dashboard", icon: <Home size={18} /> },
  { label: "Customers", url: "customer", icon: <User size={18} /> },
  {
    label: "Customer Support",
    url: "support",
    icon: <User size={18} />,
  },
  { label: "Payments", url: "payment", icon: <CreditCard size={18} /> },
  // { label: "Orders", url: "order", icon: <Package size={18} /> },
  { label: "Profit Cards", url: "profit", icon: <Package size={18} /> },
  { label: "Product", url: "product", icon: <ShoppingCart size={18} /> },
  // { label: "Categories", url: "categories", icon: <Folder size={18} /> },
  { label: "Notifications", url: "notification", icon: <Folder size={18} /> },
  { label: "Profile", url: "profile", icon: <User size={18} /> },
  { label: "Settings", url: "settings", icon: <Settings size={18} /> },
];

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // if the login user is not admin then redirect to page is forbideen page or 404 page
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/en/forbidden");
  }

  const isManager = true;

  return (
    <div className="overflow-hidden h-svh w-svw">
      <UserLayout menu={menu} isManager={isManager}>
        {children}
      </UserLayout>
    </div>
  );
}
