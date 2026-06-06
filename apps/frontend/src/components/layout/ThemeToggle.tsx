"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme.store";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tính chế độ đang hiển thị thực tế (system → theo OS)
  const isDark =
    mounted &&
    (theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches));

  function toggle() {
    setTheme(isDark ? "light" : "dark");
  }

  // Hiển thị placeholder cùng kích thước khi chưa mount để tránh hydration mismatch
  if (!mounted) {
    return (
      <button
        id="theme-toggle-btn"
        type="button"
        aria-label="Chuyển chế độ sáng/tối"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border transition",
          "text-emerald-800 hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-white/10",
          "border-emerald-200/70 dark:border-white/15",
        )}
      >
        <Moon className="size-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border transition",
        "text-emerald-800 hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-white/10",
        "border-emerald-200/70 dark:border-white/15",
      )}
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}

