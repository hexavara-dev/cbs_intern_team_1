import { cbsService } from "@/services/cbsService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCBSMasterData = () => {
  return useQuery({
    queryKey: ["cbs"],
    queryFn: cbsService.getAll,
  });
};

export const useCBSProjectSelections = (projectId: string) => {
  return useQuery({
    queryKey: ["cbs", "project", projectId],
    queryFn: () => cbsService.getProjectSelections(projectId),
  });
};

export const useUpdateCBSProjectSelections = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cbsCategoryIds: string[]) =>
      cbsService.updateProjectSelections(projectId, cbsCategoryIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cbs", "project", projectId],
      });
      toast.success("Berhasil Memilih Kategori CBS!");
    },
    onError: (error: Error) => {
      toast.error(`Error memilih kategori CBS: ${error.message}`);
    },
  });
};

export const useCreateCBS = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; cost_type: string }) =>
      cbsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cbs"] });
      toast.success("Kategori CBS berhasil ditambahkan!");
    },
    onError: (error: Error) => {
      toast.error(`Error menambahkan kategori CBS: ${error.message}`);
    },
  });
};

export const useDeleteCBS = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cbsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cbs"] });
      toast.success("Kategori CBS berhasil dihapus!");
    },
    onError: (error: Error) => {
      toast.error(`Error menghapus kategori CBS: ${error.message}`);
    },
  });
};
