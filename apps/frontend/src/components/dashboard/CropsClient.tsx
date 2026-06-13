"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, SlidersHorizontal, RefreshCw, Leaf, CheckCircle2 } from "lucide-react";

import { cropsApi, type Crop } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { CropTable } from "./CropTable";
import { CropForm } from "../forms/CropForm";
import { ImportCropsExcelModal } from "./ImportCropsExcelModal";

interface CropsClientProps {
  initialZones: Array<{ id: string; name: string }>;
}

export function CropsClient({ initialZones }: CropsClientProps) {
  const user = useAuthStore((state) => state.user);
  // Phân quyền: Cả USER và ADMIN đều có thể thao tác, nhưng ta có thể check logic (ví dụ chỉ ADMIN mới có toàn quyền)
  const isAdmin = user?.role === "ADMIN";

  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc
  const [filterZone, setFilterZone] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | undefined>(undefined);

  // Import modal state
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCrops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cropsApi.list({
        farmZoneId: filterZone,
        status: filterStatus,
        search: debouncedSearch,
      });
      setCrops(data as Crop[]);
    } catch (err: unknown) {
      console.error("Fetch crops failed:", err);
      setError("Không thể tải danh sách cây trồng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [filterZone, filterStatus, debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Cần load danh sách
    fetchCrops();
  }, [fetchCrops]);

  const handleCreateClick = () => {
    setSelectedCrop(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (crop: Crop) => {
    setSelectedCrop(crop);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await cropsApi.delete(id);
      triggerToast("success", "Xóa cây trồng thành công!");
      fetchCrops();
    } catch (err: unknown) {
      triggerToast("error", (err instanceof Error ? err.message : null) || "Không thể xóa cây trồng.");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    triggerToast("success", selectedCrop ? "Cập nhật thông tin thành công!" : "Thêm cây trồng mới thành công!");
    fetchCrops();
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 ${toast.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/10 text-destructive"
            }`}
        >
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header and Add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Cây Trồng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi danh mục, lịch trình canh tác và tình trạng sinh trưởng của cây giống.
          </p>
          {/* Stat badges khi có dữ liệu */}
          {!loading && crops.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                <Leaf className="size-3" />
                {crops.length} cây trồng
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:border-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300">
                <CheckCircle2 className="size-3" />
                {crops.filter((c) => c.status === "GROWING").length} đang phát triển
              </span>
              {crops.filter((c) => c.status === "DISEASED").length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-400/10 dark:text-rose-300">
                  ⚠️ {crops.filter((c) => c.status === "DISEASED").length} nhiễm bệnh
                </span>
              )}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsImportOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-card hover:bg-muted px-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Import Excel
            </button>
            <button
              onClick={handleCreateClick}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-semibold text-white transition-all shadow-sm shadow-emerald-600/10"
            >
              <Plus className="size-4" />
              Thêm cây trồng
            </button>
          </div>
        )}
      </div>

      {/* Import Crops Modal */}
      <ImportCropsExcelModal
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={(imported, skipped) => {
          triggerToast("success", `Import thành công ${imported} cây trồng${skipped > 0 ? `, bỏ qua ${skipped} dòng lỗi` : ""}!`);
          fetchCrops();
        }}
      />

      {/* Form Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-xl">
            <CropForm
              initialData={selectedCrop}
              zones={initialZones}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/75" />
          <input
            type="text"
            placeholder="Tìm theo tên cây, giống cây..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          {/* Lọc theo Vùng trồng */}
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="h-11 rounded-xl border bg-card px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="ALL">Tất cả vùng</option>
            {initialZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>

          {/* Lọc theo Trạng thái */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 rounded-xl border bg-card px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PLANTED">Mới gieo hạt</option>
            <option value="GROWING">Đang phát triển</option>
            <option value="HARVESTED">Đã thu hoạch</option>
            <option value="DISEASED">Nhiễm bệnh</option>
          </select>

          <button
            onClick={fetchCrops}
            className="flex size-11 items-center justify-center rounded-xl border hover:bg-muted transition text-muted-foreground hover:text-foreground shrink-0"
            title="Làm mới"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table/Cards list */}
      {loading ? (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {/* Skeleton header */}
          <div className="border-b bg-muted/40 px-6 py-4">
            <div className="flex gap-6">
              {["40%", "20%", "20%", "15%"].map((w, i) => (
                <div key={i} className={`h-3 rounded-full bg-muted-foreground/15 animate-pulse`} style={{ width: w }} />
              ))}
            </div>
          </div>
          {/* Skeleton rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 border-b px-6 py-4 last:border-0">
              <div className="h-4 w-[30%] rounded-full bg-emerald-500/10 animate-pulse" />
              <div className="h-3 w-[18%] rounded-full bg-muted/70 animate-pulse" />
              <div className="h-3 w-[18%] rounded-full bg-muted/70 animate-pulse" />
              <div className="h-3 w-[12%] rounded-full bg-muted/70 animate-pulse" />
              <div className="h-5 w-[16%] rounded-full bg-sky-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchCrops}
            className="mt-3 text-xs font-semibold underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <CropTable
          crops={crops}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
