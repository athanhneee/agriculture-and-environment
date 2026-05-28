"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2, UploadCloud, Sprout, Cpu, Layers } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { apiBaseUrl } from "@/lib/api";

export function ImportFarmZonesClient() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<"zones" | "crops" | "sensors">("zones");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setMessage(null);
    setError(null);

    if (!file) {
      setError("Vui lòng chọn file .xlsx, .csv hoặc .txt");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/imports/farm-zones`, {
        method: "POST",
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
        credentials: "include",
        body: formData,
      });

      const body = await response.json();

      if (!response.ok || !body.success) {
        throw new Error(body.message || "Import thất bại");
      }

      setMessage(`Import thành công ${body.data.imported} vùng trồng.`);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import thất bại");
    } finally {
      setSubmitting(false);
    }
  };


  if (!isAdmin) {
    return (
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Import dữ liệu</h1>
        <p className="mt-2 text-sm text-destructive">
          Chỉ tài khoản ADMIN được phép import dữ liệu.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
              <FileSpreadsheet className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">Trung tâm Import Dữ liệu</h1>
              <p className="text-sm text-muted-foreground">
                Tải file Excel/CSV/TXT để cập nhật nhanh cơ sở dữ liệu hệ thống nông trại.
              </p>
            </div>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-muted-foreground/15 pb-px mt-6">
          <button
            onClick={() => {
              setActiveTab("zones");
              setMessage(null);
              setError(null);
              setFile(null);
            }}
            className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "zones"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-4" />
            Vùng trồng
          </button>
          <button
            onClick={() => {
              setActiveTab("crops");
              setMessage(null);
              setError(null);
              setFile(null);
            }}
            className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "crops"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sprout className="size-4" />
            Cây trồng
          </button>
          <button
            onClick={() => {
              setActiveTab("sensors");
              setMessage(null);
              setError(null);
              setFile(null);
            }}
            className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "sensors"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cpu className="size-4" />
            Thiết bị cảm biến
          </button>
        </div>
      </section>

      {/* Tab Contents */}
      {activeTab === "zones" && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-6 shadow-sm space-y-4"
        >
          <div>
            <h3 className="text-lg font-semibold">Nhập dữ liệu Vùng Trồng</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Header bắt buộc: <code className="font-mono font-bold text-foreground">name, area, latitude, longitude, soilType</code>
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-semibold">Chọn file dữ liệu</span>
            <input
              type="file"
              accept=".xlsx,.csv,.txt"
              className="mt-3 block w-full rounded-xl border bg-background px-3 py-2 text-sm"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Mẫu header:</p>
            <code className="mt-2 block whitespace-pre-wrap text-xs font-mono bg-background p-2 rounded-lg border">
              name,description,area,latitude,longitude,soilType,status
            </code>
          </div>

          {message && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            {submitting ? "Đang import..." : "Import dữ liệu"}
          </button>
        </form>
      )}

      {activeTab === "crops" && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm text-center py-12 space-y-4">
          <Sprout className="size-10 text-muted-foreground/60 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold">Import Cây Trồng</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Vui lòng sử dụng tính năng kéo thả file import trực tiếp trên trang quản lý Cây Trồng hoặc đợi tích hợp inline ở bước tiếp theo.
          </p>
        </div>
      )}

      {activeTab === "sensors" && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm text-center py-12 space-y-4">
          <Cpu className="size-10 text-muted-foreground/60 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold">Import Thiết Bị Cảm Biến</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Vui lòng sử dụng tính năng kéo thả file import trực tiếp trên trang quản lý Cảm Biến hoặc đợi tích hợp inline ở bước tiếp theo.
          </p>
        </div>
      )}
    </div>
  );
}
