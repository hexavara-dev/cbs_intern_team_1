"use client";

import { Search } from "lucide-react";

interface TableSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TableSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: TableSearchInputProps) {
  return (
    <div className={`relative w-fit md:w-64 ${className}`}>
      <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border pr-3 pl-8 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
