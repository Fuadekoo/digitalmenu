import React from "react";
import { customerAuth } from "@/actions/customer/clientauth";
import UserLayout from "@/components/userLayout";
import { redirect } from "next/navigation";
import { Home, Package, CreditCard, User, ShoppingBasket } from "lucide-react";
import LocationPopup from "@/components/LocationPopup";
import Footer from "@/components/footer";
// import CustomerSocketHandler from "@/components/CustomerSocketHandler";
import { SocketProvider } from "@/components/SocketProvider";
import TableSocketRegistrar from "@/components/TableSocketRegistrar";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string; passcode: string; tid: string }>;
}) {
  const { passcode, lang, tid } = await params;

  // Define menu inside the function to access params
  const menu = [
    {
      label: "Home",
      url: `/${passcode}/${tid}/home`,
      icon: <Home size={18} />,
    },
    {
      label: "My Orders",
      url: `/${passcode}/${tid}/myorders`,
      icon: <ShoppingBasket size={18} />,
    },
    {
      label: "About",
      url: `/${passcode}/${tid}/about`,
      icon: <User size={18} />,
    },
  ];

  // Check customer auth using passcode and tid from URL
  const isAuth = await customerAuth(passcode, tid);
  if (!isAuth) {
    redirect("/en/forbidden");
  }

  const isManager = false;

  return (
    <div className="overflow-hidden h-svh w-svw">
      <UserLayout menu={menu} isManager={isManager}>
        {/* <LocationPopup /> */}
        <SocketProvider tableId={tid}>
          <TableSocketRegistrar />
          {children}
        </SocketProvider>
        {/* <Footer /> */}
      </UserLayout>
    </div>
  );
}
