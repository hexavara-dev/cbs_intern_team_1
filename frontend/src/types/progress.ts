export type ProgressTask = {
  wbs_id: string;
  termin_value: string;
  actual_progress: number;
};

export type ProgressSummaryByTermin = {
  planned_volume: number;
  actual_volume: number;
  termin_label: string;
  termin_sequence: number;
  termin_category: "termin" | "adendum";
  percentage: number;
};

export type ProgressSummaryData = {
  total_planned: number;
  total_executed: number;
  by_termin: ProgressSummaryByTermin[];
};

export type WBSProgressMonitoringAllocation = {
  id: string;
  termin_sequence: string;
  termin_category: "termin" | "adendum";
  planned_volume: number;
  actual_volume: number;
};

export type WBSProgressMonitoringItem = {
  id: string;
  wbs_id: string;
  description: string;
  planned_volume: number;
  unit: string;
  is_leaf: boolean;
  parent_id: string | null;
  progress: WBSProgressMonitoringAllocation[];
};

export type ProgressHistoryRecord = {
  id: string;
  project_id?: string;
  progress_date: string;
  wbs_item: {
    wbs_id: string;
    description: string;
  };
  termin: {
    category: "termin" | "adendum";
    sequence: string;
  };
  description: string;
  actual_volume: number;
  unit: string;
  photo_url?: string[] | string;
  created_by?: {
    id: string;
    full_name: string;
  };
};
