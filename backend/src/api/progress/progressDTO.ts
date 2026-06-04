import type { TerminCategory } from "../termin/terminModel";

export interface ProgressInformation {
	id: string;
	termin_category: string;
	termin_sequence: number;
	planned_volume: number;
	actual_volume: number;
}

export interface GetWBSProgressDTO {
	id: string;
	wbs_id: string;
	description: string;
	planned_volume: number | null;
	actual_volume: number;
	unit: string | null;
	is_leaf: boolean;
	parent_id: string | null;
	progress: ProgressInformation[];
}

export interface TerminProgressSummary {
	termin_label: string;
	termin_sequence: number;
	termin_category: TerminCategory;
	planned_volume: number;
	actual_volume: number;
	percentage: number;
}

export interface GetProgressSummaryDTO {
	total_planned: number;
	total_executed: number;
	by_termin: TerminProgressSummary[];
}

export interface GetProgressHistory {
	id: string;
	project_id: string;
	progress_date: Date;
	wbs_item: {
		wbs_id: string;
		description: string;
	};
	termin: {
		category: string;
		sequence: number;
	};
	description: string;
	actual_volume: number;
	unit: string | null;
	photo_url: string[];
}

export interface UpdateProgressDTO {
	wbs_id: string;
	actual_volume: number;
	description: string;
}
