import { LucideIcon, Search } from "lucide-react";

import Typography from "@/components/Typography";
import { Button, ButtonProps } from "@/components/ui/button";

export default function ButtonPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1200px] items-center justify-center py-20">
      <Typography as="h1" variant="h1" font="sans" weight="bold">
        Buttons
      </Typography>

      <div className="flex flex-wrap gap-4">
        {BUTTONS.map((button, idx) => (
          <Button
            key={idx}
            variant={button.variant}
            size={button.size}
            leftIcon={button.LeftIcon}
            rightIcon={button.RightIcon}
          >
            {button.label}
          </Button>
        ))}
      </div>
    </main>
  );
}

type ButtonData = {
  label: string;
  variant: ButtonProps["variant"] | undefined;
  size: ButtonProps["size"];
  LeftIcon?: LucideIcon;
  RightIcon?: LucideIcon;
};

const BUTTONS: ButtonData[] = [
  {
    label: "Default",
    variant: undefined,
    size: "default",
    LeftIcon: Search,
    RightIcon: Search,
  },
  {
    label: "Destructive",
    variant: "destructive",
    size: "default",
  },
  {
    label: "Outline",
    variant: "outline",
    size: "default",
  },
  {
    label: "Secondary",
    variant: "secondary",
    size: "default",
  },
  {
    label: "Ghost",
    variant: "ghost",
    size: "default",
  },
  {
    label: "Link",
    variant: "link",
    size: "default",
  },
  {
    label: "Small",
    variant: undefined,
    size: "sm",
  },
  {
    label: "Large",
    variant: undefined,
    size: "lg",
  },
];
