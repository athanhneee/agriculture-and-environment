"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth.store";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!accessToken) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/auth/login?next=${next}`);
    }
  }, [accessToken, hasHydrated, pathname, router]);

  return {
    isChecking: !hasHydrated,
    isAuthenticated: Boolean(accessToken),
  };
}
