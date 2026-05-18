import Link from "next/link";
import { Sprout, UserPlus } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
          >
            <Sprout className="size-5" aria-hidden="true" />
            Smart Farm
          </Link>
          <div className="mb-8">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-200">
              <UserPlus className="size-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Form demo cho người quản lý nông trại, chưa gửi dữ liệu API.
            </p>
          </div>

          <form className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Họ tên</span>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                placeholder="manager@smartfarm.local"
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
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Tạo tài khoản demo
            </Link>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </section>

      <section className="hidden bg-emerald-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
          <p className="text-sm text-emerald-100/70">Nhóm INT1334</p>
          <h2 className="mt-2 text-2xl font-semibold">
            Frontend tự xây bằng Next.js App Router và Tailwind CSS.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-emerald-100/75">
          Giao diện đã chuẩn bị cấu trúc auth để sau này nối backend Express,
          Prisma và cơ chế xác thực thật.
        </p>
      </section>
    </main>
  );
}
