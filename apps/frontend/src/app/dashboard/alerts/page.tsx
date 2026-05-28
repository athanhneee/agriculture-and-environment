import { AlertTriangle, Bell, BellRing, CheckCircle2, Clock } from "lucide-react";
import { getOpenAlerts } from "@/lib/dashboard-server";

export const revalidate = 15;

const severityConfig: Record<
  string,
  { label: string; badgeClass: string; iconClass: string; cardClass: string }
> = {
  INFO: {
    label: "Thông tin",
    badgeClass:
      "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    cardClass: "",
  },
  WARNING: {
    label: "Cảnh báo",
    badgeClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    cardClass: "",
  },
  CRITICAL: {
    label: "Nghiêm trọng",
    badgeClass:
      "border-destructive/30 bg-destructive/10 text-destructive",
    iconClass: "bg-destructive/10 text-destructive",
    cardClass: "border-destructive/20 bg-destructive/5",
  },
};

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  OPEN: {
    label: "Đang mở",
    icon: Clock,
    className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  ACKNOWLEDGED: {
    label: "Đã xác nhận",
    icon: CheckCircle2,
    className: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  RESOLVED: {
    label: "Đã xử lý",
    icon: CheckCircle2,
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
};

export default async function AlertsPage() {
  const alerts = await getOpenAlerts();

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const warningCount = alerts.filter((a) => a.severity === "WARNING").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-destructive uppercase tracking-widest">
              Cảnh báo
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight">
              Cảnh báo môi trường &amp; sâu bệnh
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi và xử lý các cảnh báo được tạo tự động từ hệ thống cảm biến IoT.
            </p>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2 text-sm font-bold text-destructive">
              <BellRing className="size-4" />
              {alerts.length} cảnh báo
            </div>
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
                {criticalCount} nghiêm trọng
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <span className="size-1.5 rounded-full bg-amber-500" />
                {warningCount} cảnh báo
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert list or empty state */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Bell className="size-7 text-muted-foreground/50" />
          </div>
          <h2 className="mt-4 text-lg font-bold">Không có cảnh báo đang mở</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Khi cảm biến vượt ngưỡng cho phép, hệ thống sẽ tự động tạo cảnh báo và hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {alerts.map((alert) => {
            const sev = severityConfig[alert.severity] ?? severityConfig.INFO;
            const sta = statusConfig[alert.status] ?? statusConfig.OPEN;
            const StatusIcon = sta.icon;

            return (
              <article
                key={alert.id}
                className={`rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md ${sev.cardClass}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Icon + content */}
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${sev.iconClass}`}
                    >
                      <AlertTriangle className="size-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-foreground leading-snug">
                        {alert.title}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          {alert.farmZone?.name ?? "Không rõ vùng trồng"}
                        </span>
                        {" · "}
                        {new Date(alert.createdAt).toLocaleString("vi-VN")}
                      </p>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sev.badgeClass}`}
                    >
                      {sev.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sta.className}`}
                    >
                      <StatusIcon className="size-3" />
                      {sta.label}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
