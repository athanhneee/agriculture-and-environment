"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sprout
} from "lucide-react";
import { useState } from "react";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // State quản lý luồng (step 1: nhập email, step 2: nhập OTP và mật khẩu mới)
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Xử lý gửi OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      await authApi.forgotPassword({ email });
      setSuccessMsg("Mã OTP đã được gửi đến hộp thư của bạn.");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      await authApi.resetPassword({
        email,
        otp,
        newPassword,
        confirmNewPassword,
      });

      setSuccessMsg("Khôi phục mật khẩu thành công!");

      // Chuyển về trang đăng nhập sau 2 giây
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-10 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfdf5_100%)] dark:bg-[linear-gradient(135deg,#022c22_0%,#064e3b_100%)] -z-10" />
      <div className="absolute top-0 right-0 size-[500px] rounded-full bg-emerald-400/20 blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 size-[500px] rounded-full bg-teal-400/20 blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-3xl bg-emerald-700 shadow-md">
            <Sprout className="size-6 text-white" aria-hidden="true" />
          </span>
          <span className="block text-xl font-bold text-emerald-900 dark:text-emerald-100 leading-tight">
            Smart Farm
          </span>
        </Link>

        <div className="rounded-2xl border bg-card p-7 shadow-sm sm:p-9 relative overflow-hidden">
          {/* Heading */}
          <div className="mb-7">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
              {step === 1 ? <Mail className="size-6" /> : <KeyRound className="size-6" />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {step === 1 ? "Quên mật khẩu?" : "Thiết lập mật khẩu mới"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {step === 1
                ? "Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi cho bạn một mã OTP có hiệu lực trong 5 phút."
                : `Vui lòng nhập mã OTP đã được gửi đến ${email} và mật khẩu mới của bạn.`}
            </p>
          </div>

          {/* Alert: lỗi */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-3xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
              <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Alert: thành công */}
          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-5" onSubmit={handleRequestOtp}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email của bạn
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="h-11 w-full rounded-3xl border bg-background px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                Gửi mã OTP
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium mb-1.5">
                  Mã OTP (6 chữ số)
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="h-11 w-full rounded-3xl border bg-background px-3.5 text-center tracking-[0.5em] text-lg font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium mb-1.5">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự, có chữ và số"
                    required
                    className="h-11 w-full rounded-3xl border bg-background px-3.5 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    className="h-11 w-full rounded-3xl border bg-background px-3.5 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center rounded-3xl border bg-background px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                >
                  <ArrowLeft className="size-4 mr-1.5" />
                  Quay lại
                </button>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || !newPassword || !confirmNewPassword}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  Lưu mật khẩu
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="mt-8 text-center text-sm">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                <ArrowLeft className="size-4" />
                Quay lại trang Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
