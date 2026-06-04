/**
 * Generic type for WBS tree node structure.
 * Requires `wbs_id` and `children`, while `description` is required for search filtering.
 */
export type HierarchicalNode<T> = T & {
  wbs_id: string;
  description: string;
  children?: HierarchicalNode<T>[];
};

/**
 * Convert any flat WBS array to a hierarchical tree structure.
 * @param flatData - Flat array of WBS items
 * @param getParentId - Function to extract the parent ID from an item.
 *                      If it returns null/empty, the item is treated as a root node.
 * @returns Tree-structured array with `children` arrays
 */
export function buildHierarchicalTree<
  T extends { wbs_id: string; description?: string },
>(
  flatData: T[],
  getParentId: (item: T) => string | null | undefined
): HierarchicalNode<T>[] {
  const map = new Map<string, HierarchicalNode<T>>();
  const roots: HierarchicalNode<T>[] = [];

  // Create map of all items with empty children arrays
  flatData.forEach((item) => {
    map.set(item.wbs_id, {
      ...item,
      children: [],
    } as unknown as HierarchicalNode<T>);
  });

  // Build tree by assigning children to parents
  flatData.forEach((item) => {
    const node = map.get(item.wbs_id)!;
    const parentId = getParentId(item);

    if (parentId) {
      const parent = map.get(parentId);
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

  // Clean up empty children arrays for leaf nodes
  map.forEach((node) => {
    if (node.children!.length === 0) {
      delete node.children;
    }
  });

  return roots;
}

/**
 * Filter a hierarchical tree recursively based on a search query.
 * Matches against `wbs_id` or `description`.
 * @param treeData - The tree data to filter
 * @param searchQuery - The search string
 * @returns A filtered tree where parent nodes are kept if any child matches.
 */
export function filterHierarchicalTree<T>(
  treeData: HierarchicalNode<T>[],
  searchQuery: string
): HierarchicalNode<T>[] {
  if (!searchQuery) return treeData;

  const lowerQuery = searchQuery.toLowerCase();

  const matches = (item: HierarchicalNode<T>): boolean => {
    const self =
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.wbs_id?.toLowerCase().includes(lowerQuery);

    const childMatch = item.children
      ? item.children.some((c) => matches(c))
      : false;

    return self || childMatch;
  };

  const filterTree = (nodes: HierarchicalNode<T>[]): HierarchicalNode<T>[] =>
    nodes
      .map((node) => ({
        ...node,
        children: node.children ? filterTree(node.children) : undefined,
      }))
      .filter((node) => matches(node));

  return filterTree(treeData);
}
