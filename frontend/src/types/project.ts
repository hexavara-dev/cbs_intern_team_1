import { TerminInformation } from "./termin";

export type ProjectStatus =
  | "ongoing"
  | "finish"
  | "closed"
  | "maintenance"
  | "canceled"
  | "hold";

export type Project = {
  id: string;
  name: string;
  description: string;
  location: string;
  budget: number;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  progress: number;
  total_adendum: number;

  // Attributes for project detail page - not required for project list
  cbs_categories: CBSCategory[]; // CBS categories assigned to this project
  termin: TerminInformation[]; // Termin information for this project
  adendum: TerminInformation[]; // Adendum information for this project
};

export type CBSCategory = {
  name: string;
  type: "Per Item" | "Borongan";
  selected: boolean;
};
