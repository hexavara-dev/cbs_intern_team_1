"use client";

import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Edit2, MapPin, Save } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/shared/form/input";
import InputSelect from "@/components/shared/form/input-select";
import { STATUS_OPTIONS } from "@/constants/project";
import { Project } from "@/types/project";
import { getProjectStatusColor } from "@/utils/getProjectStatusColor";
import { formatDate } from "date-fns";
import { calculateMonthDuration } from "@/utils/calculateMonthDuration";

interface ProjectHeaderProps {
  project: Project;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  onCancel: () => void;
}

export default function ProjectHeader({
  project,
  isEditing,
  onEditToggle,
  onCancel,
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex-1">
        {!isEditing ? (
          <>
            <div className="mb-2 flex items-center gap-3">
              <Typography variant="title" weight="bold">
                {project.name}
              </Typography>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                  getProjectStatusColor(project.status)
                )}
              >
                {project.status}
              </span>
            </div>
            <Typography variant="body" className="text-muted-foreground">
              {project.description}
            </Typography>

            <div className="mt-4 flex flex-col md:flex-row gap-5">
              <div className="text-muted-foreground flex items-center gap-2">
                <MapPin size={16} />
                <Typography variant="label" className="font-medium">
                  {project.location}
                </Typography>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <CalendarDays size={16} />
                <Typography variant="label" className="font-medium">
                  {formatDate(project.start_date, "dd MMM yyyy")} -{" "}
                  {formatDate(project.end_date, "dd MMM yyyy")}
                </Typography>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <Clock size={16} />
                <Typography variant="label" className="font-medium">
                  {calculateMonthDuration(project.start_date, project.end_date)}
                </Typography>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              name="name"
              label="Project Name"
              placeholder="e.g. Office Renovation"
              validation={{ required: "Project name is required" }}
            />
            <InputSelect
              name="status"
              label="Status"
              options={STATUS_OPTIONS}
              validation={{ required: "Status is required" }}
            />
            <div className="md:col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Brief project description..."
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => onEditToggle(true)}
          >
            <Edit2 size={16} />
            Edit Project
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onEditToggle(false);
                onCancel();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Save size={16} />
              Save Changes
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
