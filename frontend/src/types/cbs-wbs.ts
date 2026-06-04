export type CBSData = {
  name: string;
  type: string;
  selected: boolean;
};

export type WBSCostMap = Record<string, number>;

export type WBSData = {
  wbs_id: string;
  wbs_parent_id: string;
  cbs_category: WBSCostMap;
  description: string;
  volume: number;
  unit: string;
  totalCost: number;
  total_cost?: number;
  is_leaf: boolean;
  children?: WBSData[];
  node_id?: string;
};

export type WBSLeafData = {
  id: string;
  wbs_id: string;
  description: string;
};

export type ColumnProps = {
  header: string;
  type: "text" | "numeric";
  readOnly?: boolean;
};
