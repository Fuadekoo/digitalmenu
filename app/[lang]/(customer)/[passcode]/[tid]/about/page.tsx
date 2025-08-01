import React from "react";
import Image from "next/image";
import { Smartphone, Zap, CreditCard, BellRing } from "lucide-react";

// --- Feature Item Component ---
const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center text-center">
    <div className="bg-primary-100 text-primary-600 rounded-full p-4 mb-3">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

function Page() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* --- Logo --- */}
      {/* <div className="flex justify-center pt-8 pb-2">
        <Image
          src="/logo.png"
          alt="Restaurant Logo"
          width={80}
          height={80}
          className="rounded-full shadow"
        />
      </div> */}

      {/* --- Hero Section with Image --- */}
      <div className="relative h-64 w-full">
        <Image
          src="/fu.jpg"
          alt="Restaurant dining experience"
          layout="fill"
          objectFit="cover"
          className="brightness-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg">
            A Smarter Way to Dine
          </h1>
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        {/* --- Description --- */}
        <div className="bg-white p-8 rounded-xl shadow-md -mt-20 relative z-10">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Welcome to the Future of Dining
          </h2>
          <p className="text-gray-600 text-center leading-relaxed mb-4">
            Our digital menu is designed to bring convenience right to your
            fingertips. Browse our delicious offerings with stunning photos,
            customize your meal, and place your order seamlessly from your own
            device. No more waiting for a physical menu or flagging down a
            server. Enjoy a faster, safer, and more interactive way to dine with
            us.
          </p>
        </div>

        {/* --- Features Section --- */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Why You &apos;ll Love It
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <FeatureItem
              icon={<Smartphone size={28} />}
              title="Easy Browsing"
              description="Explore our full menu with high-quality images and detailed descriptions."
            />
            <FeatureItem
              icon={<Zap size={28} />}
              title="Quick Ordering"
              description="Place your order directly from your table and send it to the kitchen in seconds."
            />
            <FeatureItem
              icon={<CreditCard size={28} />}
              title="Secure Payments"
              description="Pay your bill safely and securely from your phone whenever you're ready."
            />
            <FeatureItem
              icon={<BellRing size={28} />}
              title="Real-Time Updates"
              description="Get notified about special promotions and when your order is on its way."
            />
          </div>
        </div>
        <div>
          <div className="mt-10">
            <h3 className="text-2xl md:text-3xl font-extrabold text-primary-700 text-center mb-4">
              How to Use Our QR Code Menu System
            </h3>
            <ol className="list-decimal list-inside text-gray-800 text-lg text-center space-y-3 mb-6 font-medium">
              <li>
                <span className="font-bold">Scan the QR code</span> on your
                table using your smartphone camera.
              </li>
              <li>
                <span className="font-bold">Instantly access</span> our digital
                menu—no app download required!
              </li>
              <li>
                <span className="font-bold">Browse, customize, and order</span>{" "}
                directly from your device.
              </li>
              <li>
                <span className="font-bold">Pay securely</span> and get
                real-time updates about your order.
              </li>
            </ol>
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 mt-8">
              <div className="flex flex-col items-center">
                <div className="border-4 border-primary-600 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/scan1.jpg"
                    alt="Scan QR code with phone"
                    width={220}
                    height={220}
                    className="object-cover"
                  />
                </div>
                <p className="text-lg font-bold text-primary-700 text-center mt-4">
                  Scan QR Code
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="border-4 border-primary-600 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/scan2.jpg"
                    alt="Access menu on phone"
                    width={220}
                    height={220}
                    className="object-cover"
                  />
                </div>
                <p className="text-lg font-bold text-primary-700 text-center mt-4">
                  Browse &amp; Order
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
