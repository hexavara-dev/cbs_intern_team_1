"use client";

import { Project } from "@/types/project";
import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getProjectStatusColor } from "@/utils/getProjectStatusColor";
import { calculateMonthDuration } from "@/utils/calculateMonthDuration";
import { formatCurrency } from "@/utils/formatCurrency";

interface ProjectTableProps {
  projects: Project[];
}

export default function ProjectTable({ projects }: ProjectTableProps) {
  const headers = [
    "No",
    "Project Name",
    "Location",
    "Duration",
    "Budget",
    "Status",
    "Progress",
    "Action",
  ];

  return (
    <div className="w-full">
      <div className="mb-4">
        <Typography variant="title" weight="semibold">
          Project List
        </Typography>
        <Typography variant="body" className="text-muted-foreground">
          Manage and monitor all your projects
        </Typography>
      </div>

      <div className="w-full max-w-[calc(100vw-40px)] overflow-x-auto rounded-md border shadow-sm md:max-w-full">
        <table className="w-full border-collapse">
          <thead className="bg-gray-700 text-white">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.map((project, index) => (
                <tr
                  key={project.id}
                  className="border-b transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-4 py-4 text-center text-sm font-medium text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <div className="max-w-[200px]">
                      <Typography weight="semibold" className="truncate">
                        {project.name}
                      </Typography>
                      <Typography
                        variant="label"
                        className="truncate text-gray-500"
                      >
                        {project.description}
                      </Typography>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-sm">
                    {project.location}
                  </td>
                  <td className="px-4 py-4 text-center text-sm">
                    {calculateMonthDuration(
                      project.start_date,
                      project.end_date
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-medium">
                    {formatCurrency(project.budget)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        getProjectStatusColor(project.status)
                      )}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="min-w-[120px] px-4 py-4 text-center">
                    <div className="flex flex-col gap-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={cn(
                            "bg-primary h-full transition-all duration-300",
                            project.status === "finish" ||
                              project.status === "closed"
                              ? "bg-green-600"
                              : ""
                          )}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink size={14} />
                        Open
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
