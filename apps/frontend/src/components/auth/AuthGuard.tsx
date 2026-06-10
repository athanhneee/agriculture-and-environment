"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isChecking } = useAuthGuard();

  if (isChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
          Đang kiểm tra phiên đăng nhập...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
