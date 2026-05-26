import { AlertTriangle, BellRing } from "lucide-react";
import { getOpenAlerts } from "@/lib/dashboard-server";

export const dynamic = "force-dynamic";

const severityClass: Record<string, string> = {
  LOW: "border-sky-200 bg-sky-50 text-sky-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
};

const statusText: Record<string, string> = {
  OPEN: "Đang mở",
  ACKNOWLEDGED: "Đã xác nhận",
  RESOLVED: "Đã xử lý",
};

export default async function AlertsPage() {
  const alerts = await getOpenAlerts();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Cảnh báo
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Cảnh báo môi trường & sâu bệnh
            </h1>
           
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            <BellRing className="h-5 w-5" />
            {alerts.length} cảnh báo
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-lg font-bold text-slate-800">
            Chưa có cảnh báo đang mở
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Khi cảm biến vượt ngưỡng, hệ thống sẽ tự động tạo cảnh báo tại đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="rounded-3xl border border-white/70 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      {alert.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {alert.farmZone?.name ?? "Không rõ vùng trồng"} ·{" "}
                      {new Date(alert.createdAt).toLocaleString("vi-VN")}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      severityClass[alert.severity] ??
                      "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                    {statusText[alert.status] ?? alert.status}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
