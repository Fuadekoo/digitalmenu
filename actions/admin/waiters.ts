"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { waiterSchema } from "@/lib/zodSchema";

export async function getWaiters(
  search?: string,
  page?: number,
  pageSize?: number
) {
  try {
    page = page || 1;
    pageSize = pageSize || 10;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const totalRows = await prisma.waiters.count({ where });
    const totalPages = Math.ceil(totalRows / pageSize);

    const data = await prisma.waiters.findMany({
      where,
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
    console.error("Error in getWaiters:", error);
    throw error;
  }
}

export async function deleteWaiter(id: string) {
  try {
    await prisma.waiters.delete({
      where: { id },
    });
    return { message: "Waiter deleted successfully." };
  } catch (error) {
    console.error("Error in deleteWaiter:", error);
    return { message: "Failed to delete waiter." };
  }
}

export async function createWaiter(data: z.infer<typeof waiterSchema>) {
  try {
    const { name, phone } = data;
     await prisma.waiters.create({
      data: {
        name,
        phone,
      },
    });
    return { message: "Waiter created successfully." };
  } catch (error) {
    console.error("Error in createWaiter:", error);
    return { message: "Failed to create waiter." };
  }
}

export async function updateWaiter(
  id: string,
  data: z.infer<typeof waiterSchema>
) {
  try {
    const { name, phone } = data;
     await prisma.waiters.update({
      where: { id },
      data: {
        name,
        phone,
      },
    });
    return { message: "Waiter updated successfully." };
  } catch (error) {
    console.error("Error in updateWaiter:", error);
    return { message: "Failed to update waiter." };
  }
}
