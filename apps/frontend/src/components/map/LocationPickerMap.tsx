"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Leaflet CSS imports are typically handled globally in _app or layout.
// Here we define the custom marker icon style
function createCustomIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
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
  });
}

const MarkerIcon = createCustomIcon("#0d9488"); // teal-600

function MapEventsHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom(), { animate: true, duration: 0.5 });
    },
  });
  return null;
}

// Controller to fly to position when initial coordinates change externally
function MapController({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position[0] !== 0 && position[1] !== 0) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
  const center: [number, number] = latitude && longitude ? [latitude, longitude] : [10.762622, 106.660172];

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border bg-muted shadow-sm">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-10"
        style={{ background: "#e8f4ea" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler onChange={onChange} />
        <MapController position={[latitude, longitude]} />
        {latitude && longitude ? (
          <Marker position={[latitude, longitude]} icon={MarkerIcon} />
        ) : null}
      </MapContainer>
      <div className="absolute bottom-3 left-3 z-[9999] pointer-events-none">
        <div className="rounded-3xl bg-white/95 dark:bg-zinc-900/95 px-3 py-1.5 shadow border text-[10px] font-bold text-teal-700 dark:text-teal-400">
          Click lên bản đồ để chọn tọa độ định vị
        </div>
      </div>
    </div>
  );
}
