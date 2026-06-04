"use client";

import { create } from "zustand";
import { CostOutRecord } from "@/types/cost";

type CostStore = {
  projectId: string | null;
  records: CostOutRecord[];
  setRecords: (records: CostOutRecord[], projectId?: string) => void;
  addRecord: (record: CostOutRecord) => void;
  deleteRecord: (id: string) => void;
  clearRecords: () => void;
  getRecordsByProject: (projectId: string) => CostOutRecord[];
  getRecordsByWBS: (projectId: string, wbsId: string) => CostOutRecord[];
  approveRecord: (id: string, notaProof?: string) => void;
  rejectRecord: (id: string) => void;
};

export const useCostStore = create<CostStore>((set, get) => ({
  projectId: null,
  records: [
    // {
    //   id: "REC-001",
    //   project_id: "PRJ-004",
    //   wbs_id: "WBS-001",
    //   cbs_category: "Repair-Per Item",
    //   date: "2024-03-15",
    //   vendor: "TB Sejahtera",
    //   status: "approved",
    //   items: [
    //     {
    //       id: "ITEM-001",
    //       description: "Emergency Repairs",
    //       cbs_category: "Repair-Per Item",
    //       cost: 600000000,
    //       quantity: 1,
    //       total: 600000000,
    //     },
    //   ],
    //   total_amount: 600000000,
    // },
    // {
    //   id: "REC-002",
    //   project_id: "PRJ-001",
    //   wbs_id: "1.1",
    //   cbs_category: "Material-Per Item",
    //   date: "2024-02-10",
    //   vendor: "Mitra Perkasa",
    //   status: "approved",
    //   items: [
    //     {
    //       id: "ITEM-002",
    //       description: "High-end Interior Materials",
    //       cbs_category: "Material-Per Item",
    //       cost: 1300000000,
    //       quantity: 1,
    //       total: 1300000000,
    //     },
    //   ],
    //   total_amount: 1300000000,
    // },
  ],

  setRecords: (records, projectId) =>
    set({
      records,
      projectId: projectId ?? null,
    }),

  addRecord: (record) =>
    set((state) => ({
      records: [record, ...state.records],
    })),

  deleteRecord: (id) =>
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
    })),

  clearRecords: () => set({ records: [], projectId: null }),

  getRecordsByProject: (projectId) => {
    // Only return records that are NOT rejected?? Or all?
    // Usually for reporting we only want approved?
    // For now returning all, page logic handles filtering.
    // Actually the requirement implies "recorded in cost history" = "approved".
    return get().records.filter((r) => r.project_id === projectId);
  },

  getRecordsByWBS: (projectId, wbsId) => {
    return get().records.filter(
      (r) => r.project_id === projectId && r.wbs_item.wbs_code === wbsId
    );
  },

  approveRecord: (id, notaProof) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, status: "approved", nota_proof: notaProof } : r
      ),
    })),

  rejectRecord: (id) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, status: "rejected" } : r
      ),
    })),
}));
