import type { CBSAttributes } from "./cbsModel";
import type { CBSCostType } from "./cbsSchema";

export interface GetCBSDTO {
	id: string;
	name: string;
	cost_type: CBSCostType;
	description: string | null;
}
export interface CreateCBSDTO extends Omit<CBSAttributes, "id" | "created_by" | "createdAt" | "updatedAt"> {}
export interface UpdateCBSParam {
	id: string;
	[key: string]: string;
}

export interface UpdateCBSDTO extends Omit<CBSAttributes, "id" | "created_by" | "createdAt" | "updatedAt"> {}
