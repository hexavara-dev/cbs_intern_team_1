import { removeToken, setToken } from "@/lib/cookies";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type useAuthStoreType = {
  isAuthed: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const useAuthstore = create<useAuthStoreType>()(
  persist(
    (set) => ({
      isAuthed: false,

      login: (token) => {
        setToken(token);
        set({
          isAuthed: true,
        });
      },

      logout: () => {
        removeToken();
        localStorage.removeItem("@hexavara");
        set({
          isAuthed: false,
        });
      },
    }),
    {
      name: "@hexavara",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
