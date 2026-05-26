"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

type UseLogoutOptions = {
  redirectTo?: string;
  refresh?: boolean;
};

export function useLogout({
  redirectTo,
  refresh = true,
}: UseLogoutOptions = {}) {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } catch {
      // Local auth state must still be cleared if the server session is already gone.
    } finally {
      clearAuth();

      if (redirectTo) {
        router.replace(redirectTo);
      }

      if (refresh) {
        router.refresh();
      }

      setIsLoggingOut(false);
    }
  }, [clearAuth, isLoggingOut, redirectTo, refresh, router]);

  return { logout, isLoggingOut };
}
