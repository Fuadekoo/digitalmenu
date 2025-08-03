"use client";
import React, { useState } from "react";
import { RefreshCcw, CheckCheck } from "lucide-react";
import { adminConnected } from "@/actions/common/socketChecker";
import useAction from "@/hooks/useActions";
export default function AdminSocketConnected() {
  // gate the id from the session

  const [connected, refresh, isLoading] = useAction(adminConnected, [
    true,
    () => {},
  ]);

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
