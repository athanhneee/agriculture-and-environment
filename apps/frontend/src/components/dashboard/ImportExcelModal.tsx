"use client";

import { useRef, useState, useCallback } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { importsApi } from "@/lib/api";

// ── Định nghĩa các cột bắt buộc / tuỳ chọn ─────────────────────
const COLUMNS = [
  {
    name: "name",
    label: "Tên vùng trồng",
    required: true,
    example: "Vùng trồng A - Khu Bắc",
    hint: "Tên phân biệt, không được bỏ trống",
  },
  {
    name: "description",
    label: "Mô tả",
    required: false,
    example: "Khu vực trồng lúa chính vụ",
    hint: "Có thể bỏ trống",
  },
  {
    name: "area",
    label: "Diện tích (ha)",
    required: true,
    example: "2.5",
    hint: "Số thực dương, dùng dấu chấm thập phân",
  },
  {
    name: "latitude",
    label: "Vĩ độ",
    required: true,
    example: "10.7626",
    hint: "Từ -90 đến 90",
  },
  {
    name: "longitude",
    label: "Kinh độ",
    required: true,
    example: "106.6602",
    hint: "Từ -180 đến 180",
  },
  {
    name: "soilType",
    label: "Loại đất",
    required: true,
    example: "Đất đỏ Bazan",
    hint: "Ví dụ: Đất phù sa, Đất sét, Đất cát...",
  },
  {
    name: "status",
    label: "Trạng thái",
    required: false,
    example: "ACTIVE",
    hint: "ACTIVE | INACTIVE | MAINTENANCE  (mặc định: ACTIVE)",
  },
];

// Dòng header để copy vào Excel
const HEADER_ROW = COLUMNS.map((c) => c.name).join("\t");

// ── Props ────────────────────────────────────────────────────────
interface ImportExcelModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (imported: number, skipped: number) => void;
}

