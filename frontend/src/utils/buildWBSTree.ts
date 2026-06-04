import { WBSData } from "@/types/cbs-wbs";

/**
 * Convert flat WBS array to tree structure for Tabulator
 * @param flatData - Flat array of WBS items
 * @returns Tree-structured array with _children
 */
export function buildWBSTree(flatData: WBSData[]): WBSData[] {
  const map = new Map<string, WBSData>();
  const roots: WBSData[] = [];

  // Create map of all items with empty _children arrays
  flatData.forEach((item) => {
    map.set(item.wbs_id, { ...item, children: [] });
  });

  // Build tree by assigning children to parents
  flatData.forEach((item) => {
    const node = map.get(item.wbs_id)!;
    if (item.wbs_parent_id) {
      const parent = map.get(item.wbs_parent_id);
      if (parent) {
        parent.children!.push(node);
      } else {
        // Parent not found, treat as root
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Clean up empty _children arrays for leaf nodes
  map.forEach((node) => {
    if (node.children!.length === 0) {
      delete node.children;
    }
  });

  return roots;
}

/**
 * Find a WBS item by its ID in a flat array
 * @param flatData - Flat array of WBS items
 * @param wbsId - WBS ID to find
 * @returns WBS item or undefined if not found
 */
export function findWBSItem(
  flatData: WBSData[],
  wbsId: string
): WBSData | undefined {
  return flatData.find((item) => item.wbs_id === wbsId);
}
