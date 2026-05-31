import Link from "next/link";
import { AlertTriangle, Compass, Droplet, Layers, MapPin, Thermometer, RadioTower } from "lucide-react";
import { type FarmZone } from "@/lib/api";

interface ZoneMarkerPopupProps {
  zone: FarmZone;
  fallbackCoords?: [number, number];
}

export function ZoneMarkerPopup({ zone, fallbackCoords }: ZoneMarkerPopupProps) {
  const statusConfig = {
    ACTIVE:      { label: "Đang hoạt động", cls: "bg-emerald-100 text-emerald-700" },
    INACTIVE:    { label: "Ngừng hoạt động", cls: "bg-zinc-100 text-zinc-600" },
    MAINTENANCE: { label: "Đang bảo trì",    cls: "bg-amber-100 text-amber-700" },
  };

  const status = statusConfig[zone.status as keyof typeof statusConfig] ?? statusConfig.INACTIVE;
  const hasAlerts = (zone.openAlertsCount ?? 0) > 0;
  const temp      = zone.latestSensorSummary?.temperature;
  const soilMoist = zone.latestSensorSummary?.soilMoisture;
  const lat = zone.latitude || fallbackCoords?.[0];
  const lng = zone.longitude || fallbackCoords?.[1];

  return (
    <div style={{ minWidth: 240, fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <MapPin size={14} color="#16a34a" />
          <strong style={{ fontSize: 14, color: "#111827" }}>{zone.name}</strong>
        </div>
        <span style={{
          display: "inline-block",
          borderRadius: 999,
          padding: "2px 8px",
          fontSize: 10,
          fontWeight: 700,
          background: zone.status === "ACTIVE" ? "#dcfce7" : zone.status === "MAINTENANCE" ? "#fef3c7" : "#f4f4f5",
          color: zone.status === "ACTIVE" ? "#15803d" : zone.status === "MAINTENANCE" ? "#92400e" : "#52525b",
        }}>
          {status.label}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280" }}>
          <Compass size={13} />
          <span><strong>{zone.area} ha</strong></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280" }}>
          <Layers size={13} />
          <span>{zone.soilType}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RadioTower className="size-3.5" />
          <span>Cảm biến: <strong>{zone.sensors?.length || 0}</strong></span>
        </div>
      </div>

      {/* Sensor readings */}
      {(temp !== undefined || soilMoist !== undefined) && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          padding: "8px",
          background: "#f0fdf4",
          borderRadius: 8,
          marginBottom: 10,
        }}>
          {temp !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#374151" }}>
              <Thermometer size={13} color="#f97316" />
              <span><strong>{temp}°C</strong></span>
            </div>
          )}
          {soilMoist !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#374151" }}>
              <Droplet size={13} color="#3b82f6" />
              <span><strong>{soilMoist}%</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Alert warning */}
      {hasAlerts && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 10px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 8,
          marginBottom: 10,
          color: "#dc2626",
          fontSize: 12,
          fontWeight: 600,
        }}>
          <AlertTriangle size={13} />
          <span>⚠ {zone.openAlertsCount} cảnh báo đang mở</span>
        </div>
      )}

      {/* CTA Button */}
      <Link
        href={`/dashboard/zones/${zone.id}`}
        style={{
          display: "block",
          width: "100%",
          padding: "8px 0",
          textAlign: "center",
          borderRadius: 8,
          background: "#16a34a",
          color: "white",
          fontSize: 12,
          fontWeight: 700,
          textDecoration: "none",
          boxSizing: "border-box",
        }}
      >
        Xem chi tiết vùng →
      </Link>
    </div>
  );
}
