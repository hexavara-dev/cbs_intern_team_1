import { TerminInformation } from "./termin";
import { UserReference } from "./user";
import { Vendor } from "./vendor";

export type WBSDataCostRecord = {
  description: string;
  id: string;
  wbs_code: string;
};

export type CBSDataCostRecord = {
  id: string;
  name: string;
  cost_type: string;
};

export type CostOutRecord = {
  id: string;
  project_name?: string;
  project_id: string;
  wbs_item: WBSDataCostRecord;
  activity_name?: string;
  transaction_date: string;
  vendor?: Vendor;
  status?: "pending" | "onproses" | "approved" | "rejected";
  nota_proof?: string;
  nota_file?: string;
  items: CostItem[];
  total_amount: number;
  submitted_by?: UserReference;
  approved_by?: UserReference;
  approved_at?: string;
  approved_file: string;
  rejection_reason?: string;
};

export type WBSCostOutRecordDetail = {
  wbs_info: {
    id: string;
    wbs_id: string;
    description: string;
    is_leaf: boolean;
    planned_cost: number;
    actual_cost: number;
  };
  cost_records: CostOutRecord[];
};

export type CostItem = {
  id: string;
  description?: string[];
  cbs_category?: CBSDataCostRecord;
  unit_cost: number;
  quantity: number;
  total: number;
};

export type CostCBSCategorySummary = {
  cbs_category_id: CBSDataCostRecord;
  cbs_name: string;
  cost_type: string;
  planned_cost: number;
  actual_cost: number;
};

export type CostSummary = {
  project_id: string;
  budget: number;
  total_actual_cost: number;
  by_cbs_category: CostCBSCategorySummary[];
};

export type CostInRecord = {
  id: string;
  termin: TerminInformation;
  transaction_date: string;
  description: string;
  amount: number;
};

export type CostInTerminSummary = {
  termin: (TerminInformation & {
    total_received: number;
  })[];
  total_cost_in: number;
};

export type CostInRecordDetail = CostInRecord & {
  proof_file?: string;
  created_by?: UserReference;
};
