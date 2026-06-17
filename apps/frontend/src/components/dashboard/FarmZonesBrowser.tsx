"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Leaf,
  RadioTower,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { type FarmZone } from "@/lib/api";
import { FarmZoneCard } from "./FarmZoneCard";
import { ImportExcelModal } from "./ImportExcelModal";
import { useAuthStore } from "@/stores/auth.store";

interface FarmZonesBrowserProps {
  initialZones: FarmZone[];
}

// 3 vùng mẫu hiển thị trong empty state khi DB chưa có dữ liệu
const DEMO_REGIONS = [
  {
    name: "Miền Bắc Việt Nam",
    location: "Hà Nội, Vĩnh Phúc",
    crop: "Rau thủy canh · Dưa leo",
    temp: "24°C",
    soil: "65%",
    status: "Ổn định",
    statusColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-400/10",
    dotColor: "bg-emerald-500",
  },
  {
    name: "Miền Trung Việt Nam",
    location: "Đà Nẵng, Quảng Nam",
    crop: "Cây ăn quả · Thanh long",
    temp: "34°C",
    soil: "38%",
    status: "Cần tưới",
    statusColor: "text-amber-600 bg-amber-50 dark:bg-amber-400/10",
    dotColor: "bg-amber-500",
  },
  {
    name: "Miền Nam Việt Nam",
    location: "Tiền Giang, Long An",
    crop: "Lúa · Xoài · Sầu riêng",
    temp: "31°C",
    soil: "72%",
    status: "Theo dõi",
    statusColor: "text-sky-600 bg-sky-50 dark:bg-sky-400/10",
    dotColor: "bg-sky-500",
  },
];

export function FarmZonesBrowser({ initialZones }: FarmZonesBrowserProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const canManage = user?.role !== "ADMIN";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const router = useRouter();

  const filteredZones = initialZones.filter((zone) => {
    const matchesSearch =
      zone.name.toLowerCase().includes(search.toLowerCase()) ||
      (zone.description && zone.description.toLowerCase().includes(search.toLowerCase())) ||
      zone.soilType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || zone.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = initialZones.filter((z) => z.status === "ACTIVE").length;
  const alertCount = initialZones.reduce((sum, z) => sum + (z.openAlertsCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Vùng Trồng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi, chỉnh sửa và cấu hình các khu vực trồng trọt và cảm biến.
          </p>
          {/* Stat badges */}
          {initialZones.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 sm:px-3 sm:py-1 sm:text-xs">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {initialZones.length} vùng trồng
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:border-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 sm:px-3 sm:py-1 sm:text-xs">
                <CheckCircle2 className="size-3" />
                {activeCount} hoạt động
              </span>
              {alertCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-400/10 dark:text-rose-300 sm:px-3 sm:py-1 sm:text-xs">
                  <AlertTriangle className="size-3" />
                  {alertCount} cảnh báo
                </span>
              )}
            </div>
          )}
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportOpen(true)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-3xl border bg-card hover:bg-muted px-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-sm sm:h-10 sm:flex-initial sm:px-4 sm:text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Import
            </button>
            <Link
              href="/dashboard/zones/new"
              className="inline-flex h-9 flex-1 shrink-0 items-center justify-center gap-2 rounded-3xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 sm:h-10 sm:flex-initial sm:px-4 sm:text-sm"
            >
              <Plus className="size-4" />
              Thêm vùng
            </Link>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-2xl border shadow-sm">
        {/* Mobile: collapsed filter toggle */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("zone-filters");
            el?.classList.toggle("hidden");
          }}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-muted-foreground sm:hidden"
        >
          <span className="flex items-center gap-2">
            <Search className="size-4" />
            Tìm kiếm & Lọc
          </span>
          <span className="text-xs text-muted-foreground/60">Nhấn để mở</span>
        </button>

        <div id="zone-filters" className="hidden sm:block">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/75" />
              <input
                type="text"
                placeholder="Tìm theo tên, mô tả, loại đất..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-3xl border bg-background pl-10 pr-4 text-xs outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:h-11 sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-3xl border bg-background px-3 text-xs font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:h-11 sm:text-sm"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng HĐ</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredZones.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {filteredZones.map((zone) => (
            <FarmZoneCard key={zone.id} zone={zone} />
          ))}
        </section>
      ) : initialZones.length === 0 ? (
        /* Empty state — DB chưa có dữ liệu */
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed bg-card px-6 py-10 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <Leaf className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Chưa có vùng trồng nào</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Hệ thống chưa có dữ liệu vùng trồng. {canManage ? "Nhấn \"Thêm vùng trồng\" để bắt đầu." : "Liên hệ chủ vùng trồng để thêm vùng trồng."}
            </p>
            {canManage && (
              <Link
                href="/dashboard/zones/new"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-3xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Plus className="size-4" />
                Thêm vùng trồng đầu tiên
              </Link>
            )}
          </div>

          {/* Preview 3 vùng mẫu */}
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ví dụ vùng trồng theo 3 miền
          </p>
          <div className="grid gap-4 sm:grid-cols-3 opacity-60 pointer-events-none select-none">
            {DEMO_REGIONS.map((region) => (
              <div
                key={region.name}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm leading-tight">{region.name}</h4>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      {region.location}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${region.statusColor}`}>
                    <span className={`size-1.5 rounded-full ${region.dotColor}`} />
                    {region.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">{region.crop}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5 rounded-3xl bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
                    <span className="text-[10px] text-muted-foreground">Nhiệt độ</span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{region.temp}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 rounded-3xl bg-sky-50 px-3 py-2 dark:bg-sky-950/30">
                    <span className="text-[10px] text-muted-foreground">Ẩm đất</span>
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-300">{region.soil}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <RadioTower className="size-3" />
                  <span>Đang giám sát qua IoT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Tìm kiếm không có kết quả */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <Search className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Không tìm thấy kết quả</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái để tìm thấy khu vực mong muốn.
          </p>
        </div>
      )}

      {/* Import Zones Modal */}
      <ImportExcelModal
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}


