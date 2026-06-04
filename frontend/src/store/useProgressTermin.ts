"use client";

import { create } from "zustand";
import { ProgressTask } from "@/types/progress";

type ProgressStore = {
  projectId: string | null;
  progress: ProgressTask[];
  setProgress: (progress: ProgressTask[], projectId?: string) => void;
  updateProgress: (terminValue: string, wbsId: string, volume: number) => void;
  getProgressByTermin: (terminValue: string) => ProgressTask[];
  clearProgress: () => void;
};

export const useProgressTermin = create<ProgressStore>((set, get) => ({
  projectId: null,
  progress: [
    // { termin_value: "1", wbs_id: "1.1", actual_progress: 20 },
    // { termin_value: "2", wbs_id: "1.2", actual_progress: 15 },
  ],

  setProgress: (progress, projectId) =>
    set({
      progress,
      projectId: projectId ?? null,
    }),

  updateProgress: (terminValue, wbsId, volume) =>
    set((state) => {
      const index = state.progress.findIndex(
        (p) => p.termin_value === terminValue && p.wbs_id === wbsId
      );

      if (index > -1) {
        const newProgress = [...state.progress];
        newProgress[index] = {
          ...newProgress[index],
          actual_progress: volume,
        };
        return { progress: newProgress };
      } else {
        // Add new entry if not found
        return {
          progress: [
            ...state.progress,
            {
              termin_value: terminValue,
              wbs_id: wbsId,
              actual_progress: volume,
            },
          ],
        };
      }
    }),

  getProgressByTermin: (terminValue) =>
    get().progress.filter((p) => p.termin_value === terminValue),

  clearProgress: () => set({ progress: [], projectId: null }),
}));
