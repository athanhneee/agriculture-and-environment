"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Cpu, SlidersHorizontal, RefreshCw } from "lucide-react";

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
  // Backend yêu cầu quyền ADMIN đối với các tác động thay đổi của Cảm biến (Create, Update, Delete)
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
    } catch (err: any) {
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
    } catch (err: any) {
      triggerToast("error", err.message || "Không thể xóa cảm biến.");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    triggerToast("success", selectedSensor ? "Cập nhật thiết bị thành công!" : "Đăng ký thiết bị mới thành công!");
    fetchSensors();
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
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-semibold text-white transition-all shadow-sm shadow-emerald-600/10"
            >
              <Plus className="size-4" />
              Thêm cảm biến
            </button>
          </div>
        )}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-card p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Lọc theo Tên/Mã (Search) */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 font-medium text-foreground">Tìm kiếm:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Tên, mã cảm biến..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-40 sm:w-48 rounded-lg border bg-background px-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {/* Lọc theo Vùng */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-l pl-3 border-muted-foreground/20">
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

          {/* Lọc theo Loại cảm biến */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-l pl-3 border-muted-foreground/20">
            <span className="shrink-0 font-medium text-foreground">Loại:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-9 rounded-lg border bg-background px-2.5 text-xs font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="ALL">Tất cả chủng loại</option>
              <option value="TEMPERATURE">Nhiệt độ (Temperature)</option>
              <option value="AIR_HUMIDITY">Độ ẩm khí (Air Humidity)</option>
              <option value="SOIL_MOISTURE">Độ ẩm đất (Soil Moisture)</option>
              <option value="LIGHT_INTENSITY">Ánh sáng (Light)</option>
              <option value="ALL_IN_ONE">Tích hợp đa năng (All-in-one)</option>
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
              <option value="ACTIVE">Hoạt động (Active)</option>
              <option value="INACTIVE">Ngừng hoạt động (Inactive)</option>
              <option value="ERROR">Gặp lỗi (Error)</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchSensors}
          className="flex size-9 items-center justify-center rounded-xl border hover:bg-muted transition text-muted-foreground hover:text-foreground shrink-0"
          title="Làm mới"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table & Loader */}
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
