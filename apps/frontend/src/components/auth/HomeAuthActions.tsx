"use client";

import Link from "next/link";
import { ArrowRight, Loader2, LogOut } from "lucide-react";

import { useLogout } from "@/hooks/useLogout";
import { useAuthStore } from "@/stores/auth.store";

type HomeAuthActionsProps = {
  initialIsAuthenticated: boolean;
};

function useIsAuthenticated(initialIsAuthenticated: boolean) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  return hasHydrated ? Boolean(accessToken) : initialIsAuthenticated;
}

export function HomeNavAuthActions({
  initialIsAuthenticated,
}: HomeAuthActionsProps) {
  const isAuthenticated = useIsAuthenticated(initialIsAuthenticated);
  const { logout, isLoggingOut } = useLogout({ redirectTo: "/" });

  return (
    <nav className="flex items-center gap-2">
      {isAuthenticated ? (
        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-emerald-800 transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-70 dark:text-emerald-100 dark:hover:bg-white/10 sm:px-4"
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
          className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-white/70 dark:text-emerald-100 dark:hover:bg-white/10 sm:inline-flex"
        >
          Đăng nhập
        </Link>
      )}

      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800"
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
  const { logout, isLoggingOut } = useLogout({ redirectTo: "/" });

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link
        href="/dashboard"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white shadow-xl shadow-emerald-900/15 transition hover:bg-emerald-800"
      >
        Xem dashboard
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>

      {isAuthenticated ? (
        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white/80 px-6 text-sm font-semibold text-emerald-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-white/10 dark:text-emerald-50 dark:hover:bg-white/15"
        >
          {isLoggingOut ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="size-4" aria-hidden="true" />
          )}
          Đăng xuất
        </button>
      ) : (
        <Link
          href="/auth/register"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white/80 px-6 text-sm font-semibold text-emerald-900 transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-emerald-50 dark:hover:bg-white/15"
        >
          Tạo tài khoản demo
        </Link>
      )}
    </div>
  );
}
