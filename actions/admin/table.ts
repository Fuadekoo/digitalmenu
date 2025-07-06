"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { tableSchema } from "@/lib/zodSchema";

export async function createTable(data: z.infer<typeof tableSchema>) {
  const { name, tNumber, waiterId } = data;

  // Check if a table with the same name or number already exists
  const existingTable = await prisma.table.findFirst({
    where: {
      OR: [{ name: name }, { tNumber: tNumber }],
    },
  });

  if (existingTable) {
    throw new Error("A table with this name or number already exists.");
  }

  // Create the new table
  return await prisma.table.create({
    data: {
      name,
      tNumber,
      waiterId,
    },
  });
}

export async function getTables(
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
          { name: { contains: search } },
          ...(Number.isNaN(Number(search))
            ? []
            : [{ tNumber: Number(search) }]),
        ],
      }
    : {};

  const totalRows = await prisma.table.count({ where });
  const totalPages = Math.ceil(totalRows / pageSize);

  const data = await prisma.table.findMany({
    where,
    include: {
      waiter: {
        select: {
          name: true,
        },
      },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { tNumber: "asc" },
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

export async function updateTable(
  id: string,
  data: z.infer<typeof tableSchema>
) {
  const { name, tNumber, waiterId } = data;

  // Check if a table with the same name or number already exists
  const existingTable = await prisma.table.findFirst({
    where: {
      AND: [
        { id: { not: id } }, // Exclude the current table
        {
          OR: [{ name: name }, { tNumber: tNumber }],
        },
      ],
    },
  });

  if (existingTable) {
    throw new Error("A table with this name or number already exists.");
  }

  // Update the table
  return await prisma.table.update({
    where: { id },
    data: {
      name,
      tNumber,
      waiterId,
    },
  });
}
