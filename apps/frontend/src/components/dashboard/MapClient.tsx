"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Compass, MapPin, Navigation } from "lucide-react";
import { type FarmZone } from "@/lib/api";

const FarmMap = dynamic(
  () => import("../map/FarmMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] w-full items-center justify-center rounded-2xl border border-dashed bg-card animate-pulse">
        <span className="text-sm text-muted-foreground font-semibold">Đang tải bản đồ LeafletJS...</span>
      </div>
    )
  }
);

interface MapClientProps {
  initialZones?: FarmZone[];
  zones?: FarmZone[];
}

export function MapClient({ initialZones, zones }: MapClientProps) {
  const mapZones = initialZones ?? zones ?? [];
  const [selectedZone, setSelectedZone] = useState<FarmZone | null>(null);

  const statusLabels = {
    ACTIVE: "Hoạt động",
    INACTIVE: "Ngừng hoạt động",
    MAINTENANCE: "Bảo trì",
  };

  const handleSelectZone = (zone: FarmZone) => {
    setSelectedZone(zone);
  };

  if (mapZones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-20 text-center">
        <MapPin className="size-10 text-muted-foreground/45 animate-bounce" />
        <h3 className="mt-4 text-base font-semibold">Chưa có tọa độ bản đồ</h3>
        <p className="mt-1.5 text-xs text-muted-foreground max-w-xs">
          Nông trại chưa ghi nhận tọa độ GPS của bất kỳ vùng trồng nào. Vui lòng thêm/cập nhật tọa độ trước.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bản Đồ Vùng Trồng</h1>
        <p className="text-sm text-muted-foreground">
          Giám sát trực quan vị trí địa lý của các phân khu nông trại tích hợp thiết bị cảm biến IoT.
        </p>
      </div>

      {/* Responsive View Grid: Desktop map + list, Mobile map top list bottom */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Leaflet Map panel */}
        <div className="order-1 lg:order-1">
          <FarmMap
            zones={mapZones}
            selectedZone={selectedZone}
            onSelectZone={handleSelectZone}
          />
        </div>

        {/* Sidebar list panel */}
        <div className="order-2 lg:order-2 rounded-2xl border bg-card p-5 shadow-sm h-[480px] flex flex-col">
          <div className="border-b pb-3 mb-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Navigation className="size-4.5 text-emerald-600" />
              Danh sách phân khu ({mapZones.length})
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Click vào phân khu để di chuyển camera bản đồ
            </p>
          </div>

          {/* List items scroll area */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {mapZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              const hasAlerts = zone.openAlertsCount !== undefined && zone.openAlertsCount > 0;
              
              return (
                <button
                  key={zone.id}
                  onClick={() => handleSelectZone(zone)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all text-xs flex items-start gap-3 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500"
                      : "hover:border-muted-foreground/30 hover:bg-muted/30 bg-background"
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
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        zone.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-100 text-zinc-700"
                      }`}>
                        {statusLabels[zone.status] || zone.status}
                      </span>

                      {hasAlerts && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-destructive">
                          <AlertTriangle className="size-3.5 shrink-0" />
                          Có {zone.openAlertsCount} cảnh báo
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
