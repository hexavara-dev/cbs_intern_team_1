import { LucideIcon } from "lucide-react";
import Typography from "@/components/Typography";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in-50 flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50 p-8 text-center",
        className
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        {Icon && <Icon className="h-6 w-6 text-gray-600" />}
      </div>
      <div className="mt-4 max-w-sm space-y-2">
        <Typography variant="title" weight="semibold" className="text-gray-900">
          {title}
        </Typography>
        <Typography variant="body" className="text-gray-500">
          {description}
        </Typography>
      </div>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
