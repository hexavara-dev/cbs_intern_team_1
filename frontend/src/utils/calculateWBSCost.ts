import { WBSData } from "@/types/cbs-wbs";

/**
 * Calculate total cost for a WBS item based on CBS categories and their types
 * @param volume - Volume of the WBS item
 * @param cbsCategories - Array of CBS categories with name, type, and cost
 * @returns Total calculated cost
 */
export function calculateWBSCost(
  volume: number,
  cbsCategories: { name: string; type: string; cost: number }[]
): number {
  return cbsCategories.reduce((total, cbs) => {
    if (cbs.type === "Per Item") {
      return total + cbs.cost * volume;
    } else {
      // Borongan
      return total + cbs.cost;
    }
  }, 0);
}

/**
 * Calculate total cost for a parent node by summing all children costs
 * @param children - Array of child WBS items
 * @returns Sum of all children's total costs
 */
export function calculateParentCost(children: WBSData[]): number {
  return children.reduce((total, child) => total + child.totalCost, 0);
}
