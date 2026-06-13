"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/lib/api";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, hasHydrated, setAuth, clearAuth } = useAuthStore();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!accessToken) {
      // Khi F5 reload, accessToken bị mất (vì không lưu localStorage).
      // Thử gọi authApi.me() để lấy lại accessToken qua refreshToken ngầm (interceptors).
      authApi
        .me()
        .then((user) => {
          const currentToken = useAuthStore.getState().accessToken;
          if (currentToken) {
            setAuth({ user, accessToken: currentToken });
          } else {
            throw new Error("Missing token after refresh");
          }
        })
        .catch(() => {
          clearAuth();
          const next = encodeURIComponent(pathname || "/dashboard");
          router.replace(`/auth/login?next=${next}`);
        })
        .finally(() => {
          setIsCheckingSession(false);
        });
    }
  }, [accessToken, hasHydrated, pathname, router, setAuth, clearAuth]);

  const activelyChecking = !accessToken ? isCheckingSession : false;

  return {
    isChecking: !hasHydrated || activelyChecking,
    isAuthenticated: Boolean(accessToken) || activelyChecking,
  };
}
