import { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, AlertCircle, X, Download, CheckCircle2 } from "lucide-react";
import { importsApi } from "@/lib/api";

interface ImportSensorsExcelModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (importedCount: number, skippedCount: number) => void;
}

export function ImportSensorsExcelModal({ open, onClose, onSuccess }: ImportSensorsExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors?: any[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "text/csv", // .csv
      "text/plain", // .txt
    ];
    const validExtensions = [".xlsx", ".csv", ".txt"];

    const isValidType = validTypes.includes(selectedFile.type);
    const isValidExtension = validExtensions.some((ext) => selectedFile.name.toLowerCase().endsWith(ext));

    if (!isValidType && !isValidExtension) {
      setError("Vui lòng chọn file Excel (.xlsx) hoặc CSV (.csv, .txt).");
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("Dung lượng file không được vượt quá 2MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDownloadTemplate = async () => {
    try {
      await importsApi.downloadSensorsTemplate();
    } catch (err: any) {
      setError("Không thể tải file mẫu: " + (err.message || "Lỗi không xác định"));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Vui lòng chọn file để upload.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setImportResult(null);

    try {
      const result = await importsApi.uploadSensors(file);
      setImportResult(result as any);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi trong quá trình upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setFile(null);
    setError(null);
    setImportResult(null);
    onClose();
  };

  const handleFinish = () => {
    if (importResult) {
      onSuccess(importResult.imported, importResult.skipped);
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-lg bg-card rounded-2xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Import Cảm Biến</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-full p-2 hover:bg-muted transition text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {!importResult ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="space-y-1">
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">Chưa có file mẫu?</h3>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70">
                    Tải file Excel mẫu để điền dữ liệu đúng định dạng
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="shrink-0 flex items-center gap-2 px-3 py-2 bg-white dark:bg-background rounded-lg border shadow-sm text-sm font-medium hover:bg-muted transition"
                >
                  <Download className="size-4" />
                  Tải File Mẫu
                </button>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10"
                    : "border-muted-foreground/25 hover:bg-muted/50"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-muted rounded-full">
                    <UploadCloud className="size-8 text-muted-foreground" />
                  </div>
                  {file ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <FileSpreadsheet className="size-5" />
                      <span className="font-medium text-sm">{file.name}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">Kéo thả file vào đây hoặc</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline underline-offset-4 transition"
                      >
                        chọn file từ máy tính
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.csv,.txt"
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Hỗ trợ file: .xlsx, .csv (Tối đa 2MB)</p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-3 pt-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Xử lý hoàn tất</h3>
                  <p className="text-muted-foreground text-sm mt-1">Quá trình import dữ liệu đã kết thúc.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card border rounded-xl text-center">
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {importResult.imported}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                    Cảm biến hợp lệ
                  </p>
                </div>
                <div className="p-4 bg-card border rounded-xl text-center">
                  <p className="text-3xl font-bold text-destructive">{importResult.skipped}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                    Bị lỗi / Bỏ qua
                  </p>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="size-4 text-destructive" />
                    Chi tiết lỗi:
                  </h4>
                  <div className="max-h-40 overflow-y-auto rounded-xl border bg-muted/50 p-3 text-xs space-y-2">
                    {importResult.errors.map((err, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="font-semibold shrink-0 text-muted-foreground">Dòng {err.row}:</span>
                        <span className="text-destructive">{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex justify-end gap-3 mt-auto">
          {!importResult ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Tải lên"
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 transition"
            >
              Đóng & Tải lại danh sách
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
