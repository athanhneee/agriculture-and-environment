import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
          <Sprout className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Không tìm thấy trang</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Đường dẫn này chưa có trong Smart Farm Monitoring System.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-3xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}
