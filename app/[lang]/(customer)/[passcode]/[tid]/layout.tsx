import React from "react";
import { customerAuth } from "@/actions/customer/clientauth";
import UserLayout from "@/components/userLayout";
import { redirect } from "next/navigation";
import { Home, Package, CreditCard, User } from "lucide-react";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { passcode: string; tid: string };
}) {
  // Define menu inside the function to access params
  const menu = [
    { label: "Home", url: `${params.tid}/home`, icon: <Home size={18} /> },
    { label: "Cart", url: `${params.tid}/cart`, icon: <Package size={18} /> },
    {
      label: "Notification",
      url: `${params.tid}/notification`,
      icon: <CreditCard size={18} />,
    },
    { label: "About", url: `${params.tid}/about`, icon: <User size={18} /> },
  ];

  // Check customer auth using passcode and tid from URL
  const isAuth = await customerAuth(params.passcode, params.tid);
  if (!isAuth) {
    redirect("/en/forbidden");
  }

  const isManager = false;

  return (
    <div className="overflow-hidden h-svh w-svw">
      <UserLayout menu={menu} isManager={isManager}>
        {children}
      </UserLayout>
    </div>
  );
}