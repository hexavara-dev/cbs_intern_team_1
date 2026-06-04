import { WBSData } from "@/types/cbs-wbs";

export type BackendWBSItem = {
  id: string;
  wbs_id: string;
  parent_id: string | null;
  description: string;
  volume: string;
  unit: string;
  is_leaf: boolean;
  total_cost: string;
  costs: Array<{
    cbs_category_id: string;
    unit_cost: string;
  }>;
};

type CBSMapping = {
  id: string;
  name: string;
  type: string;
};

/**
 * Transform WBS data from backend format to frontend format
 * - Maps costs array to cbs_category object
 * - Renames parent_id to wbs_parent_id
 * - Converts string numbers to actual numbers
 */
export function transformWBSFromBackend(
  backendData: BackendWBSItem[],
  cbsCategories: CBSMapping[]
): WBSData[] {
  // Create a mapping from CBS ID to CBS name for quick lookup
  const cbsIdToName = new Map<string, string>();
  cbsCategories.forEach((cbs) => {
    cbsIdToName.set(cbs.id, cbs.name);
  });

  // Create a mapping from backend UUID to wbs_id
  // so we can convert parent_id (UUID) → parent's wbs_id (e.g. "1")
  const uuidToWbsId = new Map<string, string>();
  backendData.forEach((item) => {
    uuidToWbsId.set(item.id, item.wbs_id);
  });

  return backendData.map((item) => {
    // Transform costs array to cbs_category object
    const cbsCategory: Record<string, number> = {};
    item.costs?.forEach((cost) => {
      const cbsName = cbsIdToName.get(cost.cbs_category_id);
      if (cbsName) {
        cbsCategory[cbsName] = Number(cost.unit_cost);
      }
    });

    return {
      wbs_id: item.wbs_id,
      wbs_parent_id: item.parent_id
        ? uuidToWbsId.get(item.parent_id) || ""
        : "",
      description: item.description,
      volume: Number(item.volume),
      unit: item.unit,
      cbs_category: cbsCategory,
      totalCost: Number(item.total_cost),
      is_leaf: item.is_leaf,
    };
  });
}
