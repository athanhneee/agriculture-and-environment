import { notFound } from "next/navigation";
import { Activity, Droplets, Leaf, SunMedium, ThermometerSun } from "lucide-react";

import { cropZones } from "@/lib/farm-data";

export function generateStaticParams() {
  return cropZones.map((zone) => ({
    zoneId: zone.id,
  }));
}

export default async function ZoneDetailPage({
  params,
}: {
  params: Promise<{ zoneId: string }>;
}) {
  const { zoneId } = await params;
  const zone = cropZones.find((item) => item.id === zoneId);

  if (!zone) {
    notFound();
  }

  const metrics = [
    { label: "Độ ẩm đất", value: `${zone.soilMoisture}%`, icon: Droplets },
    { label: "Nhiệt độ", value: `${zone.temperature}°C`, icon: ThermometerSun },
    { label: "Độ ẩm không khí", value: `${zone.humidity}%`, icon: Activity },
    { label: "Ánh sáng", value: `${zone.light} lux`, icon: SunMedium },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Chi tiết vùng trồng
            </p>
            <h2 className="mt-2 text-2xl font-bold">{zone.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {zone.crop} • {zone.area} • {zone.location}
            </p>
          </div>
          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
            {zone.status}
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <Icon className="size-6 text-emerald-700 dark:text-emerald-300" />
              <p className="mt-4 text-sm text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-1 text-3xl font-bold">{metric.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Lịch chăm sóc</h3>
          <div className="mt-4 space-y-3">
            {[
              "Tưới tự động lúc 06:30",
              "Kiểm tra pH đất lúc 14:00",
              "Ghi nhận hình ảnh cây trồng lúc 17:30",
            ].map((task) => (
              <div
                key={task}
                className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm"
              >
                <Leaf className="size-4 text-emerald-700 dark:text-emerald-300" />
                {task}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Độ ẩm đất trong ngày</h3>
          <div className="mt-5 flex h-64 items-end gap-3 rounded-2xl bg-muted p-4">
            {[42, 56, 49, 68, 61, 74, 69, 78].map((value, index) => (
              <div
                key={`${value}-${index}`}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-xl bg-emerald-600"
                  style={{ height: `${value}%` }}
                />
                <span className="text-[11px] text-muted-foreground">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
