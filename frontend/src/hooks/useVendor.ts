import { vendorService } from "@/services/vendorService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetVendors = () => {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: vendorService.getAll,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};
