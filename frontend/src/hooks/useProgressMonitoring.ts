import { progressMonitoringService } from "@/services/progressMonitoringService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetProgressTable = (projectId: string) => {
  return useQuery({
    queryKey: ["progress", projectId, "table"],
    queryFn: async () => {
      const response =
        await progressMonitoringService.getProgressTable(projectId);
      return response;
    },
  });
};

export const useGetProgressSummary = (projectId: string) => {
  return useQuery({
    queryKey: ["progress", projectId, "summary"],
    queryFn: async () => {
      const response =
        await progressMonitoringService.getProgressSummary(projectId);
      return response;
    },
  });
};

export const useGetProgressHistory = (projectId: string) => {
  return useQuery({
    queryKey: ["progress", projectId, "history"],
    queryFn: async () => {
      const response =
        await progressMonitoringService.getProgressHistory(projectId);
      return response;
    },
  });
};

export const useGetDetailProgressHistory = (
  projectId: string,
  progressId: string
) => {
  return useQuery({
    queryKey: ["progress", projectId, "history", progressId],
    queryFn: async () => {
      const response = await progressMonitoringService.getDetailProgressHistory(
        projectId,
        progressId
      );
      return response;
    },
  });
};

export const useCreateProgressRecord = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await progressMonitoringService.createProgressRecord(
        projectId,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", projectId] });
    },
    onError: () => {
      toast.error("Gagal menyimpan pembaruan progres. Silakan coba lagi.");
    },
  });
};
