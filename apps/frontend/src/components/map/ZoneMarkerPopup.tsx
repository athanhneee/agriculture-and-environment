import Link from "next/link";
import { AlertTriangle, Compass, Droplet, Layers, MapPin, Thermometer } from "lucide-react";
import { type FarmZone } from "@/lib/api";

interface ZoneMarkerPopupProps {
  zone: FarmZone;
}

export function ZoneMarkerPopup({ zone }: ZoneMarkerPopupProps) {
  const statusLabels = {
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Ngừng hoạt động",
    MAINTENANCE: "Đang bảo trì",
  };

  const hasAlerts = zone.openAlertsCount !== undefined && zone.openAlertsCount > 0;
  const temp = zone.latestSensorSummary?.temperature;
  const soilMoist = zone.latestSensorSummary?.soilMoisture;

  return (
    <div className="p-1 min-w-[220px] text-xs leading-relaxed text-foreground">
      {/* Header */}
      <div className="border-b pb-2 mb-2">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
          <MapPin className="size-4 text-emerald-600 shrink-0" />
          {zone.name}
        </h4>
        <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          zone.status === "ACTIVE"
            ? "bg-emerald-100 text-emerald-700"
            : zone.status === "MAINTENANCE"
            ? "bg-amber-100 text-amber-700"
            : "bg-zinc-100 text-zinc-700"
        }`}>
          {statusLabels[zone.status]}
        </span>
      </div>

      {/* Overview stats */}
      <div className="space-y-1.5 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Compass className="size-3.5" />
          <span>Diện tích: <strong>{zone.area} ha</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="size-3.5" />
          <span>Đất: <strong>{zone.soilType}</strong></span>
        </div>
      </div>

      {/* Sensor readings summary if exists */}
      {(temp !== undefined || soilMoist !== undefined) && (
        <div className="mt-3 border-t pt-2 grid grid-cols-2 gap-2">
          {temp !== undefined && (
            <div className="flex items-center gap-1">
              <Thermometer className="size-3.5 text-orange-500" />
              <span>{temp}°C</span>
            </div>
          )}
          {soilMoist !== undefined && (
            <div className="flex items-center gap-1">
              <Droplet className="size-3.5 text-blue-500" />
              <span>Đất {soilMoist}%</span>
            </div>
          )}
        </div>
      )}

      {/* Active critical alerts warning */}
      {hasAlerts && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-destructive font-semibold">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>Có {zone.openAlertsCount} cảnh báo!</span>
        </div>
      )}

      {/* Action link */}
      <div className="mt-3.5 pt-2 border-t text-center">
        <Link
          href={`/dashboard/zones/${zone.id}`}
          className="inline-block w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-center text-xs font-semibold text-white transition-all shadow-sm"
        >
          Xem chi tiết vùng
        </Link>
      </div>
    </div>
  );
}
