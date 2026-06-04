import type { TerminCategory } from "./terminModel";

export interface UpdateTermin {
	description: string;
	nominal: number;
}

export interface CreatedAdendumTermin {
	id: string;
	description: string;
	nominal: number;
	sequence: number;
	category: TerminCategory;
}

export interface GetTermin {
	id: string;
	project_id: string;
	description: string;
	category: TerminCategory;
	sequence: number;
	nominal: number;
	percentage: number;
}

export interface DeleteTermin {
	resequenced: boolean;
}
