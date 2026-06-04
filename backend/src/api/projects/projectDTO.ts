import type { ProjectAttributes } from "./projectModel";
import type { ProjectStatus } from "./projectSchema";

export interface ProjectTerminDTO {
	id: string;
	sequence: number;
	nominal: number;
	description: string;
	category: string;
	percentage?: number;
}
export interface GetProjectParam {
	id: string;
	[key: string]: string;
}
export interface GetProjectDTO {
	id: string;
	name: string;
	description: string;
	location: string;
	budget: number;
	start_date: Date;
	end_date: Date;
	status: ProjectStatus;
	is_termin_by_progress: boolean;
	created_by: string;
	progress: number;
}
export interface UpdateProjectDTO {
	name?: string;
	description?: string;
	location?: string;
	budget?: number;
	start_date?: Date;
	end_date?: Date;
	status?: ProjectStatus;
	progress?: number;
	termin?: ProjectTerminDTO[];
}
export interface GetProjectDetailDTO extends GetProjectDTO {
	total_adendum: number;
	termin: ProjectTerminDTO[];
}
export interface CreateProjectDTO extends Omit<ProjectAttributes, "id" | "status" | "progress" | "created_by"> {
	termin: ProjectTerminDTO[];
}
