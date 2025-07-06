"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { waiterSchema } from "@/lib/zodSchema";

export async function getWaiters(
  search?: string,
  page?: number,
  pageSize?: number
) {
  // Default values for pagination
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
}

export async function deleteWaiter(id: string) {
  await prisma.waiters.delete({
    where: { id },
  });
}

export async function createWaiter(data: z.infer<typeof waiterSchema>) {
  const { name, phone } = data;
  const newWaiter = await prisma.waiters.create({
    data: {
      name,
      phone,
    },
  });
  return newWaiter;
}

export async function updateWaiter(
  id: string,
  data: z.infer<typeof waiterSchema>
) {
  const { name, phone } = data;
  const updatedWaiter = await prisma.waiters.update({
    where: { id },
    data: {
      name,
      phone,
    },
  });
  return updatedWaiter;
}
