import type { Metadata } from "next";
import Providers from "./providers";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { Toaster } from "react-hot-toast";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Digital Menu",
  description: "A digital menu for restaurants and cafes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
        className="overflow-hidden"
      >
        <Providers>
          {/* <Toaster /> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
