import { create } from "zustand";
import { CBSData } from "@/types/cbs-wbs";

type CBSStore = {
  cbsData: CBSData[];
  pendingSelection: Set<number>; // Indexes of items with pending toggle changes
  setCBSData: (data: CBSData[]) => void;
  addCategory: (category: CBSData) => void;
  toggleSelect: (index: number) => void;
  confirmSelection: () => void;
  cancelSelection: () => void;
  deleteCategory: (index: number) => void;
  updateCategory: (index: number, data: CBSData) => void;
  getPendingState: (index: number) => boolean;
  hasPendingChanges: () => boolean;
  getSelectedCBS: () => CBSData[];
};

export const useCBSStore = create<CBSStore>((set, get) => ({
  // MOCK INITIAL CBS DATA === DELETE THIS IF INTEGRATED WITH API
  cbsData: [
    { name: "Material", type: "Per Item", selected: false },
    { name: "Sewa Alat", type: "Per Item", selected: false },
    { name: "Sewa Tenaga Kerja", type: "Borongan", selected: false },
  ],

  // Pending selection state - tracks which indexes have been toggled but not confirmed
  pendingSelection: new Set<number>(),

  // Get CBS Data From API
  setCBSData: (data) => set({ cbsData: data, pendingSelection: new Set() }),

  addCategory: (category) =>
    set((state) => ({
      cbsData: [...state.cbsData, category],
    })),

  // Toggle pending selection (doesn't immediately update selected state)
  toggleSelect: (index) =>
    set((state) => {
      const newPending = new Set(state.pendingSelection);
      if (newPending.has(index)) {
        newPending.delete(index);
      } else {
        newPending.add(index);
      }
      return { pendingSelection: newPending };
    }),

  // Confirm pending selections - apply changes to cbsData
  confirmSelection: () =>
    set((state) => ({
      cbsData: state.cbsData.map((item, i) =>
        state.pendingSelection.has(i)
          ? { ...item, selected: !item.selected }
          : item
      ),
      pendingSelection: new Set(),
    })),

  // Cancel pending selections - discard changes
  cancelSelection: () => set({ pendingSelection: new Set() }),

  deleteCategory: (index) =>
    set((state) => ({
      cbsData: state.cbsData.filter((_, i) => i !== index),
      pendingSelection: new Set(), // Reset pending if data changes
    })),

  updateCategory: (index, data) =>
    set((state) => ({
      cbsData: state.cbsData.map((item, i) => (i === index ? data : item)),
    })),

  // Get the effective pending state for display (current selected XOR pending toggle)
  getPendingState: (index) => {
    const state = get();
    const item = state.cbsData[index];
    if (!item) return false;
    const isPending = state.pendingSelection.has(index);
    return isPending ? !item.selected : item.selected;
  },

  // Check if there are any pending changes
  hasPendingChanges: () => get().pendingSelection.size > 0,

  // Get selected CBS (confirmed selections only)
  getSelectedCBS: () => get().cbsData.filter((item) => item.selected === true),
}));
