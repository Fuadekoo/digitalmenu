"use server";
import prisma from "@/lib/db";

export async function getPromotion() {
  try {
    const promotion = await prisma.promotion.findMany();
    return promotion;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return [];
  }
}

export async function categoryListFood() {
  try {
    const categories = await prisma.productCategory.findMany();
    return categories;
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
}

export async function specialOffers() {
  try {
    const offers = await prisma.product.findMany({
      where: { discount: { gt: 0 } },
      include: { category: true },
    });
    return offers;
  } catch (error) {
    console.error("Error fetching special offers:", error);
    return [];
  }
}

export async function allFood() {
  try {
    const foodItems = await prisma.product.findMany({
      include: { category: true },
    });
    return foodItems;
  } catch (error) {
    console.error("Error fetching all food items:", error);
    return [];
  }
}
