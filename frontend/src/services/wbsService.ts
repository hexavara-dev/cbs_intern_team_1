import api from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { WBSData, WBSLeafData } from "@/types/cbs-wbs";

export const wbsService = {
  getAll: async (projectId: string) => {
    const response = await api.get<ApiResponse<WBSData[]>>(
      `/projects/${projectId}/wbs`
    );
    return response.data;
  },

  getLeaf: async (projectId: string) => {
    const response = await api.get<ApiResponse<WBSLeafData[]>>(
      `/projects/${projectId}/wbs/leaf`
    );
    return response.data.data;
  },

  getTotalRAP: async (projectId: string) => {
    const response = await api.get<ApiResponse<number>>(
      `/projects/${projectId}/total-cost`
    );
    return response.data.data;
  },

  create: async (projectId: string, data: Omit<WBSData, "totalCost">) => {
    const response = await api.post<ApiResponse<WBSData>>(
      `/projects/${projectId}/wbs`,
      data
    );
    return response.data;
  },

  update: async (projectId: string, wbsId: string, data: Partial<WBSData>) => {
    const response = await api.patch<ApiResponse<WBSData>>(
      `/projects/${projectId}/wbs/${wbsId}`,
      data
    );
    return response.data;
  },

  delete: async (projectId: string, wbsId: string) => {
    const response = await api.delete<ApiResponse<{ deleted_count: number }>>(
      `/projects/${projectId}/wbs/${wbsId}`
    );
    return response.data;
  },
};
