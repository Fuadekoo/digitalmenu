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
    // Map over the offers to calculate the new price after discount
    const offersWithDiscountedPrice = offers.map((offer) => {
      const discountAmount = offer.price * (offer.discount / 100);
      const finalPrice = offer.price - discountAmount;
      const oldPrice = offer.price; // Keep the original price for reference

      return {
        ...offer,
        oldPrice, // Keep the original price
        discount: offer.discount, // Keep the discount percentage
        price: finalPrice, // Return the final price after applying the discount
      };
    });
    return offersWithDiscountedPrice;
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

// list all product per catagory
export async function listProductByCategory(categoryId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { categoryId },
      include: { category: true },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

export async function getCategoryName(categoryId: string) {
  try {
    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId },
    });
    return category?.cname;
  } catch (error) {
    console.error("Error fetching category data:", error);
    return null;
  }
}
