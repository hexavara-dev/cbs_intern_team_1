"use client";

import { Menu } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

import Typography from "@/components/Typography";
import { mainSidebarData, getProjectSidebarData } from "./constant/sidebar";
import { useProject } from "@/hooks/useProjects";

type NavbarProps = {
  onMenuClick: () => void;
};

function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: projectAPI } = useProject(projectId);

  // Extract projectId from path
  const projectIdMatch = pathname.match(/^\/projects\/([^/]+)/);
  const isInProjectContext =
    projectIdMatch &&
    projectIdMatch[1] !== "ongoing" &&
    projectIdMatch[1] !== "completed";
  const currentProjectId = isInProjectContext ? projectIdMatch[1] : null;

  // Get project data
  const project = projectAPI ?? null;

  // Get current menu label
  const currentMenu = useMemo(() => {
    const sidebarData =
      isInProjectContext && currentProjectId
        ? getProjectSidebarData(currentProjectId)
        : mainSidebarData;

    return sidebarData
      .flatMap((group) => group.items)
      .find((item) => {
        if (item.exact) return pathname === item.href;
        return (
          pathname === item.href ||
          (item.href !== pathname && pathname.startsWith(item.href + "/"))
        );
      });
  }, [pathname, isInProjectContext, currentProjectId]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white px-4 py-4 md:px-6 md:py-5 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button - Only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="text-gray-dark h-6 w-6" />
        </button>

        <div className="flex flex-col">
          <Typography weight="bold" variant="h6">
            {project ? project.name : "Dashboard"}
          </Typography>

          <Typography variant="body" className="text-muted-foreground">
            {currentMenu?.label ?? "Overview"}
          </Typography>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
