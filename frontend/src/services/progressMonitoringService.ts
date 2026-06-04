import api from "@/lib/api";
import { ApiResponse } from "@/types/api";
import {
  ProgressHistoryRecord,
  ProgressSummaryData,
  WBSProgressMonitoringItem,
} from "@/types/progress";

export const progressMonitoringService = {
  getProgressTable: async (projectId: string) => {
    const response = await api.get<ApiResponse<WBSProgressMonitoringItem[]>>(
      `/projects/${projectId}/progress/table`
    );
    return response.data.data;
  },

  getProgressSummary: async (projectId: string) => {
    const response = await api.get<ApiResponse<ProgressSummaryData>>(
      `/projects/${projectId}/progress/summary`
    );
    return response.data.data;
  },

  getProgressHistory: async (projectId: string) => {
    const response = await api.get<ApiResponse<ProgressHistoryRecord[]>>(
      `/projects/${projectId}/progress/history`
    );
    return response.data.data;
  },

  getDetailProgressHistory: async (projectId: string, progressId: string) => {
    const response = await api.get<ApiResponse<ProgressHistoryRecord>>(
      `/projects/${projectId}/progress/history/${progressId}`
    );
    return response.data.data;
  },

  createProgressRecord: async (projectId: string, data: FormData) => {
    const response = await api.post<ApiResponse<ProgressHistoryRecord>>(
      `/projects/${projectId}/progress`,
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
