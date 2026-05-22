import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Compass,
  Cpu,
  Droplets,
  Edit,
  Layers,
  MapPin,
  Sprout,
  Sun,
  Thermometer,
  Trash2,
} from "lucide-react";

import { getFarmZoneById } from "@/lib/farm-zones-server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const zone = await getFarmZoneById(id);
  
  return {
    title: zone ? `${zone.name} | Smart Farm Monitoring System` : "Chi tiết Vùng Trồng",
    description: zone?.description || "Chi tiết chỉ số đo lường cảm biến và cây trồng nông nghiệp.",
  };
}

export default async function ZoneDetailPage({ params }: PageProps) {
  const { id } = await params;
  const zone = await getFarmZoneById(id);

  if (!zone) {
    notFound();
  }

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

  // Lấy chỉ số mới nhất
  const temp = zone.latestSensorSummary?.temperature;
  const airHum = zone.latestSensorSummary?.airHumidity;
  const soilMoist = zone.latestSensorSummary?.soilMoisture;
  const light = zone.latestSensorSummary?.lightIntensity;

  const metrics = [
    { label: "Nhiệt độ không khí", value: temp !== undefined ? `${temp}°C` : "N/A", icon: Thermometer, color: "text-orange-500 bg-orange-500/10" },
    { label: "Độ ẩm đất", value: soilMoist !== undefined ? `${soilMoist}%` : "N/A", icon: Droplets, color: "text-blue-500 bg-blue-500/10" },
    { label: "Độ ẩm không khí", value: airHum !== undefined ? `${airHum}%` : "N/A", icon: Activity, color: "text-sky-500 bg-sky-500/10" },
    { label: "Cường độ ánh sáng", value: light !== undefined ? `${light.toLocaleString()} lx` : "N/A", icon: Sun, color: "text-yellow-500 bg-yellow-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header breadcrumb & actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/zones"
            className="flex size-9 items-center justify-center rounded-xl border bg-card hover:bg-muted transition"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Chi tiết vùng trồng
            </span>
            <h1 className="text-2xl font-bold tracking-tight">{zone.name}</h1>
          </div>
        </div>

        {/* Edit/Delete actions (Demo permission) */}
        <div className="flex items-center gap-2">
          <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border bg-card hover:bg-muted px-4 text-xs font-semibold transition">
            <Edit className="size-3.5" />
            Sửa vùng
          </button>
          <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive px-4 text-xs font-semibold transition">
            <Trash2 className="size-3.5" />
            Xóa vùng
          </button>
        </div>
      </div>

      {/* Main Stats Summary */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Info card */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="font-bold text-lg">Thông tin tổng quan</h2>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentStatus.className}`}>
              {currentStatus.label}
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Compass className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Diện tích</p>
                <p className="font-semibold text-sm mt-0.5">{zone.area} Hécta (ha)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Layers className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Loại đất</p>
                <p className="font-semibold text-sm mt-0.5">{zone.soilType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:col-span-2">
              <MapPin className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Tọa độ GPS</p>
                <p className="font-semibold text-sm mt-0.5">
                  Vĩ độ: {zone.latitude} • Kinh độ: {zone.longitude}
                </p>
              </div>
            </div>
          </div>

          {zone.description && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-muted-foreground">Mô tả chi tiết</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground/90">
                {zone.description}
              </p>
            </div>
          )}
        </div>

        {/* Alerts box */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-bold text-lg border-b pb-4">Cảnh báo đang hoạt động</h2>
          <div className="mt-4 space-y-3 max-h-[170px] overflow-y-auto pr-1">
            {zone.alerts && zone.alerts.length > 0 ? (
              zone.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex gap-3 rounded-xl border p-3 text-xs ${
                    alert.severity === "CRITICAL"
                      ? "border-destructive/20 bg-destructive/5 text-destructive"
                      : "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="mt-1 text-[10px] opacity-75">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleString("vi-VN") : "Gần đây"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <Calendar className="size-8 text-muted-foreground/50" />
                <p className="mt-2 text-xs">Không có cảnh báo hoạt động.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sensor summary metrics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="rounded-2xl border bg-card p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{metric.value}</p>
              </div>
              <div className={`flex size-11 items-center justify-center rounded-xl ${metric.color}`}>
                <Icon className="size-5" />
              </div>
            </article>
          );
        })}
      </section>

      {/* Sensors & Crops lists */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Device Sensors list */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-bold text-lg border-b pb-4 flex items-center gap-2">
            <Cpu className="size-5 text-emerald-600" />
            Thiết bị cảm biến liên kết ({zone.sensors?.length || 0})
          </h2>
          <div className="mt-4 divide-y">
            {zone.sensors && zone.sensors.length > 0 ? (
              zone.sensors.map((sensor) => (
                <div key={sensor.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-sm">{sensor.name}</p>
                    <p className="text-xs text-muted-foreground uppercase mt-0.5">
                      Loại: {sensor.type} {sensor.unit ? `(${sensor.unit})` : ""}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    sensor.status === "ONLINE"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                      : "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300"
                  }`}>
                    {sensor.status === "ONLINE" ? "Online" : "Offline"}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-muted-foreground text-center">
                Chưa kết nối thiết bị cảm biến nào.
              </p>
            )}
          </div>
        </div>

        {/* Crops list */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-bold text-lg border-b pb-4 flex items-center gap-2">
            <Sprout className="size-5 text-emerald-600" />
            Cây trồng canh tác ({zone.crops?.length || 0})
          </h2>
          <div className="mt-4 divide-y">
            {zone.crops && zone.crops.length > 0 ? (
              zone.crops.map((crop) => (
                <div key={crop.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-sm">{crop.name}</p>
                    {crop.variety && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Giống: {crop.variety}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                    {crop.status || "Đang trồng"}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-muted-foreground text-center">
                Chưa ghi nhận thông tin loại cây trồng.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
