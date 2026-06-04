export type TerminInformation = {
  id?: string;
  sequence: string;
  percentage?: number;
  description: string;
  nominal: number;
  category?: "termin" | "adendum";
};

export type TerminTask = {
  wbs_id: string;
  description: string;
  planned_volume: number;
  unit: string;
  allocations?: WBSTerminAllocation[];
};

export type TerminData = {
  project_id: string;
  termin_value: string;
  termin_task: TerminTask;
};

export type WBSTerminAllocation = {
  id?: string;
  termin_allocation_id?: string;
  termin_id: string;
  termin_sequence: string;
  termin_category: "termin" | "adendum";
  volume: number;
};

export type WBSTerminPlanningItem = {
  id: string;
  wbs_id: string;
  description: string;
  volume: number;
  unit: string;
  is_leaf: boolean;
  parent_id: string | null;
  allocations: WBSTerminAllocation[];
};

export type TerminAllocationPayload = {
  wbs_id: string;
  termin_id: string;
  volume: number;
};

