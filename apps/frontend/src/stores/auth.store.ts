"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthUser } from "@/lib/auth";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  hasHydrated: boolean;
  setAuth: (payload: { user: AuthUser; accessToken: string }) => void;
  setAccessToken: (accessToken: string | null) => void;
  clearAuth: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      hasHydrated: false,
      setAuth: ({ user, accessToken }) => {
        set({ user, accessToken });
      },
      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      clearAuth: () => {
        set({ user: null, accessToken: null });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "smart-farm-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        hasHydrated: state.hasHydrated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
