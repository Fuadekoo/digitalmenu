"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { productSchema } from "@/lib/zodSchema";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

export async function createProduct(data: z.infer<typeof productSchema>) {
  try {
    // Validate input
    const parsedData = productSchema.safeParse(data);
    if (!parsedData.success) {
      console.log(parsedData.error);
      throw new Error("Invalid product data");
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

    // Create product in the database
    await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        discount: data.discount,
        quantity: data.quantity,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId,
        description: data.description,
        photo: photoUrl ?? "",
      },
    });

    return { message: "Product created successfully" };
  } catch (error) {
    console.error("Error creating product:", error);
    return { message: "Failed to create product" };
  }
}

export async function getProducts(
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
            { description: { contains: search } },
          ],
        }
      : {};

    const totalRows = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalRows / pageSize);

    const data = await prisma.product.findMany({
      where,
      include: {
        category: true,
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
    console.error("Error fetching products:", error);
    return { message: "Failed to fetch products" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    return { message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { message: "Failed to delete product" };
  }
}

export async function updateProduct(
  id: string,
  data: z.infer<typeof productSchema>
) {
  try {
    // Validate input
    const parsedData = productSchema.safeParse(data);
    if (!parsedData.success) {
      console.log(parsedData.error);
      throw new Error("Invalid product data");
    }

    // Update product in the database
    await prisma.product.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return { message: "Product updated successfully" };
  } catch (error) {
    console.error("Error updating product:", error);
    return { message: "Failed to update product" };
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    return product;
  } catch (error) {
    throw error;
  }
}

export async function getFeaturedProducts(
  search?: string,
  page?: number,
  pageSize?: number
) {
  try {
    // Default values for pagination
    page = page || 1;
    pageSize = pageSize || 10;

    const where = {
      isFeatured: true,
      isAvailable: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const totalRows = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalRows / pageSize);

    const data = await prisma.product.findMany({
      where,
      include: {
        category: true,
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
    throw error;
  }
}
