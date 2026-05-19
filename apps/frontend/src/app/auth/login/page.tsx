import Link from "next/link";
import { ArrowRight, LogIn, Sprout } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden bg-emerald-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500">
            <Sprout className="size-6" aria-hidden="true" />
          </span>
          <span className="font-semibold">Smart Farm</span>
        </Link>
        <div>
          <p className="max-w-md text-3xl font-bold leading-tight">
            Theo dõi trang trại, vùng trồng và cảnh báo trong một dashboard.
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-emerald-100/75">
            Màn hình đăng nhập demo, chưa kết nối API ở phần frontend foundation.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 lg:hidden"
          >
            <Sprout className="size-5" aria-hidden="true" />
            Smart Farm
          </Link>
          <div className="mb-8">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
              <LogIn className="size-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold">Đăng nhập</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Dùng tài khoản mẫu để vào dashboard demo.
            </p>
          </div>

          <form className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                placeholder="admin@smartfarm.local"
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Mật khẩu</span>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <Link
              href="/dashboard"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Vào dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
            >
              Đăng ký
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
