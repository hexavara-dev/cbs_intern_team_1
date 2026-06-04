import { ReactNode } from "react";

import { cn } from "@/lib/cn";

import Typography from "@/components/Typography";

type LabelTextProps = {
  children: ReactNode;
  htmlFor?: string;
  labelTextClassname?: string;
  required?: boolean;
  className?: string;
};

export default function LabelText({
  children,
  htmlFor,
  labelTextClassname,
  required,
  className,
}: LabelTextProps) {
  return (
    <label htmlFor={htmlFor} className={className}>
      <Typography
        as="p"
        variant="label"
        weight="semibold"
        className={cn("text-typo-main mb-1 text-xs", labelTextClassname)}
      >
        {children} {required && <span className="text-danger-main">*</span>}
      </Typography>
    </label>
  );
}
