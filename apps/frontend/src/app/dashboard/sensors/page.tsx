import { Activity, Radio } from "lucide-react";

import { sensorReadings } from "@/lib/farm-data";

export default function SensorsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Cảm biến
        </p>
        <h2 className="mt-2 text-2xl font-bold">Realtime sensor monitoring</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Danh sách cảm biến demo, chuẩn bị cho dữ liệu socket hoặc polling API.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sensorReadings.map((reading) => (
          <article
            key={reading.label}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <Radio className="size-6 text-emerald-700 dark:text-emerald-300" />
            <p className="mt-4 text-sm text-muted-foreground">{reading.label}</p>
            <p className="mt-1 text-3xl font-bold">{reading.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{reading.note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="text-lg font-semibold">Luồng dữ liệu gần đây</h3>
        <div className="mt-4 space-y-3">
          {["Sensor SM-01 gửi độ ẩm đất", "Sensor TMP-04 cập nhật nhiệt độ", "Gateway khu B đồng bộ thành công"].map(
            (event) => (
              <div
                key={event}
                className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm"
              >
                <Activity className="size-4 text-emerald-700 dark:text-emerald-300" />
                {event}
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
