"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { categorySchema } from "@/lib/zodSchema";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

export async function getCategory(
  search?: string,
  page?: number,
  pageSize?: number
) {
  try {
    // Default values for pagination
    page = page || 1;
    pageSize = pageSize || 10;

    // Count total records
    const totalRows = await prisma.productCategory.count({
      where: {
        OR: search ? [{ cname: { contains: search } }] : undefined,
      },
    });

    const totalPages = Math.ceil(totalRows / pageSize);

    const data = await prisma.productCategory.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        OR: search ? [{ cname: { contains: search } }] : undefined,
      },
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
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function deleteCategory(id: string) {
  try {
    const category = await prisma.productCategory.delete({
      where: { id },
    });
    return { message: "Category deleted successfully", category };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { message: "Failed to delete category because it has a relation " };
    // throw new Error("Failed to delete category");
  }
}

export async function createCategory(data: z.infer<typeof categorySchema>) {
  try {
    const parsedData = categorySchema.safeParse(data);
    if (!parsedData.success) {
      console.log(parsedData.error);
      throw new Error("Invalid category data");
    }

    let photoUrl: string | undefined = undefined;
    if (data.photo) {
      // Assume data.photo is a base64 string or a Buffer
      // Generate unique filename
      const ext = ".jpg"; // or parse from data.photo if you have mime info
      const uniqueName = `${randomUUID()}${ext}`;
      const filePath = path.join(process.cwd(), "filedata", uniqueName);

      // Save file
      let buffer: Buffer;
      if (typeof data.photo === "string" && data.photo.startsWith("data:")) {
        // base64 data URL
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

    const category = await prisma.productCategory.create({
      data: {
        cname: data.cname,
        photo: photoUrl,
      },
    });
    return { message: "Category created successfully", category };
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}

export async function updateCategory(
  id: string,
  data: z.infer<typeof categorySchema>
) {
  try {
    const parsedData = categorySchema.safeParse(data);
    if (!parsedData.success) {
      console.log(parsedData.error);
      throw new Error("Invalid category data");
    }

    let photoUrl: string | undefined = undefined;
    if (data.photo) {
      // Assume data.photo is a base64 string or a Buffer
      // Generate unique filename
      const ext = ".jpg"; // or parse from data.photo if you have mime info
      const uniqueName = `${randomUUID()}${ext}`;
      const filePath = path.join(process.cwd(), "filedata", uniqueName);

      // Save file
      let buffer: Buffer;
      if (typeof data.photo === "string" && data.photo.startsWith("data:")) {
        // base64 data URL
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

    await prisma.productCategory.update({
      where: { id },
      data: {
        cname: data.cname,
        photo: photoUrl,
      },
    });
    return { message: "Category updated successfully" };
  } catch (error) {
    console.error("Error updating category:");
    return { message: "Failed to update category" };
  }
}
