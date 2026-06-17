import Link from "next/link";
import {
  AlertTriangle,
  Compass,
  Droplets,
  Gauge,
  Sun,
  Thermometer,
  Layers,
  RadioTower,
} from "lucide-react";
import { type FarmZone } from "@/lib/api";

interface FarmZoneCardProps {
  zone: FarmZone;
}

export function FarmZoneCard({ zone }: FarmZoneCardProps) {
  const statusConfig = {
    ACTIVE: {
      label: "Đang hoạt động",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    },
    INACTIVE: {
      label: "Ngừng hoạt động",
      className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-300",
    },
    MAINTENANCE: {
      label: "Đang bảo trì",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    },
  };

  const currentStatus = statusConfig[zone.status] || statusConfig.INACTIVE;

  // Lấy các chỉ số cảm biến mới nhất (nếu có)
  const temp = zone.latestSensorSummary?.temperature;
  const airHum = zone.latestSensorSummary?.airHumidity;
  const soilMoist = zone.latestSensorSummary?.soilMoisture;
  const light = zone.latestSensorSummary?.lightIntensity;

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/30">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg leading-tight transition group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              <Link href={`/dashboard/zones/${zone.id}`}>
                <span className="absolute inset-0" aria-hidden="true" />
                {zone.name}
              </Link>
            </h3>
            {zone.cropName && (
              <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Cây trồng: {zone.cropName}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentStatus.className}`}>
            {currentStatus.label}
          </span>
        </div>

        {zone.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {zone.description}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground border-b pb-4">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-muted-foreground/70" />
            <span>{zone.area} ha</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-muted-foreground/70" />
            <span className="truncate">{zone.soilType}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <RadioTower className="size-4 text-muted-foreground/70" />
            <span>{zone.sensors?.length || 0} thiết bị cảm biến</span>
          </div>
        </div>

        {/* Sensor readings summary */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Chỉ số cảm biến mới nhất
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="size-4 text-orange-500" />
              <span className="font-medium text-foreground">
                {temp !== undefined ? `${temp}°C` : "N/A"}
              </span>
              <span className="text-xs text-muted-foreground">Nhiệt độ</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="size-4 text-blue-500" />
              <span className="font-medium text-foreground">
                {soilMoist !== undefined ? `${soilMoist}%` : "N/A"}
              </span>
              <span className="text-xs text-muted-foreground">Ẩm đất</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Gauge className="size-4 text-sky-500" />
              <span className="font-medium text-foreground">
                {airHum !== undefined ? `${airHum}%` : "N/A"}
              </span>
              <span className="text-xs text-muted-foreground">Ẩm khí</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sun className="size-4 text-yellow-500" />
              <span className="font-medium text-foreground">
                {light !== undefined ? `${light.toLocaleString()} lx` : "N/A"}
              </span>
              <span className="text-xs text-muted-foreground">Ánh sáng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert counter footer */}
      {zone.openAlertsCount !== undefined && zone.openAlertsCount > 0 && (
        <div className="mt-5 flex items-center gap-2 rounded-3xl bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span className="font-semibold">
            Có {zone.openAlertsCount} cảnh báo đang mở ở vùng này
          </span>
        </div>
      )}
    </article>
  );
}
