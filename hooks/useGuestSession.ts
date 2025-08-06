import { useEffect, useState } from "react";

// Helper to generate a simple unique ID
const generateUniqueId = (): string => {
  return "guest_" + Math.random().toString(36).substr(2, 9) + Date.now();
};

// Helper to get cookie by name
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

// Helper to set cookie
const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
};

const COOKIE_NAME = "guest_session_id";

const useGuestSession = (): string => {
  const [guestId, setGuestId] = useState<string>("");

  useEffect(() => {
    let id = getCookie(COOKIE_NAME);
    if (!id) {
      id = generateUniqueId();
      setCookie(COOKIE_NAME, id);
    }
    setGuestId(id);
  }, []);

  return guestId;
};

export default useGuestSession;
