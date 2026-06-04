import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LucideIcon } from "lucide-react";

type ConfirmDialogProps = {
  buttonClassname?: string;
  leftIcon?: LucideIcon;
  placeholder?: string;
  title: string;
  description: string;
  disabled?: boolean;
  onConfirm: () => void;
  customTrigger?: React.ReactNode;
};

export function ConfirmDialog({
  buttonClassname,
  leftIcon,
  placeholder,
  title,
  description,
  disabled,
  onConfirm,
  customTrigger,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
          <Button
            disabled={disabled}
            leftIcon={leftIcon}
            className={cn("w-full self-end sm:w-44", buttonClassname)}
          >
            {placeholder}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={disabled}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
