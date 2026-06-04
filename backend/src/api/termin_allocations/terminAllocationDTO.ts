import type { TerminCategory } from "../termin/terminModel";

export interface GetTerminWBSAllocationDTO {
	id: string;
	wbs_id: string;
	description: string;
	volume: number | null;
	level: number;
	unit: string | null;
	is_leaf: boolean;
	parent_id: string | null;
	allocations: TerminAllocationInformation[];
}
export interface AllocateWBSTerminDTO {
	wbs_id: string;
	termin_id: string;
	volume: number;
}
export interface TerminAllocationInformation {
	id: string;
	termin_id: string;
	termin_sequence: number;
	termin_category: TerminCategory;
	volume: number;
}
