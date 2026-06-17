"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, LogOut, LogIn } from "lucide-react";

import { useLogout } from "@/hooks/useLogout";
import { useAuthStore } from "@/stores/auth.store";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type HomeAuthActionsProps = {
  initialIsAuthenticated: boolean;
};

function useIsAuthenticated(initialIsAuthenticated: boolean) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (hasHydrated && accessToken) {
      const hasCookie = document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("accessToken="));
      if (!hasCookie) {
        clearAuth();
      }
    }
  }, [hasHydrated, accessToken, clearAuth]);

  return hasHydrated ? Boolean(accessToken) : initialIsAuthenticated;
}

export function HomeNavAuthActions({
  initialIsAuthenticated,
}: HomeAuthActionsProps) {
  const isAuthenticated = useIsAuthenticated(initialIsAuthenticated);
  const { logout, isLoggingOut } = useLogout({ redirectTo: "/" });

  return (
    <nav className="flex items-center gap-2">
      <ThemeToggle />
      {isAuthenticated ? (
        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="inline-flex h-10 items-center gap-2 rounded-3xl px-3 text-sm font-semibold text-emerald-800 transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-70 dark:text-emerald-100 dark:hover:bg-white/10 sm:px-4"
        >
          {isLoggingOut ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="size-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      ) : (
        <Link
          href="/auth/login"
          className="inline-flex h-10 items-center gap-2 rounded-3xl px-3 text-sm font-semibold text-emerald-800 transition hover:bg-white/70 dark:text-emerald-100 dark:hover:bg-white/10 sm:px-4"
        >
          <LogIn className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Đăng nhập</span>
        </Link>
      )}

      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center gap-2 rounded-3xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800"
      >
        Dashboard
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </nav>
  );
}

export function HomeHeroAuthActions({
  initialIsAuthenticated,
}: HomeAuthActionsProps) {
  const isAuthenticated = useIsAuthenticated(initialIsAuthenticated);

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link
        href="/dashboard"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-3xl bg-emerald-700 px-6 text-sm font-semibold text-white shadow-xl shadow-emerald-900/15 transition hover:bg-emerald-800"
      >
        Xem dashboard
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>

      {!isAuthenticated && (
        <Link
          href="/auth/register"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-3xl border border-emerald-200 bg-white/80 px-6 text-sm font-semibold text-emerald-900 transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-emerald-50 dark:hover:bg-white/15"
        >
          Tạo tài khoản demo
        </Link>
      )}
    </div>
  );
}
