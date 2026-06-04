import { wbsService } from "@/services/wbsService";
import { WBSData } from "@/types/cbs-wbs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetWBS = (projectId: string) => {
  return useQuery({
    queryKey: ["wbs", projectId],
    queryFn: () => wbsService.getAll(projectId),
    enabled: !!projectId,
  });
};

export const useGetWBSLeaf = (projectId: string) => {
  return useQuery({
    queryKey: ["wbs", projectId, "wbs-leaf"],
    queryFn: () => wbsService.getLeaf(projectId),
    enabled: !!projectId,
  });
};

export const useGetTotalRAP = (projectId: string) => {
  return useQuery({
    queryKey: ["wbs", projectId, "total-rap"],
    queryFn: () => wbsService.getTotalRAP(projectId),
    enabled: !!projectId,
  });
};

export const useCreateWBS = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<WBSData, "totalCost">) =>
      wbsService.create(projectId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wbs", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["costs", projectId] });
      toast.success("WBS berhasil ditambahkan!");
    },
    onError: (error: Error) => {
      toast.error("Gagal membuat WBS: " + error.message);
    },
  });
};

export const useUpdateWBS = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WBSData>) =>
      wbsService.update(projectId, data.wbs_id!, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wbs", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["costs", projectId] });
      toast.success("Berhasil memperbarui WBS!");
    },
    onError: (error: Error) => {
      toast.error("Gagal memperbarui WBS: " + error.message);
    },
  });
};

export const useDeleteWBS = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (wbsId: string) => wbsService.delete(projectId, wbsId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wbs", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["costs", projectId] });
      toast.success("WBS berhasil dihapus!");
    },
    onError: (error: Error) => {
      toast.error("Gagal menghapus WBS: " + error.message);
    },
  });
};
