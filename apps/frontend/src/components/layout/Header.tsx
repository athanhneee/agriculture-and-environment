"use client";

import { Bell, Loader2, LogOut, Search, UserCircle } from "lucide-react";

import { useLogout } from "@/hooks/useLogout";
import { useAuthStore } from "@/stores/auth.store";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const { logout, isLoggingOut } = useLogout({ redirectTo: "/auth/login" });

  return (
    <header className="sticky top-0 z-20 border-b bg-background/88 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Smart Farm 
          </p>
          <h1 className="text-base font-semibold sm:text-lg">
            Giám sát trang trại
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden h-10 w-72 items-center gap-2 rounded-xl border bg-card px-3 text-sm text-muted-foreground lg:flex">
            <Search className="size-4" aria-hidden="true" />
            Tìm vùng trồng, cảm biến...
          </div>
          <button
            type="button"
            aria-label="Thông báo"
            className="flex size-10 items-center justify-center rounded-xl border bg-card text-muted-foreground transition hover:text-foreground"
          >
            <Bell className="size-5" aria-hidden="true" />
          </button>
          <div className="hidden h-10 max-w-48 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-medium sm:flex">
            <UserCircle className="size-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
            <span className="truncate">{user?.name ?? "Tài khoản"}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            aria-label="Đăng xuất"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border bg-card px-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoggingOut ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
