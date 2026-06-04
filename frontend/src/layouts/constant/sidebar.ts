import {
  BarChart,
  CircleDollarSign,
  ClipboardList,
  GitBranch,
  Home,
  LayoutDashboard,
  LineChart,
  Info,
  BanknoteArrowUp,
} from "lucide-react";

import { SidebarGroup } from "@/types/layout";

// Main sidebar - shown when NOT in project context
export const mainSidebarData: SidebarGroup[] = [
  {
    groupLabel: "Projects",
    items: [
      {
        label: "Ongoing Projects",
        description: "Active Projects",
        href: "/projects/ongoing",
        icon: Home,
      },
      {
        label: "Completed Projects",
        description: "Finished Projects",
        href: "/projects/completed",
        icon: LayoutDashboard,
      },
      {
        label: "Cost Control",
        description: "Global Cost Monitoring",
        href: "/projects/cost-control",
        icon: CircleDollarSign,
      },
    ],
  },
  {
    groupLabel: "CBS",
    items: [
      {
        label: "Cost Category",
        description: "Add Cost Category for Projects",
        href: "/cbs",
        icon: Home,
      },
    ],
  },
];

// Project sidebar - shown when IN project context
export const getProjectSidebarData = (projectId: string): SidebarGroup[] => [
  {
    groupLabel: "Project",
    items: [
      {
        label: "Project Overview",
        description: "Project Information",
        href: `/projects/${projectId}`,
        icon: Info,
        exact: true,
      },
      {
        label: "Project Cost In",
        description: "Cost In Management",
        href: `/projects/${projectId}/cost-in`,
        icon: BanknoteArrowUp,
      },
    ],
  },
  {
    groupLabel: "Planning",
    items: [
      {
        label: "WBS",
        description: "Work Breakdown Structure",
        href: `/projects/${projectId}/wbs`,
        icon: GitBranch,
      },
      {
        label: "Termin Planning",
        description: "Progress per Termin",
        href: `/projects/${projectId}/termin-planning`,
        icon: ClipboardList,
      },
    ],
  },
  {
    groupLabel: "Monitoring",
    items: [
      {
        label: "Cost Control",
        description: "History & Record Cost",
        href: `/projects/${projectId}/cost-control`,
        icon: CircleDollarSign,
      },
      {
        label: "Cost Report",
        description: "View Budget vs Actual",
        href: `/projects/${projectId}/cost-report`,
        icon: BarChart,
      },
      {
        label: "Progress Monitoring",
        description: "Track And Record Progress",
        href: `/projects/${projectId}/progress-monitoring`,
        icon: LineChart,
      },
    ],
  },
];

// Keep legacy export for backwards compatibility (will be removed later)
export const sidebarItemData = mainSidebarData;
