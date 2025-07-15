import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().min(9, "phone number is too short"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type LoginType = z.infer<typeof loginSchema>;

export const categorySchema = z.object({
  cname: z.string().min(1, "Category name is required"),
});
export type CategoryType = z.infer<typeof categorySchema>;

export const tableSchema = z.object({
  name: z.string().min(1, "Table name is required"),
  tNumber: z.coerce.number().min(1, "Table number must be at least 1"),
  waiterId: z.string().optional(), // Optional, can be null
});
export type TableType = z.infer<typeof tableSchema>;

export const waiterSchema = z.object({
  name: z.string().min(1, "Waiter name is required"),
  phone: z.string().min(9, "Phone number is too short"),
});

export const feedbackSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  rate: z.coerce.number().min(1).max(5),
});
export type FeedbackType = z.infer<typeof feedbackSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  photo: z.string().min(1, "Photo is required"),
  price: z.coerce.number().min(0, "Product price must be positive"),
  quantity: z.coerce.number().min(0, "Quantity must be at least 0"),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  categoryId: z.string().min(1, "Category ID is required"),
});
export type ProductType = z.infer<typeof productSchema>;

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be positive"),
});
export type OrderItemType = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  tableId: z.string().min(1, "Table ID is required").optional(),
  totalPrice: z.coerce.number().min(0, "Total price must be positive"),
  location: z.string().optional(),
  phone: z.string().optional(),
  clientName: z.string().optional(),
  status: z.string().optional().default("pending"),
  orderItems: z
    .array(orderItemSchema)
    .min(1, "At least one order item is required"),
  createdBy: z.string().min(1, "CreatedBy is required"),
});
export type OrderType = z.infer<typeof orderSchema>;
