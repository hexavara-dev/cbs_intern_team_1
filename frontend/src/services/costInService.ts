import api from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { CostInRecord, CostInRecordDetail, CostInTerminSummary } from "@/types/cost";

export const costInService = {
  getAll: async (projectId: string) => {
    const response = await api.get<ApiResponse<CostInRecord[]>>(
      `/projects/${projectId}/cost-in`
    );
    return response.data.data;
  },
  getDetail: async (projectId: string, recordId: string) => {
    const response = await api.get<ApiResponse<CostInRecordDetail>>(
      `/projects/${projectId}/cost-in/${recordId}`
    );
    return response.data.data;
  },
  getSummary: async (projectId: string) => {
    const response = await api.get<ApiResponse<CostInTerminSummary>>(
      `/projects/${projectId}/cost-in/summary`
    );
    return response.data.data;
  },
  create: async (projectId: string, data: FormData) => {
    const response = await api.post<ApiResponse<CostInRecord>>(
      `/projects/${projectId}/cost-in`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },
};
