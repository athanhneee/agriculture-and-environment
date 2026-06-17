"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  ShieldCheck,
  Sprout,
  UserPlus,
  Wifi,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { ApiError, authApi } from "@/lib/api";
import { registerSchema, type RegisterFormValues } from "@/lib/validations";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Bảo mật tài khoản",
    desc: "Mật khẩu được mã hóa bcrypt, token xác thực JWT an toàn.",
  },
  {
    icon: Wifi,
    title: "Kết nối IoT đa thiết bị",
    desc: "Quản lý nhiều cảm biến từ một tài khoản duy nhất.",
  },
  {
    icon: Leaf,
    title: "Quản lý vùng trồng",
    desc: "Tạo và theo dõi nhiều khu canh tác, cây trồng cùng lúc.",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await authApi.register(values);
      router.push("/auth/login?registered=true");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Không thể đăng ký tài khoản. Vui lòng thử lại.";
      setError("root", { message });
    }
  };

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[1.1fr_0.9fr]">
      {/* ===== PANEL TRÁI — FORM ===== */}
      <section className="flex items-center justify-center px-5 py-10 bg-background">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <Link href="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-3xl bg-emerald-700">
              <Sprout className="size-5 text-white" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold text-emerald-900 dark:text-emerald-100 leading-tight">
                Thành Phát An Smart Farm
              </span>
              <span className="block text-xs text-muted-foreground">Giám sát nông trại</span>
            </span>
          </Link>

          {/* Card form */}
          <div className="rounded-2xl border bg-card p-7 shadow-sm sm:p-9">
            {/* Heading */}
            <div className="mb-7">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300">
                <UserPlus className="size-6" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Đăng ký tài khoản</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Tạo tài khoản để bắt đầu giám sát nông trại của bạn.
              </p>
            </div>

            {/* Alert lỗi */}
            {errors.root?.message && (
              <div className="mb-5 flex items-start gap-2.5 rounded-3xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{errors.root.message}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Họ tên */}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium mb-1.5">
                  Họ tên
                </label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  aria-invalid={Boolean(errors.name)}
                  className="h-11 w-full rounded-3xl border bg-background px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                  {...register("name")}
                />
                {errors.name?.message && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="manager@smartfarm.local"
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
                <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
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

              {/* Xác nhận mật khẩu */}
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    className="h-11 w-full rounded-3xl border bg-background px-3.5 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword?.message && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-4" aria-hidden="true" />
                )}
                {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ===== PANEL PHẢI ===== */}
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col">
        {/* Gradient nền */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#064e3b_0%,#065f46_45%,#0f766e_100%)]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(to right, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Vòng trang trí */}
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-emerald-400/10 blur-3xl" />

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
              <span className="block text-xs text-teal-300/80">Giám sát nông trại thông minh</span>
            </span>
          </Link>

          {/* Nội dung giữa */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-3">
                Tham gia hệ thống
              </p>
              <h2 className="text-3xl font-bold leading-snug text-white">
                Bắt đầu hành trình{" "}
                <span className="text-teal-300">canh tác thông minh</span> ngay
                hôm nay.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-emerald-100/70">
                Đăng ký miễn phí để truy cập đầy đủ tính năng theo dõi cảm biến
                IoT, quản lý vùng trồng và nhận cảnh báo thời gian thực.
              </p>
            </div>

            {/* Highlights */}
            <ul className="space-y-4">
              {highlights.map((h) => {
                const Icon = h.icon;
                return (
                  <li key={h.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/10">
                      <Icon className="size-4 text-teal-300" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{h.title}</p>
                      <p className="text-xs text-emerald-100/60 mt-0.5">{h.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quote */}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
            <p className="text-sm italic text-emerald-100/80">
              "Hệ thống giúp chúng tôi phát hiện bất thường sớm hơn 3 lần so với
              phương pháp thủ công trước đây."
            </p>
            <p className="mt-2 text-xs font-semibold text-teal-300">
              — Nguyễn Quản Trị · Quản lý Nông trại Củ Chi
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
