import { costReportService } from "@/services/costReportService";
import { useQuery } from "@tanstack/react-query";

export const useGetCostSummary = (projectId: string) => {
  return useQuery({
    queryKey: ["costs", projectId, "summary"],
    queryFn: async () => {
      const response = await costReportService.getCostSummary(projectId);
      return response;
    },
  });
};

export const useGetWBSCostReport = (projectId: string) => {
  return useQuery({
    queryKey: ["costs", projectId, "wbs"],
    queryFn: async () => {
      const response = await costReportService.getWBSCostReport(projectId);
      return response;
    },
  });
};

export const useGetWBSCostReportDetail = (projectId: string, wbsId: string) => {
  return useQuery({
    queryKey: ["costs", projectId, "wbs", "detail", wbsId],
    queryFn: async () => {
      const response = await costReportService.getWBSCostReportDetail(
        projectId,
        wbsId
      );
      return response;
    },
  });
};
