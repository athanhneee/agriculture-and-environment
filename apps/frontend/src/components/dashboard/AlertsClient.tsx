"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  alertsApi,
  type AlertItem,
  type AlertSeverity,
  type AlertStatus,
} from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

type ZoneOption = {
  id: string;
  name: string;
};

type AlertsClientProps = {
  initialAlerts: AlertItem[];
  zones: ZoneOption[];
};

type AlertFilters = {
  status: AlertStatus | "ALL";
  severity: AlertSeverity | "ALL";
  farmZoneId: string;
};

type SeverityConfig = {
  label: string;
  badgeClass: string;
  iconClass: string;
  cardClass: string;
};

type StatusConfig = {
  label: string;
  icon: LucideIcon;
  className: string;
};

type ActionType = "acknowledge" | "resolve" | "delete";

const severityConfig: Record<string, SeverityConfig> = {
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
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
    iconClass: "bg-destructive/10 text-destructive",
    cardClass: "border-destructive/20 bg-destructive/5",
  },
};

const statusConfig: Record<string, StatusConfig> = {
  OPEN: {
    label: "Đang mở",
    icon: Clock,
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  ACKNOWLEDGED: {
    label: "Đã xác nhận",
    icon: CheckCircle2,
    className:
      "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  RESOLVED: {
    label: "Đã xử lý",
    icon: CheckCircle2,
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
};

const defaultFilters: AlertFilters = {
  status: "OPEN",
  severity: "ALL",
  farmZoneId: "ALL",
};

function toRequestParams(filters: AlertFilters) {
  return {
    status: filters.status,
    severity: filters.severity,
    farmZoneId: filters.farmZoneId,
    limit: "1000",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AlertsClient({ initialAlerts, zones }: AlertsClientProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  const [alerts, setAlerts] = useState(initialAlerts);
  const [filters, setFilters] = useState<AlertFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AlertItem | null>(null);

  const criticalCount = alerts.filter(
    (alert) => alert.severity === "CRITICAL",
  ).length;
  const warningCount = alerts.filter(
    (alert) => alert.severity === "WARNING",
  ).length;

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  const loadAlerts = async (nextFilters: AlertFilters) => {
    setIsLoading(true);
    try {
      const data = await alertsApi.list(toRequestParams(nextFilters));
      setAlerts(data);
    } catch (error) {
      showToast(
        "error",
        getErrorMessage(error, "Không thể tải danh sách cảnh báo."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async <K extends keyof AlertFilters>(
    key: K,
    value: AlertFilters[K],
  ) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    await loadAlerts(nextFilters);
  };

  const handleResetFilters = async () => {
    setFilters(defaultFilters);
    await loadAlerts(defaultFilters);
  };

  const handleAction = async (alert: AlertItem, action: ActionType) => {
    if (action === "delete") {
      setConfirmDelete(alert);
      return;
    }
    await executeAction(alert, action);
  };

  const executeAction = async (alert: AlertItem, action: ActionType) => {
    const actionKey = `${action}:${alert.id}`;
    setPendingAction(actionKey);

    try {
      if (action === "acknowledge") {
        await alertsApi.acknowledge(alert.id);
        showToast("success", "Đã xác nhận cảnh báo.");
      }

      if (action === "resolve") {
        await alertsApi.resolve(alert.id);
        showToast("success", "Đã đánh dấu cảnh báo là đã xử lý.");
      }

      if (action === "delete") {
        await alertsApi.delete(alert.id);
        showToast("success", "Đã xóa cảnh báo.");
      }

      await loadAlerts(filters);
    } catch (error) {
      showToast(
        "error",
        getErrorMessage(error, "Không thể cập nhật cảnh báo."),
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setConfirmDelete(null);
    await executeAction(target, "delete");
  };

  return (
    <div className="space-y-6 relative">
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground">Xác nhận xóa cảnh báo</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Bạn sắp xóa cảnh báo{" "}
                  <span className="font-semibold text-foreground">&ldquo;{confirmDelete.title}&rdquo;</span>.
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="shrink-0 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="inline-flex h-9 items-center justify-center rounded-xl border bg-card px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-white transition hover:bg-destructive/90"
              >
                <Trash2 className="size-3.5" />
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-destructive uppercase tracking-widest">
              Cảnh báo
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight">
              Cảnh báo môi trường &amp; sâu bệnh
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi, xác nhận và xử lý các cảnh báo được tạo tự động từ hệ
              thống cảm biến IoT.
            </p>
          </div>

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

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <label className="text-sm font-medium">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </span>
              <select
                value={filters.status}
                onChange={(event) =>
                  handleFilterChange(
                    "status",
                    event.target.value as AlertFilters["status"],
                  )
                }
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="OPEN">Đang mở</option>
                <option value="ACKNOWLEDGED">Đã xác nhận</option>
                <option value="RESOLVED">Đã xử lý</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mức độ
              </span>
              <select
                value={filters.severity}
                onChange={(event) =>
                  handleFilterChange(
                    "severity",
                    event.target.value as AlertFilters["severity"],
                  )
                }
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="ALL">Tất cả mức độ</option>
                <option value="INFO">Thông tin</option>
                <option value="WARNING">Cảnh báo</option>
                <option value="CRITICAL">Nghiêm trọng</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vùng trồng
              </span>
              <select
                value={filters.farmZoneId}
                onChange={(event) =>
                  handleFilterChange("farmZoneId", event.target.value)
                }
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="ALL">Tất cả vùng trồng</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-card px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Filter className="size-4" />
              Xóa lọc
            </button>
            <button
              type="button"
              onClick={() => loadAlerts(filters)}
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Tải lại
            </button>
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Bell className="size-7 text-muted-foreground/50" />
          </div>
          <h2 className="mt-4 text-lg font-bold">
            Không có cảnh báo phù hợp
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Thử đổi bộ lọc hoặc tải lại danh sách để kiểm tra các cảnh báo mới.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {alerts.map((alert) => {
            const sev = severityConfig[alert.severity] ?? severityConfig.INFO;
            const sta = statusConfig[alert.status] ?? statusConfig.OPEN;
            const StatusIcon = sta.icon;
            const acknowledgePending =
              pendingAction === `acknowledge:${alert.id}`;
            const resolvePending = pendingAction === `resolve:${alert.id}`;
            const deletePending = pendingAction === `delete:${alert.id}`;

            return (
              <article
                key={alert.id}
                className={`rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md ${sev.cardClass}`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${sev.iconClass}`}
                    >
                      <AlertTriangle className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold leading-snug text-foreground">
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

                  <div className="flex flex-col gap-3 xl:items-end">
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

                    <div className="flex flex-wrap gap-2">
                      {alert.status === "OPEN" && (
                        <button
                          type="button"
                          onClick={() => handleAction(alert, "acknowledge")}
                          disabled={Boolean(pendingAction)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 text-xs font-semibold text-sky-700 transition hover:bg-sky-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-sky-300"
                        >
                          {acknowledgePending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="size-3.5" />
                          )}
                          Xác nhận
                        </button>
                      )}

                      {alert.status !== "RESOLVED" && (
                        <button
                          type="button"
                          onClick={() => handleAction(alert, "resolve")}
                          disabled={Boolean(pendingAction)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-emerald-300"
                        >
                          {resolvePending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          Đánh dấu đã xử lý
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleAction(alert, "delete")}
                          disabled={Boolean(pendingAction)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 text-xs font-semibold text-destructive transition hover:bg-destructive/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletePending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          Xóa cảnh báo
                        </button>
                      )}
                    </div>
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
