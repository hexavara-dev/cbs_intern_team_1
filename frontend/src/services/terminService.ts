import api from "@/lib/api";
import { ApiResponse } from "@/types/api";
import {
  TerminAllocationPayload,
  TerminInformation,
  WBSTerminPlanningItem,
} from "@/types/termin";

export const terminService = {
  getProjectTermin: async (projectId: string) => {
    const response = await api.get<ApiResponse<TerminInformation[]>>(
      `/projects/${projectId}/termins`
    );
    return response.data.data;
  },

  getAllTerminAllocations: async (projectId: string) => {
    const response = await api.get<ApiResponse<WBSTerminPlanningItem[]>>(
      `/projects/${projectId}/wbs-termin-planning`
    );
    return response.data.data;
  },

  saveTerminAllocations: async (
    projectId: string,
    payload: TerminAllocationPayload
  ) => {
    const response = await api.post<ApiResponse<void>>(
      `/projects/${projectId}/termin-allocations`,
      payload
    );
    return response.data;
  },
};
