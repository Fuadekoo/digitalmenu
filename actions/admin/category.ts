"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { categorySchema } from "@/lib/zodSchema";

export async function getCategory() {
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return categories;
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
