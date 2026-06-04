"use client";

import { ChevronRight, X, ArrowLeft, LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";

import { cn } from "@/lib/cn";

import Typography from "@/components/Typography";

import { mainSidebarData, getProjectSidebarData } from "./constant/sidebar";
import { useAuthstore } from "@/store/useAuthStore";
import { useProject } from "@/hooks/useProjects";

import { SidebarItem as SidebarItemProps, SidebarGroup } from "@/types/layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function Sidebar({
  className,
  isOpen,
  setIsOpen,
  ...props
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Check if we're in a project context (e.g., /projects/PRJ-001/...)
  const projectIdMatch = pathname.match(/^\/projects\/([^/]+)/);
  const isInProjectContext =
    projectIdMatch &&
    projectIdMatch[1] !== "ongoing" &&
    projectIdMatch[1] !== "completed" &&
    projectIdMatch[1] !== "cost-control";
  const currentProjectId = isInProjectContext ? projectIdMatch[1] : null;

  // Get project info if in project context
  const { data: currentProject } = useProject(currentProjectId ?? "");

  const { isAuthed, logout } = useAuthstore();

  // Determine which sidebar data to use
  const sidebarData: SidebarGroup[] = useMemo(() => {
    if (isInProjectContext && currentProjectId) {
      return getProjectSidebarData(currentProjectId);
    }
    return mainSidebarData;
  }, [isInProjectContext, currentProjectId]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Projects: true,
    Project: true,
    Planning: true,
    Monitoring: true,
    Operations: true,
    CBS: true,
  });

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-45 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        {...props}
        className={cn(
          "border-border fixed top-0 left-0 z-50 flex h-[100dvh] w-[260px] flex-col overflow-hidden border-r bg-white transition-transform duration-300 md:z-40 md:mt-0 md:w-[280px] lg:w-[310px]",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="no-scrollbar w-full flex-1 overflow-y-auto p-4 pb-4">
          {/* Close Button */}
          <div className="mb-3 flex justify-end md:hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-2 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="text-gray-dark h-6 w-6" />
            </button>
          </div>

          <SidebarHeader />

          {/* Project Context Header */}
          {isInProjectContext && currentProject && (
            <div className="mt-4 rounded-lg border p-3">
              <Button
                leftIcon={ArrowLeft}
                className="mb-5 px-4!"
                onClick={() => router.push("/projects/ongoing")}
              >
                Back to Projects List
              </Button>
              <Typography
                variant="label"
                weight="bold"
                className="text-primary mt-2 block text-sm md:text-sm"
              >
                {currentProject.name}
              </Typography>
              <Typography
                variant="label"
                className="text-sm text-gray-500 md:text-sm"
              >
                {currentProject.location}
              </Typography>
            </div>
          )}

          <div className="mt-5 space-y-4">
            {sidebarData.map((group) => (
              <div key={group.groupLabel} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.groupLabel)}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-slate-500 hover:text-slate-900"
                >
                  <Typography
                    variant="label"
                    weight="bold"
                    className="text-[12px] font-bold tracking-wider uppercase md:text-sm"
                  >
                    {group.groupLabel}
                  </Typography>
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      openGroups[group.groupLabel] && "rotate-90"
                    )}
                  />
                </button>

                {openGroups[group.groupLabel] && (
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <SidebarItem
                        key={item.label}
                        {...item}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer (Logout/Login) */}
        {!isInProjectContext && !currentProject && (
          <div className="z-50 w-full flex-shrink-0 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {isAuthed ? (
              <Button
                variant="destructive"
                className="w-full justify-center py-5 text-base font-semibold"
                onClick={() => {
                  logout();
                  toast.success("Success Logout!");
                  router.push("/login");
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full justify-center py-5 text-base font-semibold"
                onClick={() => router.push("/login")}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Login
              </Button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

export function SidebarItem({
  label,
  description,
  href,
  icon: Icon,
  exact,
  onClick,
}: SidebarItemProps & { onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href ||
      (href !== pathname && pathname.startsWith(href + "/"));

  return (
    <li
      className={cn(
        "hover:bg-secondary flex cursor-pointer items-center rounded-md px-4 py-2.5 transition-colors",
        isActive && "bg-secondary"
      )}
    >
      <Link href={href} className="w-full" onClick={onClick}>
        <div className="flex w-full items-center gap-4 text-left">
          <Icon
            className={cn(
              "mt-0.5 !h-5 !w-5 flex-shrink-0 text-slate-500",
              isActive && "text-primary"
            )}
          />

          <div className="min-w-0 flex-1">
            <Typography
              weight="semibold"
              variant="label"
              className={cn(
                "text-sm text-slate-900 md:text-sm",
                isActive && "text-primary"
              )}
            >
              {label}
            </Typography>

            <Typography
              variant="label"
              className="text-xs leading-tight text-slate-500 md:text-sm"
            >
              {description}
            </Typography>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function SidebarHeader() {
  return (
    <div className="border-border flex w-full items-center gap-3 border-b p-3">
      <div>
        <Typography weight="bold" variant="h6">
          Project Cost
        </Typography>

        <Typography variant="body">Management System</Typography>
      </div>
    </div>
  );
}
