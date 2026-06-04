import { costInService } from "@/services/costInService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetCostInRecords = (projectId: string) => {
  return useQuery({
    queryKey: ["costs", projectId, "cost-in"],
    queryFn: async () => {
      const response = await costInService.getAll(projectId);
      return response;
    },
  });
};

export const useGetCostInSummary = (projectId: string) => {
  return useQuery({
    queryKey: ["costs", projectId, "cost-in", "summary"],
    queryFn: async () => {
      const response = await costInService.getSummary(projectId);
      return response;
    },
  });
};

export const useGetCostInRecord = (projectId: string, recordId: string) => {
  return useQuery({
    queryKey: ["costs", projectId, "cost-in", recordId],
    queryFn: async () => {
      const response = await costInService.getDetail(projectId, recordId);
      return response;
    },
  });
};

export const useCreateCostIn = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await costInService.create(projectId, data);
      return response;
    },
    onSuccess: () => {
      toast.success("Berhasil menambahkan Cost In!");
      queryClient.invalidateQueries({
        queryKey: ["costs", projectId, "cost-in"],
      });
    },
    onError: () => {
      toast.error("Gagal menambahkan Cost In. Silakan coba lagi.");
    },
  });
};
