"use client";
import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";
import { scan } from "@/actions/customer/scan";
import useAction from "@/hooks/useActions";
import { redirect } from "next/navigation";
import useGuestSession from "@/hooks/useGuestSession";

const QrScanner = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const guestId = useGuestSession();
  const router = useRouter();

  const [, scanAction, isLoadingScan] = useAction(scan, [
    ,
    (response) => {
      // console.log("Scan response:", response); // <-- Log backend response
      if (response && response.success) {
        addToast({
          title: "Scan Result",
          description: response.message,
        });
        // Redirect to the scanned URL
        if (response.redirectUrl) {
          redirect(response.redirectUrl);
        } else {
          setErrorMessage("No redirect URL provided.");
        }
      } else {
        // console.error("Scan failed:", response); // <-- Log error details
        setErrorMessage(response?.message || "Failed to process scan.");
      }
    },
  ]);

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
        supportedScanTypes: [0],
      },
      false
    );

    const onScanSuccess = async (decodedText: string) => {
      // console.log("QR code scanned:", decodedText); // <-- Log scanned text
      scanner.clear();
      setScanResult(decodedText);
      setErrorMessage(null); // Clear previous error

      // Call the scan action with guestId and decoded text
      await scanAction(guestId, decodedText);
    };

    const onScanFailure = (error: string) => {
      // Optional: Handle scan failure (like camera errors)
      // console.error("QR scan failure:", error); // <-- Log scan failure
      setErrorMessage("Failed to scan QR code. Please try again.");
      setScanResult(null);
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch((error) => {
        // console.error("Failed to clear html5-qrcode scanner.", error);
      });
    };
  }, [router, guestId]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">
        Welcome To Digital Menu
      </h1>
      {scanResult ? (
        <div className="text-center">
          {isLoadingScan ? (
            <p className="text-blue-600 font-semibold">Processing scan...</p>
          ) : errorMessage ? (
            <>
              <p className="text-red-600 font-semibold">Scan Failed</p>
              <p className="text-red-600 mt-2">{errorMessage}</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  setScanResult(null);
                  setErrorMessage(null);
                  window.location.reload(); // Reload to restart scanner
                }}
              >
                Scan Again
              </button>
            </>
          ) : (
            <p className="text-green-600 font-semibold">Redirecting...</p>
          )}
        </div>
      ) : (
        <div id="reader" className="w-full max-w-sm"></div>
      )}
    </div>
  );
};

export default QrScanner;
