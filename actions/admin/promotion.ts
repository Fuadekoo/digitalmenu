"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { promotionSchema } from "@/lib/zodSchema";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

export async function createPromotion(data: z.infer<typeof promotionSchema>) {
  try {
    const parsedData = promotionSchema.safeParse(data);
    if (!parsedData.success) {
      console.log(parsedData.error);
      throw new Error("Invalid promotion data");
    }

    let photoUrl: string | undefined = undefined;
    if (data.photo) {
      const ext = ".jpg";
      const uniqueName = `${randomUUID()}${ext}`;
      const filePath = path.join(process.cwd(), "filedata", uniqueName);

      let buffer: Buffer;
      if (typeof data.photo === "string" && data.photo.startsWith("data:")) {
        const base64 = data.photo.split(",")[1];
        buffer = Buffer.from(base64, "base64");
      } else if (typeof data.photo === "string") {
        buffer = Buffer.from(data.photo, "base64");
      } else {
        buffer = data.photo;
      }
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);
      photoUrl = uniqueName;
    }

    const promotion = await prisma.promotion.create({
      data: {
        ...data,
        photo: photoUrl ?? "",
      },
    });
    return { message: "Promotion created successfully", promotion };
  } catch (error) {
    console.error("Error creating promotion:", error);
    throw new Error("Failed to create promotion");
  }
}

export async function updatePromotion(
  id: string,
  data: z.infer<typeof promotionSchema>
) {
  try {
    const parsedData = promotionSchema.safeParse(data);
    if (!parsedData.success) {
      console.log(parsedData.error);
      throw new Error("Invalid promotion data");
    }

    let photoUrl: string | undefined = undefined;
    if (data.photo) {
      const ext = ".jpg";
      const uniqueName = `${randomUUID()}${ext}`;
      const filePath = path.join(process.cwd(), "filedata", uniqueName);

      let buffer: Buffer;
      if (typeof data.photo === "string" && data.photo.startsWith("data:")) {
        const base64 = data.photo.split(",")[1];
        buffer = Buffer.from(base64, "base64");
      } else if (typeof data.photo === "string") {
        buffer = Buffer.from(data.photo, "base64");
      } else {
        buffer = data.photo;
      }
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);
      photoUrl = uniqueName;
    }

    await prisma.promotion.update({
      where: { id },
      data: {
        ...data,
        photo: photoUrl,
      },
    });
    return { message: "Promotion updated successfully" };
  } catch (error) {
    console.error("Error updating promotion:", error);
    return { message: "Failed to update promotion" };
  }
}

export async function deletePromotion(id: string) {
  try {
    await prisma.promotion.delete({ where: { id } });
    return { message: "Promotion deleted successfully" };
  } catch (error) {
    console.error("Error deleting promotion:", error);
    throw new Error("Failed to delete promotion");
  }
}
export async function getPromotions(
  search?: string,
  page?: number,
  pageSize?: number
) {
  try {
    page = page || 1;
    pageSize = pageSize || 10;

    const where = search
      ? { OR: [{ title: { contains: search } }] }
      : undefined;

    const totalRows = await prisma.promotion.count({ where });
    const totalPages = Math.ceil(totalRows / pageSize);

    const data = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        itemsPerPage: pageSize,
        totalRecords: totalRows,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching promotions:", error);
    throw new Error("Failed to fetch promotions");
  }
}
