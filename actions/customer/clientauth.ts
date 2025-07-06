"use server";
import prisma from "@/lib/db";
export async function customerAuth(code: string, tid: string) {
  // Check passcode
  const admin = await prisma.user.findFirst({
    where: { clientPassCode: code },
    select: { clientPassCode: true },
  });

  // Check table
  const tdata = await prisma.table.findUnique({
    where: { id: tid },
    select: { id: true },
  });

  // Return true if both exist, else false
  return !!admin && !!tdata;
}
