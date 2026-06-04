import * as React from "react";
import {
  Controller,
  get,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";

import { cn } from "@/lib/cn";

import HelperText from "@/components/ui/helper-text";
import LabelText from "@/components/ui/label-text";

import ErrorText from "./error-text";

type TextareaProps = {
  name: string;
  label?: string;
  labelClassname?: string;
  helperText?: string;
  helperTextClassname?: string;
  validation?: RegisterOptions;
} & React.ComponentProps<"textarea">;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      name,
      label,
      labelClassname,
      helperText,
      helperTextClassname,
      validation,
      className,
      ...props
    },
    ref
  ) => {
    const {
      control,
      formState: { errors },
    } = useFormContext();

    const error = get(errors, name);

    return (
      <Controller
        name={name}
        control={control}
        rules={validation}
        render={({ field }) => (
          <div className="w-full">
            {label && <LabelText className={labelClassname}>{label}</LabelText>}

            <textarea
              {...field}
              ref={ref}
              className={cn(
                "border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none",
                error && "border-error-light",
                className
              )}
              {...props}
            />

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

Textarea.displayName = "Textarea";

export { Textarea };
