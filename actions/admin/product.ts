"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { productSchema } from "@/lib/zodSchema";

export async function createProduct(data: z.infer<typeof productSchema>) {
  const {
    name,
    description,
    photo,
    price,
    quantity,
    isAvailable,
    isFeatured,
    categoryId,
  } = data;

  // Validate input
  const parsedData = productSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error("Invalid product data");
  }

  // Create product in the database
  const product = await prisma.product.create({
    data: {
      name,
      description,
      photo,
      price,
      quantity,
      isAvailable,
      isFeatured,
      categoryId,
    },
  });

  return product;
}

export async function getProducts(
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
          { description: { contains: search, mode: "insensitive" } },
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
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  });
}

export async function updateProduct(
  id: string,
  data: z.infer<typeof productSchema>
) {
  const {
    name,
    description,
    photo,
    price,
    quantity,
    isAvailable,
    isFeatured,
    categoryId,
  } = data;

  // Validate input
  const parsedData = productSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error("Invalid product data");
  }

  // Update product in the database
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      photo,
      price,
      quantity,
      isAvailable,
      isFeatured,
      categoryId,
    },
  });

  return updatedProduct;
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
  return product;
}
export async function getFeaturedProducts(
  search?: string,
  page?: number,
  pageSize?: number
) {
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
}
