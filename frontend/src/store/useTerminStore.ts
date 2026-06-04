"use client";

import { create } from "zustand";
import { TerminData, TerminTask } from "@/types/termin";

type TerminStore = {
  projectId: string | null;
  terminData: TerminData[];
  setTerminData: (data: TerminData[], projectId?: string) => void;
  addTermin: (termin: TerminData) => void;
  updateTerminTask: (
    projectId: string,
    value: string,
    termin: TerminTask
  ) => void;
  removeTerminTask: (
    projectId: string,
    terminValue: string,
    wbsId: string
  ) => void;
  clearTerminData: () => void;
  getTerminData: () => TerminData[];
};

export const useTerminStore = create<TerminStore>((set, get) => ({
  projectId: null,
  terminData: [
    // {
    //   project_id: "PRJ-001",
    //   termin_value: "1",
    //   termin_task: { wbs_id: "1.1", description: "Flooring Works", volume: 20 }, // 20% of 100 weight, or arbitrary volume
    // },
    // {
    //   project_id: "PRJ-001",
    //   termin_value: "2",
    //   termin_task: { wbs_id: "1.2", description: "Wall Works 1", volume: 30 },
    // },
    // {
    //   project_id: "PRJ-001",
    //   termin_value: "3",
    //   termin_task: { wbs_id: "1.2", description: "Wall Works 2", volume: 50 },
    // },
  ],

  setTerminData: (data, projectId) =>
    set({
      terminData: data,
      projectId: projectId ?? null,
    }),

  addTermin: (termin) =>
    set((state) => ({
      terminData: [...state.terminData, termin],
    })),

  updateTerminTask: (projectId, terminValue, terminTask) =>
    set((state) => {
      const index = state.terminData.findIndex(
        (t) =>
          t.project_id === projectId &&
          t.termin_value === terminValue &&
          t.termin_task.wbs_id === terminTask.wbs_id
      );

      if (index > -1) {
        const newData = [...state.terminData];
        newData[index] = {
          ...newData[index],
          termin_task: {
            ...newData[index].termin_task,
            planned_volume: terminTask.planned_volume,
          },
        };
        return { terminData: newData };
      }
      return state;
    }),

  removeTerminTask: (projectId: string, terminValue: string, wbsId: string) =>
    set((state) => ({
      terminData: state.terminData.filter(
        (t) =>
          !(
            t.project_id === projectId &&
            t.termin_value === terminValue &&
            t.termin_task.wbs_id === wbsId
          )
      ),
    })),

  clearTerminData: () => set({ terminData: [], projectId: null }),

  getTerminData: () => get().terminData,
}));
