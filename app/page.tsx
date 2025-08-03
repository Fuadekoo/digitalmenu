"use client";
import React from "react";
import Scan from "@/components/QrScanner";
// import PushNotificationManager from "@/components/PushNotificationManager";
function Page() {
  return (
    <div>
      <Scan />
      {/* <PushNotificationManager /> */}
    </div>
  );
}

export default Page;