// ── Component ────────────────────────────────────────────────────
export function ImportExcelModal({ open, onClose, onSuccess }: ImportExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  const [importState, setImportState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; imported: number; skipped: number; errors: { row: number; message: string }[] }
    | { status: "error"; message: string }
  >({ status: "idle" });

  // ── File selection helpers ───────────────────────────────────
  const acceptFile = (file: File) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".csv") && !name.endsWith(".txt")) {
      setImportState({ status: "error", message: "Chỉ hỗ trợ file .xlsx, .csv hoặc .txt" });
      return;
    }
    setSelectedFile(file);
    setImportState({ status: "idle" });
  };

  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
    e.target.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) acceptFile(file);
  }, []);

  // ── Copy header to clipboard ─────────────────────────────────
  const handleCopyHeaders = async () => {
    try {
      await navigator.clipboard.writeText(HEADER_ROW);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback: do nothing */
    }
  };

  // ── Download template ────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      await importsApi.downloadTemplate();
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // ── Upload ───────────────────────────────────────────────────
  const handleImport = async () => {
    if (!selectedFile) return;
    setImportState({ status: "loading" });
    try {
      const result = await importsApi.uploadFarmZones(selectedFile);
      setImportState({
        status: "success",
        imported: result.imported ?? 0,
        skipped: result.skipped ?? 0,
        errors: result.errors ?? [],
      });
      onSuccess?.(result.imported ?? 0, result.skipped ?? 0);
    } catch (err: unknown) {
      setImportState({ status: "error", message: (err instanceof Error ? err.message : null) || "Import thất bại." });
    }
  };

  // ── Reset & close ────────────────────────────────────────────
  const handleClose = () => {
    if (importState.status === "loading") return;
    setSelectedFile(null);
    setImportState({ status: "idle" });
    setCopied(false);
    onClose();
  };

  if (!open) return null;

  const isLoading = importState.status === "loading";
  const isDone = importState.status === "success";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border bg-card shadow-2xl">
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400">
              <FileSpreadsheet className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold leading-tight">Import vùng trồng từ Excel</h2>
              <p className="text-xs text-muted-foreground">Hỗ trợ .xlsx · .csv · .txt</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* ── Column guide ───────────────────────────── */}
          <div className="space-y-3">
            {/* ── Excel header row ──────────────────────── */}
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Dòng tiêu đề — copy &amp; paste vào hàng 1 của file Excel
              </p>
              <div className="flex items-stretch overflow-hidden rounded-xl border">
                {/* Copy button */}
                <button
                  type="button"
                  onClick={handleCopyHeaders}
                  className={
                    "flex shrink-0 items-center gap-1.5 border-r px-3 py-2.5 text-xs font-semibold transition " +
                    (copied
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground")
                  }
                  title="Copy toàn bộ dòng header, rồi paste vào ô A1 trong Excel"
                >
                  {copied ? (
                    <ClipboardCheck className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copied ? "Đã copy!" : "Copy"}
                </button>

                {/* Cell row */}
                <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
                  {COLUMNS.map((col) => (
                    <div
                      key={col.name}
                      className={
                        "flex shrink-0 items-center border-r last:border-r-0 px-3 py-2.5 text-xs font-mono font-semibold " +
                        (col.required
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                          : "bg-background text-muted-foreground")
                      }
                    >
                      {col.name}
                      {col.required && (
                        <span className="ml-1 text-red-500 select-none" title="bắt buộc">*</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Ô nền xanh = bắt buộc &nbsp;·&nbsp; Ô trắng = tuỳ chọn &nbsp;·&nbsp; Paste vào ô A1, mỗi tên cột sẽ tự điền vào một ô riêng.
              </p>
            </div>
          </div>

          {/* ── Drop zone ──────────────────────────────── */}
          <div>
            <p className="mb-2 text-sm font-medium">Chọn file</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,.txt"
              className="hidden"
              onChange={handleInputChange}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={handleDropZoneClick}
              onKeyDown={(e) => e.key === "Enter" && handleDropZoneClick()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={[
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition",
                isDragging
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : selectedFile
                  ? "border-emerald-400/60 bg-emerald-50/50 dark:bg-emerald-900/10"
                  : "border-border bg-muted/30 hover:border-emerald-400/60 hover:bg-muted/50",
              ].join(" ")}
            >
              {selectedFile ? (
                <>
                  <FileSpreadsheet className="size-8 text-emerald-600 dark:text-emerald-400" />
                  <p className="max-w-[280px] truncate text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB — Nhấn để đổi file
                  </p>
                </>
              ) : (
                <>
                  <Upload className="size-8 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm font-medium">Kéo thả file vào đây</p>
                    <p className="text-xs text-muted-foreground">
                      hoặc nhấn để chọn file .xlsx · .csv · .txt (tối đa 2 MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Result banner ──────────────────────────── */}
          {importState.status === "success" && (
            <div className="space-y-2">
              {/* Success summary */}
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Thêm thành công{" "}
                  <span className="font-bold">{importState.imported}</span> vùng trồng
                  {importState.skipped > 0 && (
                    <span className="font-normal text-emerald-600/80">
                      {" "}· bỏ qua {importState.skipped} dòng lỗi
                    </span>
                  )}
                </p>
              </div>

              {/* Error rows list */}
              {importState.errors.length > 0 && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-destructive/10 px-3 py-2">
                    <XCircle className="size-3.5 shrink-0 text-destructive" />
                    <p className="text-xs font-semibold text-destructive">
                      {importState.errors.length} dòng không lưu được:
                    </p>
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-destructive/10">
                    {importState.errors.map((err) => (
                      <div key={err.row} className="flex items-baseline gap-2 px-3 py-1.5">
                        <span className="shrink-0 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-destructive">
                          Dòng {err.row}
                        </span>
                        <span className="text-xs text-destructive/80">{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {importState.status === "error" && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{importState.message}</p>
            </div>
          )}
        </div>

        {/* ── Footer actions ─────────────────────────── */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          {/* Download template */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-emerald-500/50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-emerald-400"
          >
            {isDownloadingTemplate ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Tải file mẫu
          </button>

          <div className="flex items-center gap-2">
            {/* Cancel */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="h-10 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-50"
            >
              {isDone ? "Đóng" : "Huỷ"}
            </button>

            {/* Import */}
            {!isDone && (
              <button
                type="button"
                onClick={handleImport}
                disabled={!selectedFile || isLoading}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang import...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Import ngay
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
