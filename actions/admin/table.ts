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

export async function getTables() {
  return await prisma.table.findMany({
    include: {
      waiter: {
        select: {
          name: true,
        },
      },
    },
  });
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
