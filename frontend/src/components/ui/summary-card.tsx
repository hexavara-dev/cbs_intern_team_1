import React, { ReactNode } from "react";
import Typography from "@/components/Typography";
import { cn } from "@/lib/cn";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  label: string;
  icon: LucideIcon;
  children?: ReactNode;
  value?: string | number;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
  allowWrap?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  icon: Icon,
  children,
  value,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  className,
  allowWrap = false,
}) => {
  const content = children || value;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-gray-200 hover:shadow-md",
        allowWrap ? "min-h-[100px]" : "h-[100px]",
        className
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
          iconBgColor
        )}
      >
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>
      <div className="flex w-full flex-col gap-1 overflow-hidden">
        <Typography
          variant="label"
          className="truncate text-xs font-medium tracking-wider text-gray-500 uppercase"
        >
          {label}
        </Typography>

        <div
          title={
            typeof content === "string" || typeof content === "number"
              ? String(content)
              : undefined
          }
        >
          <Typography
            as="div"
            className={cn(
              "text-lg leading-tight font-bold text-gray-900",
              allowWrap ? "break-words whitespace-normal" : "truncate"
            )}
          >
            {content}
          </Typography>
        </div>
      </div>
    </div>
  );
};
