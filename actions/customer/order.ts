"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { orderSchema, orderItemSchema } from "@/lib/zodSchema";

export async function createCustomerOrder(
  orderData: z.infer<typeof orderSchema>
) {
  // Validate orderData using orderSchema
  const parsedOrder = orderSchema.parse(orderData);

  const totalPrice = parsedOrder.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        tableId: parsedOrder.tableId,
        clientName: parsedOrder.clientName,
        phone: parsedOrder.phone,
        totalPrice,
        status: "pending",
        createdBy: "guest",
      },
    });

    const orderItems = await Promise.all(
      parsedOrder.orderItems.map((item) => {
        // Validate each item using orderItemSchema
        const parsedItem = orderItemSchema.parse(item);
        return tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: parsedItem.productId,
            quantity: parsedItem.quantity,
            price: parsedItem.price,
          },
        });
      })
    );

    return { ...order, orderItems };
  });
}

export async function updateCustomerOrder(
  orderId: string,
  orderData: Partial<z.infer<typeof orderSchema>>
) {
  // Validate orderData (partial) using orderSchema's partial
  const parsedOrder = orderSchema.partial().parse(orderData);

  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        tableId: parsedOrder.tableId,
        clientName: parsedOrder.clientName,
        phone: parsedOrder.phone,
      },
    });

    if (parsedOrder.orderItems) {
      // Update order items
      await Promise.all(
        parsedOrder.orderItems.map((item) => {
          // Validate each item using orderItemSchema's partial (for updates)
          const parsedItem = orderItemSchema.partial().parse(item);
          return tx.orderItem.upsert({
            where: { id: (parsedItem as any).id }, // id must be present for upsert
            update: {
              quantity: parsedItem.quantity,
              price: parsedItem.price,
            },
            create: {
              orderId: order.id,
              productId: parsedItem.productId!,
              quantity: parsedItem.quantity!,
              price: parsedItem.price!,
            },
          });
        })
      );
    }

    return order;
  });
}

export async function deleteCustomerOrder(orderId: string) {
  return await prisma.$transaction(async (tx) => {
    // Delete order items first
    await tx.orderItem.deleteMany({ where: { orderId } });

    // Then delete the order
    return await tx.order.delete({ where: { id: orderId } });
  });
}

export async function getCustomerOrder(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true,
      table: true,
    },
  });
}

export async function getCustomerOrders(tableId?: string) {
  return await prisma.order.findMany({
    where: tableId ? { tableId } : {},
    include: {
      orderItems: true,
      table: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
