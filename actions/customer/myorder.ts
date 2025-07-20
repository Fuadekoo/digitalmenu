"use server";
import prisma from "@/lib/db";

// gate the orderdata using orderid
export async function gateOrderData(orderId: string) {
  try {
    // Check if the order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderCode: true,
        tableId: true,
        totalPrice: true,
        createdAt: true,
        status: true,
        orderItems: {
          include: {
            product: { select: { id: true, name: true, photo: true } },
          },
          select: {
            productId: true,
            quantity: true,
            price: true,
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
    console.log("Fetching orders for IDs:", orderIds);
    // Fetch all orders with the given orderIds
    const orders = await prisma.order.findMany({
      where: { orderCode: { in: orderIds } },
      select: {
        id: true,
        orderCode: true,
        tableId: true,
        totalPrice: true,
        createdAt: true,
        status: true,
        orderItems: {
          include: {
            product: { select: { id: true, name: true, photo: true } },
          },
          select: {
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    console.log("Fetched Orders:", orders);

    return orders;
  } catch {
    // Optionally log error here
    return [];
  }
}
