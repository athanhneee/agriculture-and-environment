import { AlertTriangle, BellRing } from "lucide-react";

import { alerts } from "@/lib/farm-data";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Cảnh báo
        </p>
        <h2 className="mt-2 text-2xl font-bold">Theo dõi ngưỡng bất thường</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Các cảnh báo mẫu giúp nhóm thiết kế luồng ưu tiên xử lý trong
          dashboard.
        </p>
      </section>

      <section className="grid gap-4">
        {alerts.map((alert) => (
          <article
            key={`${alert.title}-${alert.zone}`}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">
                  <AlertTriangle className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {alert.zone} • {alert.time}
                  </p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                Mức {alert.level}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <BellRing className="size-5 text-emerald-700 dark:text-emerald-300" />
          <h3 className="text-lg font-semibold">Quy tắc cảnh báo</h3>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Có thể mở rộng để cấu hình ngưỡng theo từng loại cây, vùng trồng và
          thiết bị cảm biến sau khi kết nối backend.
        </p>
      </section>
    </div>
  );
}
