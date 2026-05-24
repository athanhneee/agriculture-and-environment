"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { type FarmZone } from "@/lib/api";
import { ZoneMarkerPopup } from "./ZoneMarkerPopup";

// Import CSS Leaflet bắt buộc
import "leaflet/dist/leaflet.css";

// Override marker icon mặc định của Leaflet để tránh lỗi hiển thị ảnh sau khi đóng gói Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom Icon màu đỏ nổi bật dành riêng cho Vùng đang có Cảnh báo nguy cấp (CRITICAL)
const CriticalIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface FarmMapProps {
  zones: FarmZone[];
  selectedZone: FarmZone | null;
  onSelectZone: (zone: FarmZone) => void;
}

// Sub-component điều khiển camera di chuyển tới vùng trồng được chọn
function MapController({ selectedZone }: { selectedZone: FarmZone | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedZone) {
      map.setView([selectedZone.latitude, selectedZone.longitude], 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [selectedZone, map]);

  return null;
}

export default function FarmMap({ zones, selectedZone, onSelectZone }: FarmMapProps) {
  // Điểm trung tâm mặc định (Ví dụ Ho Chi Minh city hoặc trung bình tọa độ các vùng)
  const defaultCenter: [number, number] =
    zones.length > 0 ? [zones[0].latitude, zones[0].longitude] : [10.762622, 106.660172];

  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border bg-muted shadow-inner">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Camera map controller */}
        <MapController selectedZone={selectedZone} />

        {/* Render marker cho từng vùng trồng */}
        {zones.map((zone) => {
          const hasCriticalAlerts =
            zone.openAlertsCount !== undefined && zone.openAlertsCount > 0; // Backend Alert logic
          
          return (
            <Marker
              key={zone.id}
              position={[zone.latitude, zone.longitude]}
              icon={hasCriticalAlerts ? CriticalIcon : DefaultIcon}
              eventHandlers={{
                click: () => onSelectZone(zone),
              }}
            >
              <Popup className="leaflet-popup-custom">
                <ZoneMarkerPopup zone={zone} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
