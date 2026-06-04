export interface CreateWbsDTO {
	wbs_id: string;
	wbs_parent_id?: string;
	description: string;
	volume?: number;
	unit?: string;
	is_leaf: boolean;
	total_cost?: number;
	cbs_category?: Record<string, number>;
}
export interface WBSLeaf {
	id: string;
	wbs_id: string;
	description: string;
}
export interface GetTotalCost {
	total_cost: number;
}
export interface WBSCost {
	id: string;
	wbs_item_id: string;
	cbs_category_id: string | null;
	unit_cost: number;
	updated_at: Date | undefined;
}
export interface GetProjectWBSDTO {
	id: string;
	wbs_id: string;
	description: string;
	parent_id: string | null;
	total_cost: number;
	level: number;
	volume: number | null;
	unit: string | null;
	is_leaf: boolean;
	costs: WBSCost[];
}
export interface UpdateWbsDTO {
	description?: string;
	volume?: number;
	unit?: string;
	is_leaf?: boolean;
	cbs_category?: Record<string, number>;
	total_cost: number;
}
