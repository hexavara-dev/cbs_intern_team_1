"use client";

import { FormProvider, useForm } from "react-hook-form";
import { HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";

import Typography from "@/components/Typography";
import { Input } from "@/components/shared/form/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoginFormValues } from "./type";
import { useLoginMutation } from "@/hooks/useAuth";

export default function LoginPage() {
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useLoginMutation();

  const onSubmit = (data: LoginFormValues) => {
    mutate(data);
  };

  return (
    <Card className="rounded-3xl border-none p-6 py-10 shadow-xl md:p-12">
      <CardContent className="space-y-6 px-0">
        <div className="space-y-2 text-center">
          <Typography as="h1" variant="h3" weight="bold">
            Hello!
          </Typography>
          <Typography
            as="p"
            variant="label"
            className="text-muted-foreground text-base"
          >
            Sign In to Get Started
          </Typography>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              name="email"
              label="Email Address"
              placeholder="Email Address"
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
              placeholder="Password"
              type="password"
              leftIcon={HiOutlineLockClosed}
              validation={{
                required: "Password is required",
              }}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {!isPending ? (
                "Login"
              ) : (
                <>
                  <svg
                    className="mr-2 size-5 animate-spin text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M22 12a10 10 0 0 0-10-10v4a6 6 0 0 1 6 6h4Z"
                    />
                  </svg>
                  Login...
                </>
              )}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
