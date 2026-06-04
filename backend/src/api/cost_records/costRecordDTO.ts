import type { GetVendorDTO } from "../vendor/vendorDTO";
import type { CostRecordStatus } from "./costRecordModel";

export interface CostItemsDTO {
	description: string;
	cbs_category_id: string;
	unit_cost: number;
	quantity: number;
	total: number;
}

export interface GetAllProjectsCostRecordDTO {
	id: string;
	project_name: string;
	activity_name: string;
	wbs_item: {
		id: string;
		wbs_code: string;
		description: string;
	};
	vendor: GetVendorDTO;
	transaction_date: Date;
	status: CostRecordStatus;
	total_amount: number;
	items: CostRecordCostItem[];
	created_at: Date;
}

export interface GetProjectCostRecordDTO {
	id: string;
	project_id: string;
	activity_name: string;
	wbs_item: {
		id: string;
		wbs_code: string;
		description: string;
	};
	vendor: GetVendorDTO;
	transaction_date: Date;
	status: CostRecordStatus;
	total_amount: number;
	item_count: number;
	items: CostRecordCostItem[];
	created_at: Date;
}

export interface GetTotalCostRecordDTO {
	total_cost: number;
}

export interface GetSummaryProjectCost {
	project_id: string;
	budget: number;
	total_actual_cost: number;
	by_cbs_category: GetTotalCostRecordPerCategory[];
}

export interface GetTotalCostRecordPerCategory {
	cbs_category_id: string;
	cbs_name: string;
	cost_type: string;
	planned_cost: number;
	actual_cost: number;
}

export interface GetDetailtProjectCostRecordDTO extends GetProjectCostRecordDTO {
	nota_proof: string;
	submitted_by: {
		id: string;
		full_name: string;
	};
	approved_by: {
		id: string;
		full_name: string;
	} | null;
	approved_at: Date | null;
	approved_file: string | null;
	rejection_reason: string | undefined;
}
export interface CostRecordDetail extends GetProjectCostRecordDTO {
	submitted_by: {
		id: string;
		full_name: string;
	};
	approved_by: {
		id: string;
		full_name: string;
	} | null;
}
export interface GetWBSCostReportDTO {
	id: string;
	wbs_id: string;
	description: string;
	is_leaf: boolean;
	planned_cost: number;
	actual_cost: number;
}
export interface GetDetailWBSCostReportDTO {
	wbs_info: GetWBSCostReportDTO;
	cost_records: CostRecordDetail[];
}
export interface CostRecordCostItem {
	id: string;
	description: string;
	cbs_category: {
		id?: string;
		name?: string;
		cost_type?: string;
	} | null;
	unit_cost: number;
	quantity: number;
	total: number;
}

export interface CreateCostRecordDTO {
	wbs_item_id: string;
	vendor_id: string;
	activity_name: string;
	transaction_date: Date;
	total_amount: number;
	items: CostItemsDTO[];
}

export interface CostRecordVendor {
	id: string;
	name: string;
}

export interface CreatedCostRecordDTO {
	id: string;
	status: string;
	total_amount: number;
	items_count: number;
	vendor: CostRecordVendor;
	created_at: Date;
}

export interface ApprovedUserDTO {
	id: string;
	full_name: string;
}

export interface ApproveCostRecordDTO {
	id: string;
	status: string;
	approved_by: ApprovedUserDTO;
	approved_at: Date | null;
}

export interface RejectCostRecordReasonDTO {
	reason: string;
}

export interface RejectCostRecordDTO {
	id: string;
	status: string;
	rejection_reasone: string;
	updated_at: Date;
}
