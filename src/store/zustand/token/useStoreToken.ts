import zustandConst from "@/consts/zustand/zustandConst";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TokenStore {
    token: string | null;
    setToken: (token: string) => void;
    clearToken: () => void;
}

export const useStoreToken = create<TokenStore>()(
    persist(
        (set) => ({
            token: null,

            setToken: (token) => {
                set({ token });
            },

            clearToken: () => {
                set({ token: null });
            },
        }),
        {
            name: zustandConst.token,
            storage: createJSONStorage(() => localStorage),
        }
    )
);