"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Sprout, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";

import { ApiError, authApi } from "@/lib/api";
import { registerSchema, type RegisterFormValues } from "@/lib/validations";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await authApi.register(values);
      // Đăng ký thành công thì điều hướng sang trang login và có thể kèm theo query param để thông báo
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
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-200">
              <UserPlus className="size-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tạo tài khoản quản lý nông trại của bạn để bắt đầu giám sát.
            </p>
          </div>

          {errors.root?.message ? (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              <span className="text-sm font-medium">Họ tên</span>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                aria-invalid={Boolean(errors.name)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                {...register("name")}
              />
              {errors.name?.message ? (
                <p className="mt-2 text-sm text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                placeholder="manager@smartfarm.local"
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

            <label className="block">
              <span className="text-sm font-medium">Xác nhận mật khẩu</span>
              <input
                type="password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.confirmPassword)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword?.message ? (
                <p className="mt-2 text-sm text-destructive">
                  {errors.confirmPassword.message}
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
              {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
            </button>
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
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500">
            <Sprout className="size-6" aria-hidden="true" />
          </span>
          <span className="font-semibold">Smart Farm</span>
        </Link>
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            Frontend kết nối backend với form đăng ký validation phức tạp.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-emerald-100/75">
            Mật khẩu yêu cầu có ít nhất 8 ký tự, bao gồm cả chữ cái và chữ số để đảm bảo an toàn bảo mật.
          </p>
        </div>
      </section>
    </main>
  );
}
