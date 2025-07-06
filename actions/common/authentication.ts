"use server";
import { auth } from "@/lib/auth";
import { signIn, signOut } from "../../lib/auth";
import { z } from "zod";
import { loginSchema } from "@/lib/zodSchema";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
export async function authenticate(
  data?: z.infer<typeof loginSchema> | undefined
): Promise<{ message: string } | undefined> {
  if (!data) return { message: "No data provided" };
  let result;
  try {
    result = await signIn("credentials", { ...data, redirect: false });
  } catch (error) {
    console.log("sign in failed", error);
    return { message: "Invalid email or password" };
  }
  if (result && result.error) {
    console.log("sign in failed", result.error);
    return { message: "Invalid email or password" };
  }
  console.log("sign in successfully");
  // Fetch user role and isBlocked from DB
  //   const user = await prisma.user.findUnique({
  //     where: { phone: data.phone },
  //     select: { role: true, isBlocked: true },
  //   });

  // Deny login if user is blocked
  //   if (user?.isBlocked) {
  //     return { message: "Your account is blocked. Please contact support." };
  //   }

  // Redirect based on role
  //   if (user?.role === "ADMIN") {
  //     redirect("/en/admin/dashboard");
  //   } else {
  //     redirect("/en/customer/dashboard");
  //   }

  return { message: "Login successful" };
}


export async function logout() {
  try {
    await signOut({ redirect: false });
    redirect("/en/login");
    return { message: "Logout successful", status: true };
  } catch (error) {
    console.error("Logout failed:", error);
    return { message: "Logout failed", status: false };
  }
}
export async function checkAuthentication() {
  const session = await signIn("credentials", { redirect: false });
  if (!session || !session.user) {
    redirect("/en/login");
  }
  return session;
}

export async function isAuthenticated() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return false;
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return false;
  }
  return true;
}

export async function loginData() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return "Unauthorized";
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return "User not found";
  }
  return user;
}
  
