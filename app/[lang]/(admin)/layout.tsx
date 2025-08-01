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
  Settings,
} from "lucide-react";
// import AdminSocketHandler from "@/components/AdminSocketHandler";
import { SocketProvider } from "@/components/SocketProvider";

const menu = [
  { label: "Dashboard", url: "dashboard", icon: <Home size={18} /> },
  { label: "Category", url: "category", icon: <User size={18} /> },
  {
    label: "Products",
    url: "products",
    icon: <User size={18} />,
  },
  { label: "Tables", url: "tables", icon: <CreditCard size={18} /> },
  { label: "Waiters", url: "waiters", icon: <Package size={18} /> },
  { label: "Orders", url: "orders", icon: <ShoppingCart size={18} /> },
  // { label: "Notifications", url: "notification", icon: <Folder size={18} /> },
  // { label: "Profile", url: "profile", icon: <User size={18} /> },
  { label: "Settings", url: "settings", icon: <Settings size={18} /> },
];

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // if the login user is not admin then redirect to page is forbideen page or 404 page
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/en/forbidden");
  }

  const isManager = true;

  return (
    <div className="overflow-hidden h-svh w-svw">
      <UserLayout menu={menu} isManager={isManager}>
        <SocketProvider userId={session.user.id}>{children}</SocketProvider>
      </UserLayout>
    </div>
  );
}
