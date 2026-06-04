import * as React from "react";
import {
  Controller,
  get,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";
import { IconType } from "react-icons";
import { HiEye, HiEyeOff } from "react-icons/hi";

import { cn } from "@/lib/cn";

import HelperText from "@/components/ui/helper-text";
import LabelText from "@/components/ui/label-text";

import ErrorText from "../../ui/error-text";

type InputProps = {
  label?: string;
  name: string;
  labelClassname?: string;
  validation?: RegisterOptions;
  helperText?: string;
  helperTextClassname?: string;
  rightIcon?: IconType;
  leftIcon?: IconType;
  rightIconClassname?: string;
  leftIconClassname?: string;
} & React.ComponentProps<"input">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      validation,
      name,
      labelClassname,
      type,
      label,
      helperText,
      helperTextClassname,
      rightIcon: RightIcon,
      rightIconClassname,
      leftIcon: LeftIcon,
      leftIconClassname,
      ...props
    },
    ref
  ) => {
    const {
      control,
      formState: { errors },
    } = useFormContext();

    const [showPassword, setShowPassword] = React.useState(false);
    const error = get(errors, name);

    return (
      <Controller
        control={control}
        name={name}
        rules={validation}
        render={({ field: { value, onChange, ...field } }) => (
          <div className="w-full">
            {label && <LabelText className={labelClassname}>{label}</LabelText>}

            <div className="relative">
              {LeftIcon && (
                <div
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-2 -translate-y-1/2",
                    "text-muted-foreground text-lg md:text-xl",
                    leftIconClassname
                  )}
                >
                  <LeftIcon />
                </div>
              )}

              <input
                type={
                  type === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : type
                }
                {...field}
                value={type === "file" ? undefined : value}
                onChange={(e) => {
                  if (type === "file") {
                    onChange(e.target.files);
                  } else {
                    onChange(e);
                  }
                }}
                ref={ref}
                className={cn(
                  "border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                  RightIcon || (type === "password" && "pr-10"),
                  LeftIcon && "pl-10",
                  className,
                  error && "border-error-light"
                )}
                {...props}
              />

              {RightIcon && type !== "password" && (
                <div
                  className={cn(
                    "pointer-events-none absolute top-1/2 right-2 -translate-y-1/2",
                    "text-muted-foreground text-lg md:text-xl",
                    rightIconClassname
                  )}
                >
                  <RightIcon />
                </div>
              )}

              {type === "password" && (
                <div>
                  <div
                    className={cn(
                      "absolute top-1/2 right-2 -translate-y-1/2",
                      "text-muted-foreground text-lg md:text-xl",
                      "hover:cursor-pointer"
                    )}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <HiEye /> : <HiEyeOff />}
                  </div>
                </div>
              )}
            </div>

            {helperText && (
              <HelperText className={helperTextClassname}>
                {helperText}
              </HelperText>
            )}
            {error && <ErrorText>{error.message?.toString()}</ErrorText>}
          </div>
        )}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
