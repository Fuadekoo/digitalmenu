"use server";
import prisma from "@/lib/db";
// gate the tableid from params

// gate the orderdata using orderid
export async function gateOrderData(orderId: string) {
  try {
    // Check if the order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      // FIX: Use `include` to get related data, not a mix of `select` and `include`.
      include: {
        table: {
          select: { id: true, name: true },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // If order does not exist, return null
    if (!order) {
      return { message: "Order not found" };
    }

    return order;
  } catch {
    // Optionally log error here
    return { message: "Error retrieving order data" };
  }
}

// gate the orderIds then fetch all orders
export async function gateOrderIds(orderIds: string[]) {
  try {
    // Add a guard clause to handle empty input.
    if (!orderIds || orderIds.length === 0) {
      console.log("No order IDs provided, returning empty array.");
      return [];
    }

    console.log("Fetching orders for IDs:", orderIds);
    // Fetch all orders with the given orderIds
    const orders = await prisma.order.findMany({
      where: { orderCode: { in: orderIds } },
      // FIX: Use `include` to get related data.
      include: {
        table: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Fetched Orders:", orders);

    return orders;
  } catch (error) {
    // Optionally log error here
    console.error("Error fetching orders by IDs:", error);
    return [];
  }
}
