"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Cpu, SlidersHorizontal, RefreshCw, Search } from "lucide-react";

import { sensorsApi, type Sensor } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { SensorTable } from "./SensorTable";
import { SensorForm } from "../forms/SensorForm";
import { ImportSensorsExcelModal } from "./ImportSensorsExcelModal";

interface SensorsClientProps {
  initialZones: Array<{ id: string; name: string }>;
}

export function SensorsClient({ initialZones }: SensorsClientProps) {
  const user = useAuthStore((state) => state.user);
  // ADMIN chỉ xem, chức năng thêm/sửa/xoá dành cho chủ vùng trồng (USER)
  const isAdmin = user?.role === "ADMIN";

  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterZone, setFilterZone] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
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
  const [selectedSensor, setSelectedSensor] = useState<Sensor | undefined>(undefined);

  // Import modal state
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSensors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sensorsApi.list({
        farmZoneId: filterZone,
        type: filterType,
        status: filterStatus,
        search: debouncedSearch,
      });
      setSensors(data as Sensor[]);
    } catch (err: unknown) {
      console.error("Fetch sensors failed:", err);
      setError("Không thể tải danh sách thiết bị cảm biến. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [filterZone, filterType, filterStatus, debouncedSearch]);

  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

  const handleCreateClick = () => {
    setSelectedSensor(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await sensorsApi.delete(id);
      triggerToast("success", "Xóa thiết bị cảm biến thành công!");
      fetchSensors();
    } catch (err: unknown) {
      triggerToast("error", (err instanceof Error ? err.message : null) || "Không thể xóa cảm biến.");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    triggerToast("success", selectedSensor ? "Cập nhật thiết bị thành công!" : "Đăng ký thiết bị mới thành công!");
    fetchSensors();
  };

  // Tính toán thống kê
  const totalSensors = sensors.length;
  const activeSensors = sensors.filter((s) => s.status === "ACTIVE").length;
  const inactiveSensors = sensors.filter((s) => s.status === "INACTIVE").length;
  const errorSensors = sensors.filter((s) => s.status === "ERROR").length;
  const activePercent = totalSensors > 0 ? Math.round((activeSensors / totalSensors) * 100) : 0;

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
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Thiết Bị Cảm Biến</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách phần cứng trạm IoT đo đạc nhiệt độ, độ ẩm và cường độ ánh sáng.
          </p>
        </div>

        {/* Nút thao tác - chỉ cho phép ADMIN */}
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
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-semibold text-white transition-all shadow-sm shadow-emerald-600/10 hover:shadow-emerald-600/20"
            >
              <Plus className="size-4" />
              Thêm cảm biến
            </button>
          </div>
        )}
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total */}
        <div className="col-span-2 sm:col-span-1 flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 shrink-0">
            <Cpu className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng thiết bị</p>
            <p className="text-2xl font-bold tracking-tight mt-0.5">{loading ? "..." : totalSensors}</p>
            {!loading && totalSensors > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{activePercent}% đang hoạt động</p>
            )}
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400 shrink-0">
            <div className="relative flex size-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-sky-500"></span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hoạt động</p>
            <p className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 mt-0.5">{loading ? "..." : activeSensors}</p>
          </div>
        </div>

        {/* Inactive */}
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-500/10 text-zinc-500 dark:bg-zinc-400/10 dark:text-zinc-400 shrink-0">
            <SlidersHorizontal className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ngừng HĐ</p>
            <p className="text-2xl font-bold tracking-tight text-zinc-600 dark:text-zinc-400 mt-0.5">{loading ? "..." : inactiveSensors}</p>
          </div>
        </div>

        {/* Error */}
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gặp sự cố</p>
            <p className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 mt-0.5">{loading ? "..." : errorSensors}</p>
          </div>
        </div>
      </div>

      {/* Import Sensors Modal */}
      <ImportSensorsExcelModal
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={(imported, skipped) => {
          triggerToast("success", `Import thành công ${imported} cảm biến${skipped > 0 ? `, bỏ qua ${skipped} dòng lỗi` : ""}!`);
          fetchSensors();
        }}
      />

      {/* Form Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-xl">
            <SensorForm
              initialData={selectedSensor}
              zones={initialZones}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 p-5 bg-card rounded-2xl border shadow-sm sm:flex-row sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Lọc theo Tên/Mã (Search) */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[240px] flex-1 sm:flex-initial">
            <span className="shrink-0 font-medium text-foreground">Tìm kiếm:</span>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tên, mã cảm biến..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {/* Lọc theo Vùng */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-l pl-4 border-muted-foreground/20">
            <span className="shrink-0 font-medium text-foreground">Vùng:</span>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="h-9 rounded-lg border bg-background px-3 text-xs font-semibold outline-none transition hover:bg-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
            >
              <option value="ALL">Tất cả các vùng</option>
              {initialZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo Loại cảm biến */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-l pl-4 border-muted-foreground/20">
            <span className="shrink-0 font-medium text-foreground">Loại:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-9 rounded-lg border bg-background px-3 text-xs font-semibold outline-none transition hover:bg-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="TEMPERATURE">Nhiệt độ (Temperature)</option>
              <option value="AIR_HUMIDITY">Độ ẩm khí (Air Humidity)</option>
              <option value="SOIL_MOISTURE">Độ ẩm đất (Soil Moisture)</option>
              <option value="LIGHT_INTENSITY">Ánh sáng (Light)</option>
              <option value="ALL_IN_ONE">Tích hợp đa năng (All-in-one)</option>
            </select>
          </div>

          {/* Lọc theo Trạng thái */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-l pl-4 border-muted-foreground/20">
            <span className="shrink-0 font-medium text-foreground">Trạng thái:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 rounded-lg border bg-background px-3 text-xs font-semibold outline-none transition hover:bg-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động (Active)</option>
              <option value="INACTIVE">Ngừng hoạt động (Inactive)</option>
              <option value="ERROR">Gặp lỗi (Error)</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchSensors}
          className="flex size-9 items-center justify-center rounded-xl border hover:bg-muted transition text-muted-foreground hover:text-foreground shrink-0 self-end sm:self-auto"
          title="Làm mới"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table & Loader */}
      {loading ? (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="h-12 w-full bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-muted animate-pulse flex items-center px-6">
            <div className="h-4 w-1/4 bg-muted rounded"></div>
            <div className="h-4 w-1/4 bg-muted rounded ml-auto"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-6 w-1/3 bg-muted/60 rounded animate-pulse"></div>
                <div className="h-6 w-1/6 bg-muted/40 rounded animate-pulse"></div>
                <div className="h-6 w-1/6 bg-muted/40 rounded animate-pulse"></div>
                <div className="h-6 w-12 bg-muted/50 rounded-full animate-pulse ml-auto"></div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchSensors}
            className="mt-3 text-xs font-semibold underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <SensorTable
          sensors={sensors}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
