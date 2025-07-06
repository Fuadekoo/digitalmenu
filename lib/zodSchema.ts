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
