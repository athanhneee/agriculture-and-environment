"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Filter, SlidersHorizontal, RefreshCw } from "lucide-react";

import { cropsApi, type Crop, type CropStatus } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { CropTable } from "./CropTable";
import { CropForm } from "../forms/CropForm";

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
  const [filterZone, setFilterZone] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | undefined>(undefined);

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
      });
      setCrops(data);
    } catch (err: any) {
      console.error("Fetch crops failed:", err);
      setError("Không thể tải danh sách cây trồng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [filterZone, filterStatus]);

  useEffect(() => {
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
    } catch (err: any) {
      triggerToast("error", err.message || "Không thể xóa cây trồng.");
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
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success"
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
          <p className="text-sm text-muted-foreground">
            Theo dõi danh mục, lịch trình canh tác và tình trạng sinh trưởng của cây giống.
          </p>
        </div>
        
        {/* Nút thêm mới - chỉ hiển thị nếu có quyền */}
        <button
          onClick={handleCreateClick}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-semibold text-white transition-all shadow-sm shadow-emerald-600/10"
        >
          <Plus className="size-4" />
          Thêm cây trồng
        </button>
      </div>

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-card p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Lọc theo Vùng trồng */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 font-medium text-foreground">Vùng trồng:</span>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="h-9 rounded-lg border bg-background px-2.5 text-xs font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="ALL">Tất cả các vùng</option>
              {initialZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo Trạng thái */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-l pl-3 border-muted-foreground/20">
            <span className="shrink-0 font-medium text-foreground">Trạng thái:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 rounded-lg border bg-background px-2.5 text-xs font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PLANTED">Mới gieo hạt (Planted)</option>
              <option value="GROWING">Đang phát triển (Growing)</option>
              <option value="HARVESTED">Đã thu hoạch (Harvested)</option>
              <option value="DISEASED">Nhiễm bệnh (Diseased)</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchCrops}
          className="flex size-9 items-center justify-center rounded-xl border hover:bg-muted transition text-muted-foreground hover:text-foreground shrink-0"
          title="Làm mới"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Table/Cards list */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-12 w-full bg-muted/65 rounded-xl animate-pulse" />
          <div className="h-16 w-full bg-muted/50 rounded-xl animate-pulse" />
          <div className="h-16 w-full bg-muted/50 rounded-xl animate-pulse" />
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
