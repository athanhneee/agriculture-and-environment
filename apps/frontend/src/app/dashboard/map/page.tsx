import { MapPin } from "lucide-react";

import { cropZones } from "@/lib/farm-data";

export default function FarmMapPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Bản đồ
        </p>
        <h2 className="mt-2 text-2xl font-bold">Sơ đồ nông trại</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Bản đồ demo bằng Tailwind, có thể thay bằng Leaflet hoặc Mapbox ở giai
          đoạn tích hợp bản đồ thật.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="farm-grid relative min-h-[28rem] overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,#dcfce7_0%,#bbf7d0_45%,#dbeafe_100%)] p-5 text-emerald-950/20 shadow-sm dark:bg-[linear-gradient(135deg,#143326_0%,#174333_48%,#17304a_100%)] dark:text-emerald-50/15">
          {cropZones.map((zone, index) => (
            <div
              key={zone.id}
              className="absolute rounded-2xl border border-white/70 bg-white/85 p-4 text-foreground shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/10"
              style={{
                left: `${14 + index * 24}%`,
                top: `${18 + (index % 2) * 38}%`,
              }}
            >
              <MapPin className="mb-2 size-5 text-emerald-700 dark:text-emerald-300" />
              <p className="text-sm font-semibold">{zone.name}</p>
              <p className="text-xs text-muted-foreground">{zone.area}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Vị trí vùng trồng</h3>
          <div className="mt-4 space-y-3">
            {cropZones.map((zone) => (
              <div key={zone.id} className="rounded-xl bg-muted p-4">
                <p className="font-semibold">{zone.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {zone.crop} • {zone.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
