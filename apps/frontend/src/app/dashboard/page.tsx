import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  Thermometer,
  Wind,
} from "lucide-react";

import { alerts, cropZones, sensorReadings } from "@/lib/farm-data";

export default function DashboardPage() {
  const cards = [
    {
      label: "Vùng trồng",
      value: cropZones.length.toString(),
      note: "Đang theo dõi",
      icon: Leaf,
      color: "text-emerald-700 bg-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-200",
    },
    {
      label: "Cảm biến online",
      value: "24",
      note: "98% uptime",
      icon: Gauge,
      color: "text-sky-700 bg-sky-100 dark:bg-sky-400/15 dark:text-sky-200",
    },
    {
      label: "Nhiệt độ TB",
      value: "27°C",
      note: "Trong ngưỡng",
      icon: Thermometer,
      color: "text-amber-700 bg-amber-100 dark:bg-amber-400/15 dark:text-amber-200",
    },
    {
      label: "Cảnh báo",
      value: alerts.length.toString(),
      note: "Cần xem trong ngày",
      icon: AlertTriangle,
      color: "text-rose-700 bg-rose-100 dark:bg-rose-400/15 dark:text-rose-200",
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
              Tình trạng nông trại đang ổn định
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Dashboard demo hiển thị số liệu tĩnh để minh họa luồng giám sát
              Smart Farm trước khi kết nối API backend.
            </p>
          </div>
          <Link
            href="/dashboard/fields/north-greenhouse"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Xem vùng trồng
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
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
                  className={`flex size-11 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Vùng trồng nổi bật</h2>
              <p className="text-sm text-muted-foreground">
                Theo dõi nhanh độ ẩm đất, nhiệt độ và trạng thái.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {cropZones.map((zone) => (
              <Link
                key={zone.id}
                href={`/dashboard/fields/${zone.id}`}
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
                    {zone.crop} • {zone.area}
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
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Cảm biến real-time</h2>
            <div className="mt-4 grid gap-3">
              {sensorReadings.map((reading) => (
                <div
                  key={reading.label}
                  className="rounded-2xl border bg-background p-4"
                >
                  <p className="text-sm text-muted-foreground">{reading.label}</p>
                  <p className="mt-1 text-2xl font-bold">{reading.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {reading.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Điều kiện môi trường</h2>
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
