import type { CBSCostType } from "../cbs/cbsSchema";

export interface ProjectCBSSelectionDTO {
	id: string;
	name: string;
	cost_type: CBSCostType;
}

export interface UpdateCBSSelectionsDTO {
	cbs_category_ids: string[];
}

export interface ProjectCBSParam {
	projectId: string;
	[key: string]: string;
}
