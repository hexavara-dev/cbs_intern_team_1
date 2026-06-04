import { WBSData } from "@/types/cbs-wbs";

/**
 * Generate next top-level category ID (1, 2, 3, ...)
 * @param wbsData - Flat array of WBS items
 * @returns Next available category ID as string
 */
export function generateNextCategoryId(wbsData: WBSData[]): string {
  // Get all top-level items (no parent)
  const topLevelIds = wbsData
    .filter((item) => !item.wbs_parent_id || item.wbs_parent_id === "")
    .map((item) => Number(item.wbs_id))
    .filter((num) => !isNaN(num));

  if (topLevelIds.length === 0) {
    return "1";
  }

  return String(Math.max(...topLevelIds) + 1);
}
