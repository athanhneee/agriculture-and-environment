"use client";

import { Bell, Loader2, LogOut, Search, UserCircle } from "lucide-react";

import { useState, useRef, useEffect } from "react";
import { useLogout } from "@/hooks/useLogout";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import { NotificationDropdown } from "./NotificationDropdown";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const { logout, isLoggingOut } = useLogout({ redirectTo: "/auth/login" });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <NotificationDropdown />
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="hidden h-10 max-w-48 items-center gap-2 rounded-full border bg-card px-3 text-sm font-medium sm:flex transition hover:bg-muted"
            >
              <UserCircle className="size-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
              <span className="truncate">{user?.name ?? "Tài khoản"}</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  <UserCircle className="size-4" />
                  Hồ sơ cá nhân
                </Link>
                <div className="my-1 h-px bg-muted" />
                <button
                  type="button"
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoggingOut ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <LogOut className="size-4" aria-hidden="true" />
                  )}
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
