import Link from "next/link";
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

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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
  const summaryCards = [
    {
      label: "Vùng trồng",
      value: dashboardZones.length.toString(),
      note: "Đang theo dõi",
      icon: Leaf,
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
    },
    {
      label: "Sensor online",
      value: "24",
      note: "98% uptime",
      icon: Gauge,
      tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
    },
    {
      label: "Nhiệt độ TB",
      value: "27°C",
      note: "Trong ngưỡng",
      icon: ThermometerSun,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
    },
    {
      label: "Cảnh báo",
      value: (
        apiZones.reduce((total, zone) => total + (zone.openAlertsCount ?? 0), 0) ||
        alerts.length
      ).toString(),
      note: "Cần xem trong ngày",
      icon: AlertTriangle,
      tone: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Tổng quan hôm nay
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Nông trại đang vận hành ổn định
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Dashboard dùng mock data để minh họa luồng giám sát vùng trồng,
              cảm biến, cảnh báo và bản đồ trước khi tích hợp API.
            </p>
          </div>
          <Link
            href="/dashboard/zones/north-greenhouse"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Xem vùng trồng
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold">{card.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {card.note}
                  </p>
                </div>
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${card.tone}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
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
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
                      {zone.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {zone.crop} • {zone.area} • {zone.location}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm sm:min-w-72">
                  <span className="rounded-xl bg-muted px-3 py-2">
                    Đất {zone.soilMoisture}%
                  </span>
                  <span className="rounded-xl bg-muted px-3 py-2">
                    {zone.temperature}°C
                  </span>
                  <span className="rounded-xl bg-muted px-3 py-2">
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
