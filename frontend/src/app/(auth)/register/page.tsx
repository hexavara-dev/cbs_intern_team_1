"use client";

import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import {
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlineUser,
} from "react-icons/hi";

import Typography from "@/components/Typography";
import { Input } from "@/components/shared/form/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RegisterFormValues } from "./type";

export default function RegisterPage() {
  const methods = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, watch } = methods;

  const onSubmit = (data: RegisterFormValues) => {
    console.log("Register Data:", data);
  };

  const password = watch("password");

  return (
    <Card className="rounded-3xl border-none p-6 py-10 shadow-xl md:p-12">
      <CardContent className="space-y-6 px-0">
        <div className="space-y-2 text-center">
          <Typography as="h1" variant="h3" weight="bold">
            Create Account
          </Typography>
          <Typography
            as="p"
            variant="label"
            className="text-muted-foreground text-base"
          >
            Enter your details below to create your account
          </Typography>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              name="name"
              label="Full Name"
              placeholder="John Doe"
              leftIcon={HiOutlineUser}
              validation={{ required: "Full name is required" }}
            />
            <Input
              name="email"
              label="Email"
              placeholder="name@example.com"
              type="email"
              leftIcon={HiOutlineMail}
              validation={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
            />
            <Input
              name="password"
              label="Password"
              placeholder="••••••••"
              type="password"
              leftIcon={HiOutlineLockClosed}
              validation={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              }}
            />
            <Input
              name="confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
              type="password"
              leftIcon={HiOutlineLockClosed}
              validation={{
                required: "Please confirm your password",
                validate: (value: string) =>
                  value === password || "Passwords do not match",
              }}
            />
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </FormProvider>
        <div className="flex flex-col items-center justify-center space-y-2 pt-4 text-center">
          <Typography variant="label" className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-dark-gray font-medium hover:underline"
            >
              Sign In
            </Link>
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
