"use client";

import { useState, useRef } from "react";
import { FileSpreadsheet, Loader2, UploadCloud, Sprout, Cpu, Layers } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { apiBaseUrl, importsApi } from "@/lib/api";

function DragDropZone({
  selectedFile,
  onFileAccept,
  onFileRemove,
}: {
  selectedFile: File | null;
  onFileAccept: (file: File) => void;
  onFileRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDropZoneClick = () => fileInputRef.current?.click();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileAccept(file);
    e.target.value = "";
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileAccept(file);
  };

  return (
    <div>
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
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-all outline-none focus-visible:border-emerald-500",
          isDragging
            ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
            : selectedFile
              ? "border-emerald-400/60 bg-emerald-50/10 dark:bg-emerald-900/10"
              : "border-border bg-muted/20 hover:border-emerald-400/60 hover:bg-muted/40",
        ].join(" ")}
      >
        {selectedFile ? (
          <div className="space-y-2">
            <UploadCloud className="size-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="max-w-[320px] truncate text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB — Nhấn để đổi file
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="text-xs text-destructive hover:underline font-semibold mt-1 cursor-pointer"
            >
              Gỡ bỏ file
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="size-10 text-muted-foreground/60" />
            <div>
              <p className="text-sm font-medium">Kéo thả file vào đây hoặc nhấn để chọn</p>
              <p className="text-xs text-muted-foreground mt-1">
                Hỗ trợ .xlsx, .csv, .txt (Tối đa 2MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ImportFarmZonesClient() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<"zones" | "crops" | "sensors">("zones");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const handleDownloadTemplate = () => {
    alert("Chức năng tải file mẫu đang được cập nhật.");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setMessage(null);
    setError(null);

    if (!file) {
      setError("Vui lòng chọn file .xlsx, .csv hoặc .txt");
      return;
    }

    setSubmitting(true);

    try {
      let result;
      if (activeTab === "zones") {
        result = await importsApi.uploadFarmZones(file);
        setMessage(`Import thành công ${result.imported} vùng trồng.`);
      } else if (activeTab === "crops") {
        result = await importsApi.uploadCrops(file);
        setMessage(`Import thành công ${result.imported} cây trồng.`);
      } else {
        result = await importsApi.uploadSensors(file);
        setMessage(`Import thành công ${result.imported} thiết bị cảm biến.`);
      }
      setFile(null);
    } catch (err: any) {
      setError(err.message || "Import thất bại");
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
      {/* Tab Navigation header */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
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
            className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer ${activeTab === "zones"
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
            className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer ${activeTab === "crops"
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
            className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer ${activeTab === "sensors"
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Nhập dữ liệu Vùng Trồng</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Header bắt buộc: <code className="font-mono font-bold text-foreground">name, area, gpsCoordinates, soilType</code>
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex h-9 items-center gap-1.5 rounded-3xl border bg-background hover:bg-muted px-3 text-xs font-semibold transition cursor-pointer"
            >
              Tải file mẫu (.xlsx)
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold">Chọn file dữ liệu</span>
            <DragDropZone
              selectedFile={file}
              onFileAccept={(f) => setFile(f)}
              onFileRemove={() => setFile(null)}
            />
          </div>

          <div className="mt-4 rounded-3xl bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Mẫu header:</p>
            <code className="mt-2 block whitespace-pre-wrap text-xs font-mono bg-background p-2 rounded-3xl border">
              name,description,area,gpsCoordinates,soilType,status
            </code>
          </div>

          {message && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 text-sm transition shadow-sm shadow-emerald-600/10 hover:shadow-emerald-600/20 disabled:opacity-70 cursor-pointer"
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
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-6 shadow-sm space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Nhập dữ liệu Cây Trồng</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Header bắt buộc: <code className="font-mono font-bold text-foreground">name, variety, plantedDate, status, farmZoneName</code>
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex h-9 items-center gap-1.5 rounded-3xl border bg-background hover:bg-muted px-3 text-xs font-semibold transition"
            >
              Tải file mẫu (.xlsx)
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold">Chọn file dữ liệu</span>
            <DragDropZone
              selectedFile={file}
              onFileAccept={(f) => setFile(f)}
              onFileRemove={() => setFile(null)}
            />
          </div>

          <div className="mt-4 rounded-3xl bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Mẫu header:</p>
            <code className="mt-2 block whitespace-pre-wrap text-xs font-mono bg-background p-2 rounded-3xl border">
              name,variety,plantedDate,expectedHarvestDate,status,farmZoneName
            </code>
          </div>

          {message && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 text-sm transition shadow-sm shadow-emerald-600/10 hover:shadow-emerald-600/20 disabled:opacity-70 cursor-pointer"
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

      {activeTab === "sensors" && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-6 shadow-sm space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Nhập dữ liệu Thiết Bị Cảm Biến</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Header bắt buộc: <code className="font-mono font-bold text-foreground">name, code, type, unit, status, farmZoneName</code>
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex h-9 items-center gap-1.5 rounded-3xl border bg-background hover:bg-muted px-3 text-xs font-semibold transition"
            >
              Tải file mẫu (.xlsx)
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold">Chọn file dữ liệu</span>
            <DragDropZone
              selectedFile={file}
              onFileAccept={(f) => setFile(f)}
              onFileRemove={() => setFile(null)}
            />
          </div>

          <div className="mt-4 rounded-3xl bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Mẫu header:</p>
            <code className="mt-2 block whitespace-pre-wrap text-xs font-mono bg-background p-2 rounded-3xl border">
              name,code,type,unit,status,farmZoneName
            </code>
          </div>

          {message && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 text-sm transition shadow-sm shadow-emerald-600/10 hover:shadow-emerald-600/20 disabled:opacity-70 cursor-pointer"
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
    </div>
  );
}
