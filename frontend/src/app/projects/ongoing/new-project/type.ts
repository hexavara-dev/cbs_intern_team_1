import { ProjectStatus } from "@/types/project";
import { TerminInformation } from "@/types/termin";

export type CreateNewProjectFormValues = {
  project_name: string;
  location: string;
  description: string;
  budget: number;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  termin: TerminInformation[];
};
