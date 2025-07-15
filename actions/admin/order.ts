"use server";
import prisma from "@/lib/db";
import { z } from "zod";

export async function getOrder(
  search?: string,
  page?: number,
  pageSize?: number
) {
  try {
    // Default values for pagination
    page = page || 1;
    pageSize = pageSize || 10;

    const where = search
      ? {
          OR: [
            { id: { contains: search } },
            { customerName: { contains: search } },
          ],
        }
      : {};

    const totalRows = await prisma.order.count({ where });
    const totalPages = Math.ceil(totalRows / pageSize);

    const data = await prisma.order.findMany({
      where,
      include: {
        table: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        itemsPerPage: pageSize,
        totalRecords: totalRows,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { message: "Failed to fetch orders" };
  }
}

export async function getOrderItems(orderId: string) {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: true,
      },
    });
    return orderItems;
  } catch (error) {
    console.error("Error fetching order items:", error);
    return { message: "Failed to fetch order items" };
  }
}

export async function approveOrder(id: string) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: "APPROVED" },
    });
    return order;
  } catch (error) {
    console.error("Error approving order:", error);
    return { message: "Failed to approve order" };
  }
}

export async function rejectOrder(id: string) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    return order;
  } catch (error) {
    console.error("Error rejecting order:", error);
    return { message: "Failed to reject order" };
  }
}
