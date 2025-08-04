"use client";
import React, { useEffect, useState } from "react";
import Scan from "@/components/QrScanner";
// import PushNotificationManager from "@/components/PushNotificationManager";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event): void => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      // const { outcome } = await deferredPrompt.userChoice;
      // Optionally handle outcome === 'accepted' or 'dismissed'
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border shadow-lg p-4 rounded z-50">
      <p>Install this application?</p>
      <button
        onClick={handleInstallClick}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        OK
      </button>
    </div>
  );
}

function Page() {
  return (
    <div>
      <Scan />
      <InstallPrompt />
      {/* <PushNotificationManager /> */}
    </div>
  );
}

export default Page;
