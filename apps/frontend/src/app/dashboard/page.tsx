import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  ThermometerSun,
  Wind,
} from "lucide-react";

import { RealtimeDashboardPanel } from "@/components/dashboard/RealtimeDashboardPanel";
import { alerts, cropZones } from "@/lib/farm-data";
import { getFarmZones } from "@/lib/farm-zones-server";

export const metadata: Metadata = {
  title: "Tổng quan",
  description:
    "Bảng điều khiển tổng quan hệ thống giám sát nông nghiệp — số liệu thời gian thực, cảnh báo và trạng thái các vùng trồng.",
};

export const revalidate = 30;

function getRoleFromToken(token?: string) {
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadStr = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    return payload.role;
  } catch (e) {
    return null;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const role = getRoleFromToken(token);
  
  if (role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  const apiZones = await getFarmZones();
  const dashboardZones =
    apiZones.length > 0
      ? apiZones.map((zone) => ({
          id: zone.id,
          name: zone.name,
          crop: zone.cropName ?? "Chưa gán cây trồng",
          area: `${zone.area} ha`,
          status: zone.status,
          location: `${zone.latitude}, ${zone.longitude}`,
          soilMoisture: zone.latestSensorSummary?.soilMoisture ?? 0,
          temperature: zone.latestSensorSummary?.temperature ?? 0,
          light: zone.latestSensorSummary?.lightIntensity ?? 0,
        }))
      : cropZones;

  const totalSensors = apiZones.reduce(
    (sum, zone) => sum + (zone.sensors?.length ?? 0),
    0,
  );

  const temperatureValues = apiZones
    .map((zone) => zone.latestSensorSummary?.temperature)
    .filter((value): value is number => typeof value === "number");

  const averageTemperature =
    temperatureValues.length > 0
      ? Math.round(
          temperatureValues.reduce((sum, value) => sum + value, 0) /
            temperatureValues.length,
        )
      : 0;

  const openAlertsCount =
    apiZones.reduce((total, zone) => total + (zone.openAlertsCount ?? 0), 0) ||
    alerts.length;

  const summaryCards = [
    {
      label: "Vùng trồng",
      value: dashboardZones.length.toString(),
      note: "Đang theo dõi",
      icon: Leaf,
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
      dotColor: "bg-emerald-500",
      href: "/dashboard/zones",
    },
    {
      label: "Cảm biến online",
      value: `${totalSensors}`,
      note: "98% uptime",
      icon: Gauge,
      tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
      dotColor: "bg-sky-500",
      href: "/dashboard/sensors",
    },
    {
      label: "Nhiệt độ TB",
      value: `${averageTemperature}°C`,
      note: "Trong ngưỡng cho phép",
      icon: ThermometerSun,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
      dotColor: "bg-amber-500",
      href: null,
    },
    {
      label: "Cảnh báo",
      value: openAlertsCount.toString(),
      note: openAlertsCount > 0 ? "Cần xử lý ngay" : "Không có cảnh báo",
      icon: AlertTriangle,
      tone:
        openAlertsCount > 0
          ? "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
      dotColor: openAlertsCount > 0 ? "bg-rose-500" : "bg-emerald-500",
      href: "/dashboard/alerts",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              {/* Live indicator */}
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Hệ thống đang hoạt động
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Tổng quan nông trại
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Dữ liệu cập nhật theo thời gian thực từ các cảm biến IoT.
            </p>
          </div>
          <Link
            href={apiZones[0]?.id ? `/dashboard/zones/${apiZones[0].id}` : "/dashboard/zones"}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Xem vùng trồng
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const cardContent = (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-full ${card.dotColor}`} />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                </div>
                <p className="mt-2.5 text-3xl font-bold tracking-tight">{card.value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {card.note}
                </p>
              </div>
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </div>
          );

          return card.href ? (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-2xl border bg-card p-5 shadow-sm block transition hover:border-emerald-300/60 hover:shadow-md hover:-translate-y-0.5 dark:hover:border-emerald-500/30"
            >
              {cardContent}
            </Link>
          ) : (
            <article
              key={card.label}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              {cardContent}
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Vùng trồng nổi bật</h2>
            <p className="text-sm text-muted-foreground">
              Theo dõi nhanh độ ẩm đất, nhiệt độ và trạng thái chăm sóc.
            </p>
          </div>
          <div className="space-y-3">
            {dashboardZones.map((zone) => (
              <Link
                key={zone.id}
                href={`/dashboard/zones/${zone.id}`}
                className="grid gap-3 rounded-2xl border bg-background p-4 transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:hover:bg-emerald-400/10 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{zone.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        zone.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200"
                          : zone.status === "INACTIVE"
                          ? "bg-slate-100 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200"
                      }`}
                    >
                      {zone.status === "ACTIVE"
                        ? "Hoạt động"
                        : zone.status === "INACTIVE"
                        ? "Không hoạt động"
                        : zone.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {zone.crop} · {zone.area} · {zone.location}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs sm:min-w-64">
                  <span className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-sky-50 px-2 py-2 font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                    <span className="text-[10px] font-medium text-muted-foreground">Độ ẩm đất</span>
                    {zone.soilMoisture}%
                  </span>
                  <span className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-amber-50 px-2 py-2 font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <span className="text-[10px] font-medium text-muted-foreground">Nhiệt độ</span>
                    {zone.temperature}°C
                  </span>
                  <span className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-lime-50 px-2 py-2 font-semibold text-lime-700 dark:bg-lime-950/40 dark:text-lime-300">
                    <span className="text-[10px] font-medium text-muted-foreground">Ánh sáng</span>
                    {zone.light} lux
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <RealtimeDashboardPanel zones={apiZones} />

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Môi trường</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Mưa", value: "Không", icon: CloudSun },
                { label: "Gió", value: "6 km/h", icon: Wind },
                { label: "Tưới", value: "Tự động", icon: Droplets },
                { label: "pH", value: "6.4", icon: Gauge },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="rounded-2xl bg-muted p-4">
                    <Icon className="size-5 text-emerald-700 dark:text-emerald-300" />
                    <p className="mt-3 text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="font-semibold">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
