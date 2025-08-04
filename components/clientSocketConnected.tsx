"use client";
import React from "react";
import { RefreshCcw, CheckCheck } from "lucide-react";
import { clientConnected } from "@/actions/common/socketChecker";
import useAction from "@/hooks/useActions";
import { useParams } from "next/navigation";
import useGuestSession from "@/hooks/useGuestSession";

export default function ClientSocketConnected() {
  const guestId = useGuestSession();
  const { tid } = useParams();
  const [connected, refresh, isLoading] = useAction(
    clientConnected,
    [true, () => {}],
    tid?.toString() || "",
    guestId || ""
  );

  const handleRefresh = () => {
    refresh();
    // Optionally, you can also reload the page:
    // window.location.reload();
  };

  if (isLoading) {
    return (
      <button type="button" disabled>
        <RefreshCcw className="animate-spin" />
      </button>
    );
  }

  if (connected) {
    return <CheckCheck className="text-green-500" />;
  }

  return (
    <button type="button" onClick={handleRefresh}>
      <RefreshCcw className="text-gray-500 hover:text-blue-500" />
    </button>
  );
}
