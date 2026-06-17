"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { type FarmZone } from "@/lib/api";
import { ZoneMarkerPopup } from "./ZoneMarkerPopup";

// ── Tọa độ fallback cho 3 vùng miền Việt Nam ──────────────────────────────────
const REGION_FALLBACK: Record<string, [number, number]> = {
  "miền bắc": [21.0278, 105.8342],  // Hà Nội
  "mien bac": [21.0278, 105.8342],
  "north": [21.0278, 105.8342],
  "miền trung": [16.4637, 107.5909],  // Huế
  "mien trung": [16.4637, 107.5909],
  "central": [16.4637, 107.5909],
  "miền nam": [10.7769, 106.7009],  // TP.HCM
  "mien nam": [10.7769, 106.7009],
  "south": [10.7769, 106.7009],
};

const VIETNAM_CENTER: [number, number] = [16.0, 108.0];

function getZoneCoords(zone: FarmZone): [number, number] | null {
  // Nếu có tọa độ hợp lệ từ DB
  if (zone.latitude && zone.longitude &&
    zone.latitude !== 0 && zone.longitude !== 0) {
    return [zone.latitude, zone.longitude];
  }
  // Fallback theo tên vùng
  const nameLower = zone.name.toLowerCase();
  for (const [key, coords] of Object.entries(REGION_FALLBACK)) {
    if (nameLower.includes(key)) return coords;
  }
  return null;
}

// ── Custom HTML Marker Icons ────────────────────────────────────────────────────
function createCustomIcon(color: string, pulse = false) {
  const pulseAnim = pulse
    ? `<span style="position:absolute;inset:0;border-radius:50%;animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;background:${color};opacity:0.4;"></span>
       <style>@keyframes ping{75%,100%{transform:scale(2.2);opacity:0}}</style>`
    : "";
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
        ${pulseAnim}
        <div style="
          position:relative;
          width:32px;height:32px;
          background:${color};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position:absolute;
          width:12px;height:12px;
          background:white;
          border-radius:50%;
          top:50%;left:50%;
          transform:translate(-50%,-58%);
        "></div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
}

const IconDefault = createCustomIcon("#16a34a");          // emerald-600
const IconCritical = createCustomIcon("#dc2626", true);    // red-600 + pulse
const IconInactive = createCustomIcon("#71717a");          // zinc-500

// ── Camera Controller ─────────────────────────────────────────────────────────
function MapController({ selectedZone }: { selectedZone: FarmZone | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedZone) return;
    const coords = getZoneCoords(selectedZone);
    if (coords) {
      map.setView(coords, 14, { animate: true, duration: 1.2 });
    }
  }, [selectedZone, map]);
  return null;
}

interface FarmMapProps {
  zones: FarmZone[];
  selectedZone: FarmZone | null;
  onSelectZone: (zone: FarmZone) => void;
}

export default function FarmMap({ zones, selectedZone, onSelectZone }: FarmMapProps) {
  // Tính center: ưu tiên zone đầu tiên có coords, fallback Vietnam
  const zonesWithCoords = zones.map(z => ({ zone: z, coords: getZoneCoords(z) }))
    .filter(x => x.coords !== null) as { zone: FarmZone; coords: [number, number] }[];

  // Tránh chồng khít các marker có tọa độ giống hệt nhau (Jittering)
  const coordsCount: Record<string, number> = {};
  const adjustedZones = zonesWithCoords.map(({ zone, coords }) => {
    const key = `${coords[0].toFixed(5)},${coords[1].toFixed(5)}`;
    const count = coordsCount[key] ?? 0;
    coordsCount[key] = count + 1;

    if (count > 0) {
      // Thêm một độ lệch nhỏ (jitter) dựa trên số lượng trùng lặp
      const angle = (count * 2 * Math.PI) / 8; // Phân bổ vòng tròn
      const radius = 0.00025 * Math.ceil(count / 8); // Khoảng cách tăng dần (~25m)
      const offsetLat = Math.cos(angle) * radius;
      const offsetLng = Math.sin(angle) * radius;
      return {
        zone,
        coords: [coords[0] + offsetLat, coords[1] + offsetLng] as [number, number],
      };
    }

    return { zone, coords };
  });

  const defaultCenter: [number, number] = zonesWithCoords.length > 0
    ? zonesWithCoords[0].coords
    : VIETNAM_CENTER;

  const defaultZoom = zonesWithCoords.length >= 2 ? 6 : zonesWithCoords.length === 1 ? 13 : 6;

  return (
    <div className="relative h-[540px] w-full overflow-hidden rounded-2xl border bg-muted shadow-md">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="h-full w-full z-10"
        style={{ background: "#e8f4ea" }}
      >
        {/* Tile OpenStreetMap tiêu chuẩn */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Camera controller */}
        <MapController selectedZone={selectedZone} />

        {/* Markers */}
        {adjustedZones.map(({ zone, coords }) => {
          const hasCritical = (zone.openAlertsCount ?? 0) > 0;
          const isInactive = zone.status !== "ACTIVE";
          const icon = hasCritical ? IconCritical : isInactive ? IconInactive : IconDefault;

          return (
            <Marker
              key={zone.id}
              position={coords}
              icon={icon}
              eventHandlers={{ click: () => onSelectZone(zone) }}
            >
              {/* Vòng tròn vùng ảnh hưởng (optional, bán kính tương đối theo diện tích) */}
              <Circle
                center={coords}
                radius={Math.sqrt(zone.area ?? 1) * 150}
                pathOptions={{
                  color: hasCritical ? "#dc2626" : "#16a34a",
                  fillColor: hasCritical ? "#dc2626" : "#16a34a",
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: "6 4",
                }}
              />
              <Popup className="leaflet-popup-custom" minWidth={240}>
                <ZoneMarkerPopup zone={zone} fallbackCoords={coords} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Overlay: Badge số vùng trồng */}
      <div className="absolute bottom-4 left-4 z-[9999] pointer-events-none">
        <div className="flex items-center gap-1.5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur border px-3 py-1.5 shadow-md text-xs font-semibold text-foreground">
          <span className="size-2 rounded-full bg-emerald-500 inline-block"></span>
          {zonesWithCoords.length} vùng trồng trên bản đồ
        </div>
      </div>
    </div>
  );
}
