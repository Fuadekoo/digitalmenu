"use server";
import dotenv from "dotenv";
import prisma from "@/lib/db";

dotenv.config();
import { z } from "zod";
import { tableSchema } from "@/lib/zodSchema";

export async function createTable(data: z.infer<typeof tableSchema>) {
  try {
    const { name, tNumber, roomNumber, waiterId } = data;

    // Check if a table with the same name or number already exists
    const existingTable = await prisma.table.findFirst({
      where: {
        OR: [{ name: name }, { tNumber: tNumber }],
      },
    });

    if (existingTable) {
      return {
        message: "A table with this name or number already exists.",
      };
    }

    // Create the new table
    await prisma.table.create({
      data: {
        name,
        tNumber,
        roomNumber,
        waiterId,
      },
    });
    return { message: "Table created successfully." };
  } catch {
    return { message: "Failed to create table" };
  }
}

export async function getTables(
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
  } catch {
    return { message: "Failed to fetch tables" };
  }
}

export async function updateTable(
  id: string,
  data: z.infer<typeof tableSchema>
) {
  try {
    const { name, tNumber, roomNumber, waiterId } = data;

    // Check if a table with the same name or number already exists
    const existingTable = await prisma.table.findFirst({
      where: {
        AND: [
          { id: { not: id } }, // Exclude the current table
          {
            OR: [
              { name: name },
              { tNumber: tNumber },
              { roomNumber: roomNumber },
            ],
          },
        ],
      },
    });

    if (existingTable) {
      return {
        message: "A table with this name or number already exists.",
      };
      // throw new Error("A table with this name or number already exists.");
    }

    // Update the table
    return await prisma.table.update({
      where: { id },
      data: {
        name,
        tNumber,
        roomNumber,
        waiterId,
      },
    });
  } catch {
    // console.error("Error updating table:", error);
    return { message: "Failed to update table" };
    // throw new Error("Failed to update table");
  }
}

export async function deleteTable(id: string) {
  try {
    // Check if the table exists
    const existingTable = await prisma.table.findUnique({
      where: { id },
    });

    if (!existingTable) {
      return { message: "Table not found." };
    }

    // Delete the table
    await prisma.table.delete({
      where: { id },
    });

    return { message: "Table deleted successfully." };
  } catch (error) {
    return { message: "Failed to delete table" };
  }
}

// gate the table qrcode.that means the table qrcode is domainname/passcodefrom admin/tid
export async function getTableQRCode(id: string) {
  try {
    const table = await prisma.table.findUnique({
      where: { id },
    });

    if (!table) {
      return { message: "Table not found." };
    }

    const domainName = process.env.DOMAIN_NAME;
    const Lang = process.env.LANG || "en";

    const passcode = await prisma.user.findFirst({
      where: { role: "admin" },
      select: { clientPassCode: true },
    });

    if (!passcode) {
      return { message: "Admin passcode not found." };
    }

    return `${domainName}/${Lang}/${passcode.clientPassCode}/${table.id}`;
  } catch {
    return { message: "Failed to generate QR code" };
  }
}

export async function getWaiterData() {
  const waiters = await prisma.waiters.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return waiters;
}
