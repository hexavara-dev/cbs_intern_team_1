import React, { ReactNode } from "react";
import Typography from "@/components/Typography";
import { cn } from "@/lib/cn";
import { LucideIcon } from "lucide-react";

interface ProjectInfoCardProps {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  label,
  icon: Icon,
  children,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  className,
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
      <div className="flex flex-col gap-0.5">
        <Typography
          as="div"
          className="text-xl leading-none font-bold text-gray-900"
        >
          {children}
        </Typography>
        <Typography
          variant="body"
          className="text-sm font-medium text-gray-400"
        >
          {label}
        </Typography>
      </div>
    </div>
  );
};
