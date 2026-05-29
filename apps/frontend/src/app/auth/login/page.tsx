"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, LogIn, Sprout } from "lucide-react";
import { useForm } from "react-hook-form";

import { ApiError, authApi } from "@/lib/api";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isRegistered = searchParams.get("registered") === "true";
  const nextPath = searchParams.get("next");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
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
              Nhập tài khoản để vào dashboard Smart Farm.
            </p>
          </div>

          {isRegistered ? (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              Đăng ký tài khoản thành công! Vui lòng đăng nhập.
            </div>
          ) : null}

          {errors.root?.message ? (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                placeholder="admin@smartfarm.local"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                {...register("email")}
              />
              {errors.email?.message ? (
                <p className="mt-2 text-sm text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium">Mật khẩu</span>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                {...register("password")}
              />
              {errors.password?.message ? (
                <p className="mt-2 text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
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
