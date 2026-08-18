import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserData {
    _id?: string;
    wpnumber?: string;
    fullName?: string;
    gender?: "male" | "female" | "other";
    age?: number;
    [key: string]: any;
}

interface BasicDataStore {
    user: UserData | null;
    setUser: (user: UserData) => void;
    clearUser: () => void;
}

export const useStoreBascData = create<BasicDataStore>()(
    persist(
        (set) => ({
            user: null,

            setUser: (user) => set({ user }),

            clearUser: () => set({ user: null }),
        }),
        {
            name: "basic-data",
            storage: createJSONStorage(() => localStorage),
        }
    )
);