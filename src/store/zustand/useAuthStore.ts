import { create } from "zustand";

export interface UserProfile {
  _id?: string;
  wpnumber: string;
  fullName: string;
  gender: "male" | "female" | "other";
  age: number;
  profilePic: string | null;
}

interface AuthState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,

  login: (user: UserProfile) =>
    set({
      user,
      isLoggedIn: true,
    }),

  logout: () =>
    set({
      user: null,
      isLoggedIn: false,
    }),

  updateProfile: (updates: Partial<UserProfile>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));