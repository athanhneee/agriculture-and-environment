"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { User, Shield, Calendar, Mail, KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";

export function ProfileClient() {
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      await authApi.changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword
      });
      setSuccess(true);
      setForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err: any) {
      setError(err.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột Trái: Thông tin cá nhân */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
            <div className="px-6 pb-6">
              <div className="size-20 rounded-2xl bg-white shadow-lg border-4 border-card flex items-center justify-center text-3xl font-bold text-emerald-600 uppercase relative -mt-10 mb-4">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1">
                  <Mail className="size-3.5" />
                  {user.email}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="size-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Shield className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Vai trò</p>
                    <p className="text-muted-foreground">{user.role === 'ADMIN' ? 'Quản trị viên' : 'Nông dân'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <User className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Trạng thái</p>
                    <p className="text-muted-foreground">{user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Bị khóa'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="size-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Ngày tham gia</p>
                    <p className="text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột Phải: Form Đổi mật khẩu */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <KeyRound className="size-5 text-emerald-600" />
              <h3 className="text-lg font-semibold">Đổi mật khẩu</h3>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="size-5" />
                Đổi mật khẩu thành công!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  required
                  value={form.oldPassword}
                  onChange={(e) => setForm({...form, oldPassword: e.target.value})}
                  className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={form.newPassword}
                  onChange={(e) => setForm({...form, newPassword: e.target.value})}
                  className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Nhập mật khẩu mới (Tối thiểu 8 ký tự)"
                />
                <p className="text-xs text-muted-foreground">Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và chữ số.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={form.confirmNewPassword}
                  onChange={(e) => setForm({...form, confirmNewPassword: e.target.value})}
                  className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !form.oldPassword || !form.newPassword || !form.confirmNewPassword}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
