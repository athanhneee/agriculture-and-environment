"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Compass, MapPin, Navigation, RadioTower } from "lucide-react";
import { type FarmZone } from "@/lib/api";

// ── Lazy load FarmMap (Leaflet chỉ chạy client) ──────────────────────────────
const FarmMap = dynamic(() => import("../map/FarmMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[540px] w-full flex-col items-center justify-center rounded-2xl border bg-card text-center">
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
        <Compass className="size-8 text-emerald-600 animate-spin" style={{ animationDuration: "2.5s" }} />
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground">Đang khởi tạo bản đồ...</p>
      <p className="mt-1 text-xs text-muted-foreground/60">Leaflet GIS đang tải dữ liệu địa lý</p>
    </div>
  ),
});

// ── Tọa độ fallback theo tên vùng ────────────────────────────────────────────
const REGION_FALLBACK: Record<string, [number, number]> = {
  "miền bắc":   [21.0278, 105.8342],
  "mien bac":   [21.0278, 105.8342],
  "miền trung": [16.4637, 107.5909],
  "mien trung": [16.4637, 107.5909],
  "miền nam":   [10.7769, 106.7009],
  "mien nam":   [10.7769, 106.7009],
};

function getZoneCoords(zone: FarmZone): [number, number] | null {
  if (zone.latitude && zone.longitude && zone.latitude !== 0 && zone.longitude !== 0) {
    return [zone.latitude, zone.longitude];
  }
  const nameLower = zone.name.toLowerCase();
  for (const [key, coords] of Object.entries(REGION_FALLBACK)) {
    if (nameLower.includes(key)) return coords;
  }
  return null;
}

interface MapClientProps {
  initialZones?: FarmZone[];
  zones?: FarmZone[];
}

const statusConfig = {
  ACTIVE:      { label: "Hoạt động",      dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  INACTIVE:    { label: "Ngừng HĐ",       dot: "bg-zinc-400",    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
  MAINTENANCE: { label: "Bảo trì",        dot: "bg-amber-500",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

export function MapClient({ initialZones, zones }: MapClientProps) {
  const mapZones = initialZones ?? zones ?? [];
  const [selectedZone, setSelectedZone] = useState<FarmZone | null>(null);

  const zonesWithCoords = mapZones.filter((z) => getZoneCoords(z) !== null);
  const zonesNoCoords   = mapZones.filter((z) => getZoneCoords(z) === null);
  const totalAlerts = mapZones.reduce((s, z) => s + (z.openAlertsCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bản Đồ Nông Trại</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Giám sát trực quan vị trí địa lý các phân khu tích hợp thiết bị IoT.
          </p>
        </div>
        {totalAlerts > 0 && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800/40 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-400">
            <AlertTriangle className="size-4" />
            {totalAlerts} cảnh báo đang mở
          </div>
        )}
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <MapPin className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tổng vùng</p>
            <p className="text-xl font-bold mt-0.5">{mapZones.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
            <ZoomIn className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Trên bản đồ</p>
            <p className="text-xl font-bold text-sky-600 mt-0.5">{zonesWithCoords.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
            <Wifi className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cảm biến</p>
            <p className="text-xl font-bold text-violet-600 mt-0.5">
              {mapZones.reduce((s, z) => s + (z.sensorsCount ?? 0), 0)}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-sm hover:shadow-md transition-shadow ${totalAlerts > 0 ? "border-red-200 dark:border-red-800/40" : ""}`}>
          <div className={`flex size-10 items-center justify-center rounded-xl ${totalAlerts > 0 ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"}`}>
            {totalAlerts > 0 ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cảnh báo</p>
            <p className={`text-xl font-bold mt-0.5 ${totalAlerts > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600"}`}>
              {totalAlerts > 0 ? totalAlerts : "OK"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main layout: Map + Sidebar ──────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Map panel */}
        <div className="order-2 lg:order-1">
          {zonesWithCoords.length === 0 ? (
            <div className="flex h-[540px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card text-center px-6">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-muted">
                <MapPin className="size-9 text-muted-foreground/40" />
              </div>
              <h3 className="mt-5 text-base font-bold">Chưa có tọa độ GPS</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
                Các vùng trồng chưa được ghi nhận tọa độ địa lý. Hãy cập nhật tọa độ GPS cho từng vùng để hiển thị bản đồ.
              </p>
              <a
                href="/dashboard/zones"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                <Navigation className="size-4" />
                Đến trang Vùng trồng
              </a>
            </div>
          ) : (
            <FarmMap
              zones={mapZones}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
            />
          )}
        </div>

        {/* Sidebar list */}
        <div className="order-1 lg:order-2 flex h-[540px] flex-col rounded-2xl border bg-card shadow-sm">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Navigation className="size-4 text-emerald-600" />
                Danh sách phân khu
                <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold">
                  {mapZones.length}
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Click để di chuyển camera bản đồ
              </p>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="flex size-8 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground transition"
              title="Reset view"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>

          {/* Scrollable zone list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {mapZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              const hasCoords  = getZoneCoords(zone) !== null;
              const hasAlerts  = (zone.openAlertsCount ?? 0) > 0;
              const sta = statusConfig[zone.status as keyof typeof statusConfig] ?? statusConfig.INACTIVE;

              return (
                <button
                  key={zone.id}
                  onClick={() => hasCoords ? setSelectedZone(zone) : undefined}
                  disabled={!hasCoords}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all duration-150 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/40 shadow-sm"
                      : hasCoords
                      ? "hover:border-emerald-300 hover:bg-muted/40 bg-background border-border"
                      : "bg-muted/20 border-dashed opacity-60 cursor-not-allowed"
                  }`}
                >
                  <MapPin className={`size-5 shrink-0 mt-0.5 ${isSelected ? "text-emerald-600" : "text-muted-foreground/75"}`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">{zone.name}</h4>
                    
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
                      <span className="flex items-center gap-1">
                        <Compass className="size-3" />
                        {zone.area} ha
                      </span>
                      <span>•</span>
                      <span>Đất {zone.soilType}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <RadioTower className="size-3" />
                        {zone.sensors?.length || 0}
                      </span>
                    </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${sta.badge}`}>
                          {sta.label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Compass className="size-3" /> {zone.area} ha
                        </span>
                        {zone.sensorsCount !== undefined && zone.sensorsCount > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Wifi className="size-3" /> {zone.sensorsCount}
                          </span>
                        )}
                      </div>

                      {/* Soil type */}
                      {zone.soilType && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/70">
                          <Layers className="size-3" />
                          <span>Đất {zone.soilType}</span>
                        </div>
                      )}

                      {/* No coords warning */}
                      {!hasCoords && (
                        <p className="mt-1.5 text-[10px] italic text-muted-foreground/60">
                          Chưa có tọa độ GPS
                        </p>
                      )}
                    </div>
                </button>
              );
            })}

            {mapZones.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center py-8">
                <MapPin className="size-8 text-muted-foreground/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">Chưa có vùng trồng</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="border-t px-5 py-3 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Chú giải</p>
            <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-500 inline-block" /> Hoạt động</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-red-500 inline-block" /> Có cảnh báo</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-zinc-400 inline-block" /> Ngừng HĐ</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-amber-500 inline-block" /> Bảo trì</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Zone without coords notice ──────────────────────────────────── */}
      {zonesNoCoords.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              {zonesNoCoords.length} vùng trồng chưa có tọa độ GPS
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {zonesNoCoords.map((z) => z.name).join(", ")} — Hãy cập nhật tọa độ để hiển thị trên bản đồ.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
