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
        if (typeof window !== "undefined") {
          document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict; path=/`;
        }
      },
      setAccessToken: (accessToken) => {
        set({ accessToken });
        if (typeof window !== "undefined") {
          if (accessToken) {
            document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict; path=/`;
          } else {
            document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          }
        }
      },
      clearAuth: () => {
        set({ user: null, accessToken: null });
        if (typeof window !== "undefined") {
          document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "smart-farm-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
