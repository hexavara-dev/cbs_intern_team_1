import { WBSData } from "@/types/cbs-wbs";
import { sortWBSId } from "@/utils/sortWBSId";

/**
 * Re-indexes all WBS items to ensure sequential numbering (1, 1.1, 1.2, 2, ...).
 * It preserves the hierarchy but reassigns IDs based on the sorted order of siblings.
 */
interface WBSNode extends WBSData {
  childrenNodes: WBSNode[];
}

export function reindexWBS(flatData: WBSData[]): WBSData[] {
  // 1. Build hierarchy tree from flat data
  const roots: WBSNode[] = [];

  // Deep copy to avoid mutating original objects during processing
  const items: WBSNode[] = flatData.map((item) => ({
    ...item,
    childrenNodes: [] as WBSNode[],
  }));

  // Helper to find initial parent (before re-ID)
  // We use a temporary map by OLD ID to reconstruct tree
  const itemsByOldId: Record<string, WBSNode> = {};
  items.forEach((item) => {
    itemsByOldId[item.wbs_id] = item;
  });

  items.forEach((item) => {
    if (item.wbs_parent_id && itemsByOldId[item.wbs_parent_id]) {
      itemsByOldId[item.wbs_parent_id].childrenNodes.push(item);
    } else {
      roots.push(item);
    }
  });

  // Sort siblings by their OLD ID to maintain relative order
  const sortNodes = (nodes: WBSNode[]) => {
    return nodes.sort((a, b) => sortWBSId(a.wbs_id, b.wbs_id));
  };

  const newFlatList: WBSData[] = [];

  // Recursive function to assign new IDs
  const processNode = (node: WBSNode, newId: string, newParentId: string) => {
    // Create new node with updated IDs
    const newNode: WBSNode = {
      ...node,
      wbs_id: newId,
      wbs_parent_id: newParentId,
    };
    // Remove the temporary childrenNodes property
    const { childrenNodes: _childrenNodes, ...cleanNode } = newNode;
    newFlatList.push(cleanNode);

    // Process children
    const sortedChildren = sortNodes(node.childrenNodes);
    sortedChildren.forEach((child: WBSNode, index: number) => {
      const childParams = newId ? `${newId}.${index + 1}` : `${index + 1}`;
      processNode(child, childParams, newId);
    });
  };

  // Process roots
  const sortedRoots = sortNodes(roots);
  sortedRoots.forEach((root, index) => {
    processNode(root, `${index + 1}`, "");
  });

  return newFlatList;
}
