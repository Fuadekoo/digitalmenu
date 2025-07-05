"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAction from "@/hooks/useActions";
import { authenticate } from "@/actions/common/authentication";
import { Input } from "@heroui/input";
import { Button } from "@heroui/react";
import Loading from "@/components/loading";
import { addToast } from "@heroui/toast";
import Link from "next/link";
// import { auth } from "@/lib/auth";
// import { redirect } from "next/navigation";

function LoginPage() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  const [, action, loading] = useAction(authenticate, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Login",
          description: response.message,
        });
      } else {
        addToast({
          title: "Login",
          description: "Login successful!",
        });
      }
    },
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-6">
          Welcome to walmart
        </h1>
        <form onSubmit={handleSubmit(action)} className="space-y-5">
          <div>
            <Input
              type="phone"
              placeholder="Phone Number"
              {...register("phone")}
              className="w-full"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            isDisabled={loading}
            color="secondary"
            variant="flat"
            type="submit"
            className="w-full"
          >
            {loading ? <Loading /> : "Login"}
          </Button>
          <div className="mt-4 text-center">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link
              href="/en/signup"
              className="text-green-600 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </div>
          <div className="mt-2 text-center">
            <span className="text-gray-500 text-sm">
              If you have any problem in the system, please{" "}
              <Link
                href="/en/contact"
                className="text-blue-600 font-semibold hover:underline"
              >
                Contact Us
              </Link>
              .
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
