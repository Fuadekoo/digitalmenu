"use client";

import React, { useEffect, useState } from "react";
import {
  Html5QrcodeScanner,
  Html5QrcodeResult,
  // Html5QrcodeError,
} from "html5-qrcode";
import { useRouter } from "next/navigation";

const QrScanner = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      },
      false
    );

    const onScanSuccess = (
      decodedText: string,
      decodedResult: Html5QrcodeResult
    ) => {
      scanner.clear();
      setScanResult(decodedText);

      try {
        const url = new URL(decodedText);
        router.push(url.pathname);
      } catch (error) {
        setScanResult(`Scanned content: ${decodedText}`);
      }
    };

    function onScanFailure(errorMessage: string, error: any): void {
      // Optionally log errors for debugging, but avoid spamming the console.
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear html5-qrcode scanner.", error);
      });
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
      {scanResult ? (
        <div className="text-center">
          <p className="text-green-600 font-semibold">Scan Successful!</p>
          <p className="text-gray-700">Redirecting...</p>
        </div>
      ) : (
        <div id="reader" className="w-full max-w-sm"></div>
      )}
    </div>
  );
};

export default QrScanner;
