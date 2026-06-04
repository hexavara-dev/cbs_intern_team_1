import { WBSCostMonitoringItem } from "@/components/cost-monitoring-report/WBSMonitoringTable";
import api from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { CostSummary, WBSCostOutRecordDetail } from "@/types/cost";

export const costReportService = {
  getCostSummary: async (projectId: string) => {
    const response = await api.get<ApiResponse<CostSummary>>(
      `/cost-report/${projectId}/costs/summary`
    );
    return response.data.data;
  },

  getWBSCostReport: async (projectId: string) => {
    const response = await api.get<ApiResponse<WBSCostMonitoringItem[]>>(
      `/cost-report/${projectId}/wbs`
    );
    return response.data.data;
  },

  getWBSCostReportDetail: async (projectId: string, wbsId: string) => {
    const response = await api.get<ApiResponse<WBSCostOutRecordDetail>>(
      `/cost-report/${projectId}/wbs/${wbsId}`
    );
    return response.data.data;
  },
};
