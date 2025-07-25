"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "./SocketProvider";
import useGuestSession from "@/hooks/useGuestSession";

/**
 * A client component that runs on customer-facing pages.
 * It registers the user's socket with their guestId and tableId.
 */
const TableSocketRegistrar = () => {
  const socket = useSocket();
  const params = useParams();
  const guestId = useGuestSession();
  // The 'tid' should be available from the URL parameters
  const tableId = params.tid as string;

  useEffect(() => {
    // Ensure we have all the necessary data before registering.
    if (socket && tableId && guestId) {
      console.log(
        `Attempting to register socket for table: ${tableId}, guest: ${guestId}`
      );
      socket.emit("register_table_socket", { tableId, guestId });
    }
  }, [socket, tableId, guestId]);

  // This component does not render anything to the UI.
  return null;
};

export default TableSocketRegistrar;
