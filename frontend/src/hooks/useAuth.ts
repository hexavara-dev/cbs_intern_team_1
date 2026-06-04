import { LoginFormValues } from "@/app/(auth)/login/type";
import { RegisterFormValues } from "@/app/(auth)/register/type";
import api from "@/lib/api";
import { useAuthstore } from "@/store/useAuthStore";
import { ApiError } from "@/types/api";
import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useLoginMutation = () => {
  const router = useRouter();

  const login = useAuthstore((state) => state.login);

  const { mutate, isPending } = useMutation<
    AxiosResponse,
    AxiosError<ApiError>,
    LoginFormValues
  >({
    mutationFn: async (data) => {
      const res = await api.post("/users/login", data);
      return res;
    },
    onSuccess: (res) => {
      toast.success("Success Login!");

      const token = res.data.data.token;

      if (token) {
        login(token);
        router.push("/projects/ongoing");
      }
    },
    onError: (error) => {
      if (error.response?.data.message === "User not found") {
        toast.error("Email tidak terdaftar!");
        return;
      }

      toast.error(error.response?.data.message || "Terjadi kesalahan!");
    },
  });
  return { mutate, isPending };
};

export const useRegisterMutation = () => {
  const router = useRouter();

  const { mutate } = useMutation<
    AxiosResponse,
    AxiosError<ApiError>,
    Omit<RegisterFormValues, "confirmPassword">
  >({
    mutationFn: async (data) => {
      const res = await api.post("/users/register", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Berhasil Daftar Akun!");
      router.push("/auth/login");
    },
    onError: () => {
      toast.error("Gagal Daftar Akun!");
    },
  });

  return { mutate };
};
