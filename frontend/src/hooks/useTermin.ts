import { terminService } from "@/services/terminService";
import { TerminAllocationPayload } from "@/types/termin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetProjectTermin = (projectId: string) => {
  return useQuery({
    queryKey: ["projects", projectId, "termins"],
    queryFn: () => terminService.getProjectTermin(projectId),
    enabled: !!projectId,
  });
};

export const useGetAllTerminAllocations = (projectId: string) => {
  return useQuery({
    queryKey: ["projects", projectId, "termin-allocations"],
    queryFn: () => terminService.getAllTerminAllocations(projectId),
    enabled: !!projectId,
  });
};

export const useSaveTerminAllocations = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TerminAllocationPayload) =>
      terminService.saveTerminAllocations(projectId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "termin-allocations"],
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal menyimpan alokasi: " + error.message);
    },
  });
};
