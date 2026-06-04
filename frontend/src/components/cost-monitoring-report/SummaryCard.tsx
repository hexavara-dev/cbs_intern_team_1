import React from "react";
import Typography from "@/components/Typography";
import { cn } from "@/lib/cn";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
  valueClassName?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon: Icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  className,
  valueClassName,
}) => {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-5 rounded-[20px] border border-gray-50 bg-white p-6 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105",
          iconBgColor
        )}
      >
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>
      <div className="flex flex-col">
        <Typography
          variant="h6"
          weight="bold"
          className={cn("leading-tight text-gray-900", valueClassName)}
        >
          {value}
        </Typography>
        <Typography variant="body" className="font-medium text-gray-400">
          {label}
        </Typography>
      </div>
    </div>
  );
};
