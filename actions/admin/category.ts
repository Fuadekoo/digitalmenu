"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { categorySchema } from "@/lib/zodSchema";

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
        OR: search
          ? [{ cname: { contains: search } }]
          : undefined,
      },
    });

    const totalPages = Math.ceil(totalRows / pageSize);

    const data = await prisma.productCategory.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        OR: search
          ? [{ cname: { contains: search } }]
          : undefined,
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
    throw new Error("Failed to delete category");
  }
}

export async function createCategory(data: z.infer<typeof categorySchema>) {
  try {
    const category = await prisma.productCategory.create({
      data,
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
    const category = await prisma.productCategory.update({
      where: { id },
      data,
    });
    return { message: "Category updated successfully", category };
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
}
