import api from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { Project } from "@/types/project";

export interface CreateProjectDTO {
  name: string;
  description?: string;
  location?: string;
  budget: number;
  start_date: string;
  end_date: string;
  status?: string;
  termins?: Array<{ description: string; nominal: number }>;
}

export const projectService = {
  getAll: async (params?: {
    status?: string;
    search?: string;
    page?: number;
  }) => {
    const response = await api.get<ApiResponse<Project[]>>("/projects", {
      params,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  create: async (data: CreateProjectDTO) => {
    const response = await api.post<ApiResponse<Project>>(
      "/projects/new",
      data
    );
    return response.data.data;
  },

  update: async (id: string, data: Partial<Project>) => {
    const response = await api.patch<ApiResponse<Project>>(
      `/projects/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/projects/${id}`);
    return response.data.data;
  },
};
