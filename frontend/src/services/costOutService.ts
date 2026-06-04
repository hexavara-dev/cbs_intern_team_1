import api from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { CostOutRecord } from "@/types/cost";

export const costOutService = {
  getProject: async (projectId: string) => {
    const response = await api.get<ApiResponse<CostOutRecord[]>>(
      `/projects/${projectId}/costs`
    );
    return response.data.data;
  },

  getAll: async ({projectName} : {projectName: string}) => {
    const response = await api.get<ApiResponse<CostOutRecord[]>>(`/projects/records/?projectName=${projectName}`);
    return response.data.data;
  },

  getById: async (projectId: string, recordId: string) => {
    const response = await api.get<ApiResponse<CostOutRecord>>(
      `/projects/${projectId}/costs/${recordId}`
    );
    return response.data.data;
  },

  createCostDescription: async (description: string) => {
    const response = await api.post<ApiResponse<string>>(
      `/cost-item-description`,
      { description }
    );
    return response.data.data;
  },

  getCostDescriptions: async () => {
    const response = await api.get<ApiResponse<{ description: string }[]>>(
      `/cost-item-description`
    );
    return response.data.data;
  },

  createCostOut: async (projectId: string, data: FormData) => {
    const response = await api.post<ApiResponse<CostOutRecord>>(
      `/projects/${projectId}/costs`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  approve: async (recordId: string, data: FormData) => {
    const response = await api.patch<ApiResponse<CostOutRecord>>(
      `/costs/${recordId}/approve`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  process: async (projectId: string, recordId: string) => {
    const response = await api.post<ApiResponse<CostOutRecord>>(
      `/projects/${projectId}/costs/${recordId}`
    );
    return response.data.data;
  },

  reject: async (recordId: string, reason: string) => {
    const response = await api.patch<ApiResponse<CostOutRecord>>(
      `/costs/${recordId}/reject`,
      { reason }
    );
    return response.data.data;
  },
};
