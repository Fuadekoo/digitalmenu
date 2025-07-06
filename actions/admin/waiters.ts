"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { waiterSchema } from "@/lib/zodSchema";

export async function getWaiters() {
  const waiters = await prisma.waiters.findMany({
    orderBy: { createdAt: "desc" },
  });
  return waiters;
}

export async function deleteWaiter(id: string) {
  await prisma.waiters.delete({
    where: { id },
  });
}

export async function createWaiter(data: z.infer<typeof waiterSchema>) {
  const { name, phone } = data;
  const newWaiter = await prisma.waiters.create({
    data: {
      name,
      phone,
    },
  });
  return newWaiter;
}

export async function updateWaiter(
  id: string,
  data: z.infer<typeof waiterSchema>
) {
  const { name, phone } = data;
  const updatedWaiter = await prisma.waiters.update({
    where: { id },
    data: {
      name,
      phone,
    },
  });
  return updatedWaiter;
}
