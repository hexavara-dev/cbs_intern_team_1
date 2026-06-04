import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateProjectDTO, projectService } from "@/services/projectService";
import { toast } from "sonner";
import { Project } from "@/types/project";
import { useRouter } from "next/navigation";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export function useProjects(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: projectKeys.list(filters || {}),
    queryFn: () => projectService.getAll(filters),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateProjectDTO) => projectService.create(data),
    onSuccess: async (res) => {
      toast.success("Berhasil membuat proyek baru!");

      if (res && res.id) {
        await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

        // Small delay to ensure backend has finished processing
        await new Promise((resolve) => setTimeout(resolve, 300));

        router.push(`/projects/${res.id}`);
      } else {
        toast.error(
          "Project created but ID not found. Redirecting to projects list."
        );
        await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        router.push("/projects/ongoing");
      }
    },
    onError: (error: Error) => {
      toast.error(`Error creating project: ${error.message}`);
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: Partial<Project> }) =>
      projectService.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Berhasil memperbarui informasi proyek!");
    },
    onError: (error: Error) => {
      toast.error(`Error updating project: ${error.message}`);
    }
  });
}
