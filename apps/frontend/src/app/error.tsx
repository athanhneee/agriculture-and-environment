"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase text-destructive">
          Lỗi giao diện
        </p>
        <h1 className="mt-3 text-2xl font-bold">Có sự cố khi hiển thị trang</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Hãy thử tải lại phần giao diện này. Nếu lỗi lặp lại, nhóm có thể kiểm
          tra console để xem chi tiết.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Thử lại
        </button>
      </section>
    </main>
  );
}
