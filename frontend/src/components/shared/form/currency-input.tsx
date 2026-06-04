import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import { Input } from "@/components/shared/form/input";
import { cn } from "@/lib/cn";

type CurrencyInputProps = {
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  validation?: RegisterOptions;
  disabled?: boolean;
};

// Helper to format number to IDR currency string (e.g. 100000 -> 100.000)
export const formatNumber = (value: number | string) => {
  if (value === undefined || value === null || value === "") return "";
  const number = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(number)) return "";
  return new Intl.NumberFormat("id-ID").format(number);
};

// Helper to parse currency string back to number (e.g. 100.000 -> 100000)
export const parseNumber = (value: string) => {
  return Number(value.replace(/[^0-9]/g, ""));
};

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  name,
  label,
  placeholder,
  className,
  validation,
  disabled,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      rules={validation}
      render={({ field: { onChange, value, ...field } }) => (
        <Input
          {...field}
          label={label}
          placeholder={placeholder}
          className={cn("tracking-wide t", className)}
          disabled={disabled}
          value={formatNumber(value)}
          onChange={(e) => {
            const rawValue = parseNumber(e.target.value);
            onChange(rawValue);
          }}
          type="text" // Must be text to allow formatting characters
        />
      )}
    />
  );
};
