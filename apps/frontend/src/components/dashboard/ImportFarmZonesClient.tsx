"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { apiBaseUrl } from "@/lib/api";

export function ImportFarmZonesClient() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

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

  if (isAdmin) {
    return (
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Import dữ liệu</h1>
        <p className="mt-2 text-sm text-destructive">
          Chỉ chủ vùng trồng (USER) mới được phép import dữ liệu vùng trồng. Quản trị viên chỉ có quyền xem.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
            <FileSpreadsheet className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Import vùng trồng</h1>
            <p className="text-sm text-muted-foreground">
              Hỗ trợ file Excel .xlsx, CSV hoặc TXT. Header bắt buộc: name,
              area, latitude, longitude, soilType.
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <label className="block">
          <span className="text-sm font-semibold">Chọn file</span>
          <input
            type="file"
            accept=".xlsx,.csv,.txt"
            className="mt-3 block w-full rounded-xl border bg-background px-3 py-2 text-sm"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <div className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Mẫu header:</p>
          <code className="mt-2 block whitespace-pre-wrap text-xs">
            name,description,area,latitude,longitude,soilType,status
          </code>
        </div>

        {message ? (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UploadCloud className="size-4" />
          )}
          {submitting ? "Đang import..." : "Import dữ liệu"}
        </button>
      </form>
    </div>
  );
}
