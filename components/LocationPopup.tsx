"use client";

import { useState } from "react";

export default function LocationPopup() {
  const [showPopup, setShowPopup] = useState(true);
  const [, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos);
        setShowPopup(false); // CLOSE POPUP
        console.log("Location granted ✅", pos.coords);
      },
      (err) => {
        setError("⚠️ Location access denied or failed.");
        console.error("Error:", err.message);
      }
    );
  };

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">📍 Location Permission</h2>
            <p className="mb-6">
              We need your location to continue. Please allow location access.
            </p>
            <button
              onClick={requestLocation}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Allow Location
            </button>
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
