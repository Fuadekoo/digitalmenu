"use server";
import prisma from "@/lib/db";
import { customerAuth } from "@/actions/customer/clientauth";
// import { env } from "process";

/**
 * Checks if a guest can be redirected to a new table after a QR scan.
 * Prevents redirection if the guest has a pending order at a different table.
 * @param guestId The unique ID of the guest.
 * @param scannedTableId The ID of the table from the newly scanned QR code.
 * @returns An object indicating success or failure with a message.
 */
export async function scan(guestId: string, decodedText: string) {
  //check the decoded text to see if it contains a table ID
  let scannedTableId: string;
  let passcode: string;
  let domain: string;
  let lang: string;
  try {
    const url = new URL(decodedText);
    scannedTableId = url.pathname.split("/").pop() || "";
    passcode = url.pathname.split("/")[2] || "";
    domain = url.hostname;
    lang = url.pathname.split("/")[1] || "en";

    console.log("domain  fom backend", domain);

    const DOMAIN_NAME =
      process.env.DOMAIN_NAME?.replace(/^https?:\/\//, "") || "";
    console.log("Domain from env:", DOMAIN_NAME);

    // Check if the URL is valid and contains the expected structure
    if (domain !== DOMAIN_NAME) {
      return {
        success: false,
        message: "Invalid QR code format or domain.",
      };
    }

    // Validate passcode and table ID
    const isAuth = await customerAuth(passcode, scannedTableId);
    console.log("Auth status:", isAuth);
    console.log("Scanned Table ID:", scannedTableId);
    console.log("Guest ID:", guestId);
    console.log("passcode", passcode);
    if (!isAuth) {
      return {
        success: false,
        message: "Invalid passcode or table ID.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Invalid QR code format.",
    };
  }
  // 1. Validate input
  if (!guestId || !scannedTableId) {
    return {
      success: false,
      message: "Guest ID and Scanned Table ID are required.",
    };
  }

  // 2. Check if the guest has any orders with a "pending" status.
  // We include the table information to get the table name for the error message.
  const pendingOrder = await prisma.order.findFirst({
    where: {
      guestId: guestId,
      status: "pending",
    },
    include: {
      table: {
        select: {
          name: true, // Select the table name
        },
      },
    },
  });

  // 3. If a pending order exists, check if it's for a different table.
  if (pendingOrder) {
    const currentTableId = pendingOrder.tableId;
    const currentTableName = pendingOrder.table?.name || "your current table";

    // If the pending order's table is different from the newly scanned table
    if (currentTableId !== scannedTableId) {
      return {
        success: false,
        message: `You have a pending order at Table ${currentTableName}. Please wait for it to be confirmed before moving.`,
      };
    }
  }

  // 4. If there are no pending orders, or the scan is for the same table, allow the action.
  return {
    success: true,
    message: "Scan successful. Redirecting...",
    redirectUrl: `/${lang}/${passcode}/${scannedTableId}/home`,
  };
}
