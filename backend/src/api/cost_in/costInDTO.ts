import type { TerminCategory } from "../termin/terminModel";

export interface GetProjectCostInDTO {
	id: string;
	termin: {
		id: string;
		sequence: number;
		category: TerminCategory;
		description: string;
		nominal: number;
	};
	transaction_date: Date;
	description: string;
	amount: number;
}

export interface TerminCostInInformation {
	id: string;
	sequence: number;
	category: TerminCategory;
	description: string;
	nominal: number;
	total_received: number;
}

export interface GetProjectCostInSummaryDTO {
	total_cost_in: number;
	termin: TerminCostInInformation[];
}

export interface MakeCostInDTO {
	category?: string;
	transaction_date: Date;
	description: string;
	amount: number;
}

export interface CostInDetailDTO extends GetProjectCostInDTO {
	proof_file: string;
	created_by: {
		id: string;
		full_name: string;
	};
}
