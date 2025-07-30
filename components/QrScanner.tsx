"use client";
import React, { useEffect, useState } from "react";
import {
  Html5QrcodeScanner,
  // Html5QrcodeResult,
  // Html5QrcodeError,
} from "html5-qrcode";
import { redirect, useRouter } from "next/navigation";
import { scan } from "@/actions/customer/scan";
import useAction from "@/hooks/useActions";
import useGuestSession from "@/hooks/useGuestSession";

const QrScanner = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const guestId = useGuestSession();
  console.log("guestId", guestId);
  const [scanResponse, scanAction, isLoadingScan] = useAction(scan, [
    ,
    (response) => {
      if (response.success === true) {
        if (scanResult) {
          console.log("fufu", scanResult);
          const url = new URL(scanResult);
          redirect(url.pathname);
        }
      }
    },
  ]);

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
        supportedScanTypes: [0], // 1 = Html5QrcodeScanType.SCAN_TYPE_CAMERA
      },
      false
    );

    const onScanSuccess = (
      decodedText: string
      // decodedResult: Html5QrcodeResult
    ) => {
      scanner.clear();
      setScanResult(decodedText);
      console.log("Scan result:", decodedText);

      try {
        scanAction(guestId ?? "guest_hifi0sjv31753482126016", decodedText);
        // if the response is success:true only redirect else display the error message in bellow the scanner
        if (scanResponse?.success) {
          setScanResult(null); // Clear the scan result
          // Redirect to the scanned
          const url = new URL(decodedText);
          redirect(url.pathname);
        } else {
          setScanResult(scanResponse?.message || "Scan failed.");
        }
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
          {/* display the error message if error  */}
          <p className="text-red-600 mt-2">{scanResult}</p>
          <p>{scanResponse?.message}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setScanResult(null); // Clear the scan result
              router.refresh(); // Refresh the page
            }}
          >
            ReScan
          </button>
        </div>
      ) : (
        <div id="reader" className="w-full max-w-sm"></div>
      )}
    </div>
  );
};

export default QrScanner;
