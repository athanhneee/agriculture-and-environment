"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Ghi log lỗi để dev dễ debug
    console.error("Dashboard error occurred:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="size-8" />
      </div>

      <h2 className="text-xl font-bold text-foreground tracking-tight">Đã có lỗi xảy ra!</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
        Hệ thống gặp sự cố khi tải dữ liệu trang giám sát. Vui lòng kiểm tra lại kết nối mạng hoặc server Backend.
      </p>

      {error.message && (
        <pre className="mt-4 p-3 bg-muted text-xs text-destructive rounded-3xl max-w-lg overflow-x-auto text-left font-mono">
          {error.message}
        </pre>
      )}

      <button
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-3xl bg-emerald-600 hover:bg-emerald-700 px-5 text-sm font-semibold text-white transition shadow-sm shadow-emerald-600/10"
      >
        <RotateCcw className="size-4" />
        Thử lại
      </button>
    </div>
  );
}
