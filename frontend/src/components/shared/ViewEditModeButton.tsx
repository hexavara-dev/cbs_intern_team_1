"use client";

import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewEditModeButtonProps {
  isEditMode: boolean;
  onToggle: () => void;
  className?: string;
}

export default function ViewEditModeButton({
  isEditMode,
  onToggle,
  className = "",
}: ViewEditModeButtonProps) {
  return (
    <Button
      type="button"
      variant={isEditMode ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className={`gap-2 ${className}`}
    >
      {isEditMode ? (
        <>
          <Eye size={16} />
          View Mode
        </>
      ) : (
        <>
          <Pencil size={16} />
          Edit Mode
        </>
      )}
    </Button>
  );
}
