import api from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { CBSData } from "@/types/cbs-wbs";

interface CBSCategoryAPI {
  id: string;
  name: string;
  cost_type: "Per Item" | "Borongan";
  description?: string;
}

function transformCBSResponse(
  apiData: CBSCategoryAPI
): Omit<CBSData, "selected"> & { id: string } {
  return {
    id: apiData.id,
    name: apiData.name,
    type: apiData.cost_type,
  };
}

export const cbsService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<CBSCategoryAPI[]>>("/cbs");
    return {
      ...response.data,
      data: response.data.data.map(transformCBSResponse),
    };
  },

  create: async (data: { name: string; cost_type: string }) => {
    const response = await api.post<ApiResponse<CBSCategoryAPI>>("/cbs", data);
    return response.data;
  },

  update: async (id: string, data: { name: string; cost_type: string }) => {
    const response = await api.put<ApiResponse<CBSCategoryAPI>>(
      `/cbs/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/cbs/${id}`);
    return response.data;
  },

  getProjectSelections: async (projectId: string) => {
    const response = await api.get<ApiResponse<CBSCategoryAPI[]>>(
      `/projects/${projectId}/cbs-selections`
    );
    return {
      ...response.data,
      data: response.data.data.map(transformCBSResponse),
    };
  },

  updateProjectSelections: async (
    projectId: string,
    cbsCategoryIds: string[]
  ) => {
    const response = await api.put<ApiResponse<CBSCategoryAPI[]>>(
      `/projects/${projectId}/cbs-selections`,
      { cbs_category_ids: cbsCategoryIds }
    );
    return response.data;
  },
};
