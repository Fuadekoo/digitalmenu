"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { feedbackSchema } from "@/lib/zodSchema";

export async function createFeedback(data: z.infer<typeof feedbackSchema>) {
  const { clientName, phone, message, rate } = data;

  // Validate input
  const parsedData = feedbackSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error("Invalid feedback data");
  }

  // Create feedback in the database
  const feedback = await prisma.feedBack.create({
    data: {
      clientName,
      phone,
      message,
      rate,
    },
  });

  return feedback;
}

export async function getFeedbacks() {
  const feedbacks = await prisma.feedBack.findMany({
    orderBy: { createdAt: "desc" },
  });
  return feedbacks;
}

export async function deleteFeedback(id: string) {
  await prisma.feedBack.delete({
    where: { id },
  });
}

export async function updateFeedback(
  id: string,
  data: z.infer<typeof feedbackSchema>
) {
  const { clientName, phone, message, rate } = data;

  // Validate input
  const parsedData = feedbackSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error("Invalid feedback data");
  }

  // Update feedback in the database
  const updatedFeedback = await prisma.feedBack.update({
    where: { id },
    data: {
      clientName,
      phone,
      message,
      rate,
    },
  });

  return updatedFeedback;
}
