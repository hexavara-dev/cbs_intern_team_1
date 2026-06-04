import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { costOutService } from "@/services/costOutService";
import { toast } from "sonner";

export const useGetProjectCostOut = (projectId: string) => {
  return useQuery({
    queryKey: ["costs", projectId],
    queryFn: () => costOutService.getProject(projectId),
  });
};

export const useGetAllCostOut = ({ projectName }: { projectName: string }) => {
  return useQuery({
    queryKey: ["costs", "all", projectName],
    queryFn: () => costOutService.getAll({ projectName }),
    placeholderData: keepPreviousData,
  });
};

export const useGetCostOutById = (projectId: string, recordId: string) => {
  return useQuery({
    queryKey: ["costs", projectId, recordId],
    queryFn: () => costOutService.getById(projectId, recordId),
  });
};

export const useCreateCostDescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (description: string) =>
      costOutService.createCostDescription(description),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["costs", "descriptions"],
      });
    },
  });
};

export const useGetCostDescriptions = () => {
  return useQuery({
    queryKey: ["costs", "descriptions"],
    queryFn: () => costOutService.getCostDescriptions(),
  });
};

export const useCreateCostOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: FormData }) =>
      costOutService.createCostOut(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["costs", variables.projectId],
      });
    },
  });
};

export const useApproveCostOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: FormData }) =>
      costOutService.approve(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["costs"],
      });
      toast.success("Cost Request Approved!");
    },
    onError: () => {
      toast.error("Failed to approve cost request. Please try again.");
    },
  });
};

export const useProcessCostOut = (project_id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId }: { recordId: string }) =>
      costOutService.process(project_id, recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["costs"],
      });
      toast.success("Cost Request Processed!");
    },
    onError: () => {
      toast.error("Failed to process cost request. Please try again.");
    },
  });
};

export const useRejectCostOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, reason }: { recordId: string; reason: string }) =>
      costOutService.reject(recordId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["costs"],
      });
      toast.success("Cost Request Rejected!");
    },
    onError: () => {
      toast.error("Failed to reject cost request. Please try again.");
    },
  });
};
