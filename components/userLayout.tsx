"use client";
import { Button } from "@heroui/button";
// import { signOut } from "next-auth/react";
import {
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
} from "@heroui/react";
import { ShoppingBasket, BellRing, LogOutIcon, UserIcon } from "lucide-react";
// import Theme from "./theme";
import { AlignLeft, ChevronLeft, ChevronRight, DoorOpen } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import useAction from "@/hooks/useActions";
// import { getUser } from "../actions/user/newUser"; // Adjust the import path as necessary
import Image from "next/image";
// import { div } from "framer-motion/client";
import { addToast } from "@heroui/toast";
import { logout } from "@/actions/common/authentication"; // Add this import
// import DateTimeDisplay from "./DateTimeDisplay";

export default function UserLayout({
  children,
  menu,
  isManager,
}: {
  children: React.ReactNode;
  menu: {
    label: string;
    url: string;
    icon: React.ReactNode;
  }[];
  isManager?: boolean;
}) {
  const [sidebar, setSidebar] = useState(false);
  return (
    <div className="grid lg:grid-cols-[auto_1fr] overflow-hidden h-screen">
      <Sidebar {...{ sidebar, setSidebar, menu, isManager }} />
      <div className="grid grid-rows-[auto_1fr] gap-2 overflow-hidden">
        <Header sidebar={sidebar} setSidebar={setSidebar} />
        <div className="p-2 rounded-xl overflow-y-auto grid">{children}</div>
      </div>
    </div>
  );
}

function Sidebar({
  sidebar,
  setSidebar,
  menu,
}: // isManager,
{
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  menu: {
    label: string;
    url: string;
    icon: React.ReactNode;
  }[];
  isManager?: boolean;
}) {
  const pathname = usePathname() ?? "",
    [, lang, role, selected] = pathname.split("/");

  return (
    <aside
      className={cn(
        "z-50 relative accent3 grid grid-cols-[auto_1fr] overflow-hidden",
        sidebar ? "max-lg:absolute max-lg:inset-0 " : "max-lg:hidden"
      )}
    >
      <div
        className={cn(
          "relative  bg-blue-950 grid grid-rows-[auto_1fr_auto] overflow-hidden",
          sidebar ? "max-xl:lg:w-60 w-80" : "max-xl:lg:w-14 w-20"
        )}
      >
        <Button
          isIconOnly
          variant="flat"
          color="primary"
          size="sm"
          radius="full"
          className="max-lg:hidden z-[100] absolute top-8 -right-3.5 bg-default-50 border border-default-300 "
          onPress={() => setSidebar((prev) => !prev)}
        >
          {sidebar ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
        <div className="flex items-center gap-3 px-5 pt-2 pb-2">
          <Image
            src="/logo.png" // Place your logo in public/company-logo.png
            alt="Qr Menu"
            width={80}
            height={80}
            className="rounded-full"
          />
          {sidebar && (
            <span className="font-bold text-lg text-primary whitespace-nowrap">
              DIGITAL
              <br />
              MENU
            </span>
          )}
        </div>
        {/* <Logo sidebar={sidebar} /> */}
        <div className="max-xl:lg:px-2 px-5 pt-3 grid gap-2 auto-rows-min overflow-auto">
          {menu.map(({ label, url, icon }, i) => (
            <Button
              key={i + ""}
              isIconOnly
              color="primary"
              variant={(selected ?? "") == url ? "solid" : "light"}
              className="w-full px-3 inline-flex gap-5 justify-start"
              as={Link}
              href={`/${lang}/${url}`}
            >
              {icon}
              {sidebar && <span className="px-5 capitalize ">{label}</span>}
            </Button>
          ))}
        </div>
        <div className="p-5 max-xl:lg:p-2 grid gap-2 overflow-hidden">
          {/* {isManager && <SelectedTerm />} */}
          {/* <User sidebar={sidebar} /> */}
        </div>
      </div>
      <div
        onClick={() => setSidebar((prev) => !prev)}
        className="lg:hidden bg-foreground-500/50 backdrop-blur-xs"
      />
    </aside>
  );
}

function Header({
  // sidebar,
  setSidebar,
}: {
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  //   const [data, ,] = useAction(getUser, [true, () => {}]);
  return (
    <header className="z-30 h-12 p-2 flex gap-4 items-center max-lg:shadow-sm bg-white/100">
      <Button
        isIconOnly
        variant="flat"
        color="primary"
        className="lg:hidden"
        onPress={() => setSidebar((prev) => !prev)}
      >
        <AlignLeft className="size-7" />
      </Button>

      <div className="flex justify-between items-center w-full">
        {/* <DateTimeDisplay /> */}
        <h1>fuad</h1>
        <button
          onClick={() => {
            const pathname = window.location.pathname;
            const [, passcode, tid] = pathname.split("/");
            window.location.href = `/en/${passcode}/${tid}/cart`;
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-shopping-cart-icon lucide-shopping-cart"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </button>
        {/* <User sidebar={true} /> */}
      </div>
    </header>
  );
}

function User({ sidebar }: { sidebar: boolean }) {
  const pathname = usePathname() ?? "",
    [, lang] = pathname.split("/");
  // [data] = useAction(getUser, [true, () => {}]);

  return (
    <Dropdown className="overflow-hidden">
      <DropdownTrigger>
        <UserIcon className="size-5" />
      </DropdownTrigger>
      <DropdownMenu color="primary" variant="flat">
        <DropdownItem
          key={"signout"}
          startContent={<LogOutIcon className="size-4" />}
          color="danger"
          onClick={async () => {
            await logout();
            window.location.href = `/${lang}/login`;
          }}
        >
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
