import { WBSData } from "@/types/cbs-wbs";

/**
 * Flatten tree structure to flat array
 * @param treeData - Tree-structured WBS data
 * @returns Flat array of WBS items
 */
export function flattenWBSTree(treeData: WBSData[]): WBSData[] {
  const result: WBSData[] = [];

  function traverse(items: WBSData[]) {
    items.forEach((item) => {
      // Add item without _children to result
      const { children, ...itemWithoutChildren } = item;
      result.push(itemWithoutChildren as WBSData);

      // Recursively traverse children
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  }

  traverse(treeData);
  return result;
}
