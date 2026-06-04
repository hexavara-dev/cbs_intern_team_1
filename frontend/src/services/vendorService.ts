import api from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { Vendor } from "@/types/vendor";
import { responseToDefaultSelectOption } from "@/utils/responseToSelectOption";

export const vendorService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Vendor[]>>("/vendors");
    const vendorOptions = responseToDefaultSelectOption(response.data.data);

    return vendorOptions;
  },

  create: async (data: { name: string }) => {
    const response = await api.post<ApiResponse<Vendor>>("/vendors/new", data);
    return responseToDefaultSelectOption([response.data.data])[0];
  },
};
