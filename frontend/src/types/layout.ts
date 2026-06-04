import { LucideIcon } from "lucide-react";

export type SidebarItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type SidebarGroup = {
  groupLabel: string;
  items: SidebarItem[];
};
