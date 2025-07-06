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

export async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return products;
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
export async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return products;
}
