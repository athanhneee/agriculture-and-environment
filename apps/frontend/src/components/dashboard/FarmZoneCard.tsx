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
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/30 sm:p-5">
      <div>
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="font-bold text-base leading-tight transition group-hover:text-emerald-600 dark:group-hover:text-emerald-400 sm:text-lg">
              <Link href={`/dashboard/zones/${zone.id}`}>
                <span className="absolute inset-0" aria-hidden="true" />
                {zone.name}
              </Link>
            </h3>
            {zone.cropName && (
              <p className="mt-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 sm:mt-1 sm:text-xs">
                {zone.cropName}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:text-xs ${currentStatus.className}`}>
            {currentStatus.label}
          </span>
        </div>

        {zone.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 sm:mt-3 sm:text-sm">
            {zone.description}
          </p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground border-b pb-3 sm:mt-4 sm:gap-3 sm:text-sm sm:pb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Compass className="size-3.5 text-muted-foreground/70 sm:size-4" />
            <span>{zone.area} ha</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Layers className="size-3.5 text-muted-foreground/70 sm:size-4" />
            <span className="truncate">{zone.soilType}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 sm:gap-2">
            <RadioTower className="size-3.5 text-muted-foreground/70 sm:size-4" />
            <span>{zone.sensors?.length || 0} cảm biến</span>
          </div>
        </div>

        {/* Sensor readings summary */}
        <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 sm:text-xs">
            Chỉ số cảm biến mới nhất
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:gap-x-4 sm:gap-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <Thermometer className="size-3.5 text-orange-500 sm:size-4" />
              <span className="font-medium text-foreground">
                {temp !== undefined && temp !== null ? `${temp}°C` : "N/A"}
              </span>
              <span className="text-[10px] text-muted-foreground sm:text-xs">Nhiệt độ</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <Droplets className="size-3.5 text-blue-500 sm:size-4" />
              <span className="font-medium text-foreground">
                {soilMoist !== undefined && soilMoist !== null ? `${soilMoist}%` : "N/A"}
              </span>
              <span className="text-[10px] text-muted-foreground sm:text-xs">Ẩm đất</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <Gauge className="size-3.5 text-sky-500 sm:size-4" />
              <span className="font-medium text-foreground">
                {airHum !== undefined && airHum !== null ? `${airHum}%` : "N/A"}
              </span>
              <span className="text-[10px] text-muted-foreground sm:text-xs">Ẩm khí</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <Sun className="size-3.5 text-yellow-500 sm:size-4" />
              <span className="font-medium text-foreground">
                {light !== undefined && light !== null ? `${light.toLocaleString()} lx` : "N/A"}
              </span>
              <span className="text-[10px] text-muted-foreground sm:text-xs">Ánh sáng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert counter footer */}
      {zone.openAlertsCount !== undefined && zone.openAlertsCount > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-3xl bg-destructive/10 border border-destructive/20 px-3 py-1.5 text-[10px] text-destructive sm:mt-5 sm:py-2 sm:text-xs">
          <AlertTriangle className="size-3.5 shrink-0 sm:size-4" />
          <span className="font-semibold">
            {zone.openAlertsCount} cảnh báo đang mở
          </span>
        </div>
      )}
    </article>
  );
}
