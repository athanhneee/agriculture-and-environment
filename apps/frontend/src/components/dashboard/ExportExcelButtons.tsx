"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { ApiError, exportsApi } from "@/lib/api";

export function ExportExcelButtons() {
  const [loading, setLoading] = useState<"readings" | "alerts" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (type: "readings" | "alerts") => {
    setLoading(type);
    setError(null);

    try {
      if (type === "readings") {
        await exportsApi.readings();
      } else {
        await exportsApi.alerts();
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Khong the tai file Excel. Vui long thu lai.",
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Export Excel</h3>
          
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleDownload("readings")}
            disabled={Boolean(loading)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading === "readings" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            Readings
          </button>
          <button
            type="button"
            onClick={() => handleDownload("alerts")}
            disabled={Boolean(loading)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading === "alerts" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            Alerts
          </button>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
