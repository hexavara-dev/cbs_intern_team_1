import { create } from "zustand";
import { WBSData } from "@/types/cbs-wbs";
import { sortWBSId } from "@/utils/sortWBSId";
import { reindexWBS } from "@/utils/reindexWBS";

type WBSStore = {
  projectId: string | null;
  wbsData: WBSData[];
  setWBSData: (data: WBSData[], projectId?: string) => void;
  addItem: (item: WBSData) => void;
  updateItem: (wbsId: string, updates: Partial<WBSData>) => void;
  updateCBSCost: (wbsId: string, cbsKey: string, value: number) => void;
  deleteItem: (wbsId: string) => void;
  recalculateAllCosts: (
    selectedCBS: { name: string; type: string }[],
    calculateWBSCost: (
      volume: number,
      categories: { name: string; type: string; cost: number }[]
    ) => number,
    calculateParentCost: (children: WBSData[]) => number
  ) => void;
  getWBSData: () => WBSData[];
  clearWBSData: () => void;
};

export const useWBSStore = create<WBSStore>((set, get) => ({
  // Initial state
  projectId: null,
  wbsData: [] as WBSData[],

  // Set WBS data
  setWBSData: (data, projectId) =>
    set({
      wbsData: data.sort((a, b) => sortWBSId(a.wbs_id, b.wbs_id)),
      projectId: projectId || null,
    }),

  // Add new item
  addItem: (item) =>
    set((state) => ({
      wbsData: [...state.wbsData, item].sort((a, b) =>
        sortWBSId(a.wbs_id, b.wbs_id)
      ),
    })),

  // Update item fields
  updateItem: (wbsId, updates) =>
    set((state) => ({
      wbsData: state.wbsData
        .map((item) => (item.wbs_id === wbsId ? { ...item, ...updates } : item))
        .sort((a, b) => sortWBSId(a.wbs_id, b.wbs_id)),
    })),

  // Update CBS cost for specific item
  updateCBSCost: (wbsId, cbsKey, value) =>
    set((state) => ({
      wbsData: state.wbsData
        .map((item) =>
          item.wbs_id === wbsId
            ? {
                ...item,
                cbs_category: { ...item.cbs_category, [cbsKey]: value },
              }
            : item
        )
        .sort((a, b) => sortWBSId(a.wbs_id, b.wbs_id)),
    })),

  // Delete item and all children
  deleteItem: (wbsId) =>
    set((state) => {
      const itemToDelete = state.wbsData.find((item) => item.wbs_id === wbsId);
      if (!itemToDelete) return state;

      // Filter out item and its children
      const remainingItems = state.wbsData.filter((item) => {
        if (item.wbs_id === wbsId) return false;
        if (item.wbs_id.startsWith(`${wbsId}.`)) return false;
        return true;
      });

      // Reindex the remaining items to fill gaps
      // This handles both renumbering and parent/leaf status logic implicitly
      // (because reindex acts on the flat list structure)
      // However, we still need to check if a parent became childless to set it as leaf

      const reindexedItems = reindexWBS(remainingItems);

      // Check for parents that lost all children (became leaves)
      // reindexWBS preserves hierarchy based on OLD parent_id connection logic inside it,
      // but since we deleted the parent's children, reindexWBS sees them as gone.
      // We need to ensure the parent (if it exists in reindexed list) is marked as leaf if it has no children.

      const finalItems = reindexedItems.map((item) => {
        const hasChildren = reindexedItems.some(
          (child) => child.wbs_parent_id === item.wbs_id
        );
        if (!hasChildren && !item.is_leaf) {
          return { ...item, is_leaf: true, totalCost: 0 };
        }
        return item;
      });

      return {
        wbsData: finalItems.sort((a, b) => sortWBSId(a.wbs_id, b.wbs_id)),
      };
    }),

  // Recalculate all costs (leaf nodes first, then parents)
  recalculateAllCosts: (selectedCBS, calculateWBSCost, calculateParentCost) =>
    set((state) => {
      // First, recalculate leaf node costs
      let updated = state.wbsData.map((item) => {
        if (!item.is_leaf) return item;

        const cbsCategories = selectedCBS.map((cbs) => {
          const key = cbs.name;
          const cost = Number(item.cbs_category?.[key] ?? 0);
          return { name: cbs.name, type: cbs.type, cost };
        });

        return {
          ...item,
          totalCost: calculateWBSCost(item.volume, cbsCategories),
        };
      });

      // Then recalculate parent costs (multiple passes for deep hierarchies)
      for (let i = 0; i < 5; i++) {
        updated = updated.map((item) => {
          if (item.is_leaf) return item;

          const children = updated.filter(
            (child) => child.wbs_parent_id === item.wbs_id
          );

          return {
            ...item,
            totalCost: calculateParentCost(children),
          };
        });
      }

      return {
        wbsData: updated.sort((a, b) => sortWBSId(a.wbs_id, b.wbs_id)),
      };
    }),

  // Get all WBS data
  getWBSData: () => get().wbsData,

  // Clear data
  clearWBSData: () => set({ wbsData: [], projectId: null }),
}));
