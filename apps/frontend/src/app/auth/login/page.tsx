"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  MapPinned,
  RadioTower,
  Sprout,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { ApiError, authApi } from "@/lib/api";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth.store";

const features = [
  {
    icon: RadioTower,
    title: "Cảm biến IoT thời gian thực",
    desc: "Theo dõi nhiệt độ, độ ẩm và ánh sáng liên tục 24/7.",
  },
  {
    icon: BellRing,
    title: "Cảnh báo thông minh",
    desc: "Phát hiện sớm chỉ số bất thường, gửi cảnh báo tức thì.",
  },
  {
    icon: MapPinned,
    title: "Bản đồ vùng trồng",
    desc: "Xem toàn bộ vùng trồng và cảm biến trên bản đồ tương tác.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isRegistered = searchParams.get("registered") === "true";
  const nextPath = searchParams.get("next");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await authApi.login(values);
      setAuth(data as any);
      const redirectTo =
        nextPath?.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/dashboard";
      router.replace(redirectTo);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Không thể đăng nhập. Vui lòng thử lại.";
      setError("root", { message });
    }
  };

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[0.9fr_1.1fr]">
      {/* ===== PANEL TRÁI ===== */}
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col">
        {/* Gradient nền */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#064e3b_0%,#065f46_45%,#047857_100%)]" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(to right, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Vòng trang trí */}
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <Sprout className="size-6 text-white" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold text-white leading-tight">
                Thành Phát An Smart Farm
              </span>
              <span className="block text-xs text-emerald-300/80">
                Giám sát nông trại thông minh
              </span>
            </span>
          </Link>

          {/* Nội dung giữa */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
                Hệ thống quản lý IoT
              </p>
              <h2 className="text-3xl font-bold leading-snug text-white">
                Theo dõi trang trại,{" "}
                <span className="text-emerald-300">vùng trồng</span> và{" "}
                <span className="text-teal-300">cảnh báo</span> trong một
                dashboard.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-emerald-100/70">
                Hệ thống mô phỏng Smart Farm giúp quản lý nông trại hiện đại —
                kết nối dữ liệu cảm biến, phân tích môi trường và ra quyết định
                nhanh chóng.
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-4">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/10">
                      <Icon className="size-4 text-emerald-300" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{f.title}</p>
                      <p className="text-xs text-emerald-100/60 mt-0.5">{f.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Bottom stat */}
          <div className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-white">24</p>
              <p className="text-xs text-emerald-300/80">Cảm biến online</p>
            </div>
            <div className="h-8 w-px bg-white/10 shrink-0" />
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-xs text-emerald-300/80">Vùng trồng</p>
            </div>
            <div className="h-8 w-px bg-white/10 shrink-0" />
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-xs text-emerald-300/80">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PANEL PHẢI — FORM ===== */}
      <section className="flex items-center justify-center px-5 py-10 bg-background">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2.5 lg:hidden"
          >
            <span className="flex size-9 items-center justify-center rounded-3xl bg-emerald-700">
              <Sprout className="size-5 text-white" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold text-emerald-900 dark:text-emerald-100 leading-tight">
                Thành Phát An Smart Farm
              </span>
              <span className="block text-xs text-muted-foreground">
                Giám sát nông trại
              </span>
            </span>
          </Link>

          {/* Card form */}
          <div className="rounded-2xl border bg-card p-7 shadow-sm sm:p-9">
            {/* Heading */}
            <div className="mb-7">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                <LogIn className="size-6" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Đăng nhập</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Nhập tài khoản để vào dashboard Smart Farm.
              </p>
            </div>

            {/* Alert: đăng ký thành công */}
            {isRegistered && (
              <div className="mb-5 flex items-start gap-2.5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>Đăng ký tài khoản thành công! Vui lòng đăng nhập.</span>
              </div>
            )}

            {/* Alert: lỗi */}
            {errors.root?.message && (
              <div className="mb-5 flex items-start gap-2.5 rounded-3xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{errors.root.message}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="admin@smartfarm.local"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  className="h-11 w-full rounded-3xl border bg-background px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                  {...register("email")}
                />
                {errors.email?.message && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Mật khẩu */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium">
                    Mật khẩu
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    className="h-11 w-full rounded-3xl border bg-background px-3.5 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password?.message && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-4" aria-hidden="true" />
                )}
                {isSubmitting ? "Đang đăng nhập..." : "Vào dashboard"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
