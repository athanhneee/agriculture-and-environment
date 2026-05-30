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

      {/* Banner & Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Cảnh Báo</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi, xác nhận và xử lý các cảnh báo được tạo tự động từ hệ thống cảm biến IoT.
          </p>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
            <BellRing className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng cảnh báo</p>
            <p className="text-2xl font-bold tracking-tight">{isLoading ? "..." : alerts.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400">
            <div className="relative flex size-2.5 items-center justify-center">
              {criticalCount > 0 && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              )}
              <span className="relative inline-flex size-2 rounded-full bg-red-500"></span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-medium">Nghiêm trọng</p>
            <p className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">{isLoading ? "..." : criticalCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
            <span className="size-2 rounded-full bg-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-medium">Cảnh báo thường</p>
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{isLoading ? "..." : warningCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 p-5 bg-card rounded-2xl border shadow-sm sm:flex-row sm:items-end justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Trạng thái</span>
            <select
              value={filters.status}
              onChange={(event) =>
                handleFilterChange(
                  "status",
                  event.target.value as AlertFilters["status"],
                )
              }
              className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-semibold outline-none transition hover:bg-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">Đang mở (Open)</option>
              <option value="ACKNOWLEDGED">Đã xác nhận (Acknowledged)</option>
              <option value="RESOLVED">Đã xử lý (Resolved)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mức độ</span>
            <select
              value={filters.severity}
              onChange={(event) =>
                handleFilterChange(
                  "severity",
                  event.target.value as AlertFilters["severity"],
                )
              }
              className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-semibold outline-none transition hover:bg-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="INFO">Thông tin (Info)</option>
              <option value="WARNING">Cảnh báo (Warning)</option>
              <option value="CRITICAL">Nghiêm trọng (Critical)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Vùng trồng</span>
            <select
              value={filters.farmZoneId}
              onChange={(event) =>
                handleFilterChange("farmZoneId", event.target.value)
              }
              className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-semibold outline-none transition hover:bg-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
            >
              <option value="ALL">Tất cả vùng trồng</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Filter className="size-3.5" />
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={() => loadAlerts(filters)}
            disabled={isLoading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Tải lại
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card p-5 space-y-3 animate-pulse">
              <div className="flex gap-4 items-start">
                <div className="size-11 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-muted rounded" />
                  <div className="h-3 w-1/4 bg-muted/60 rounded" />
                  <div className="h-4 w-full bg-muted/50 rounded mt-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
            <Bell className="size-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">Không có cảnh báo phù hợp</h2>
          <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Hệ thống đang hoạt động an toàn hoặc không có cảnh báo nào khớp với bộ lọc của bạn.
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

            // Xác định border-l tùy theo mức độ
            let borderLClass = "border-l-4 border-l-sky-500";
            if (alert.severity === "WARNING") {
              borderLClass = "border-l-4 border-l-amber-500";
            } else if (alert.severity === "CRITICAL") {
              borderLClass = "border-l-4 border-l-red-500";
            }

            return (
              <article
                key={alert.id}
                className={`rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md ${borderLClass} ${sev.cardClass}`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${sev.iconClass}`}
                    >
                      <AlertTriangle className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold leading-snug text-foreground text-base">
                        {alert.title}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {alert.farmZone?.name ?? "Không rõ vùng trồng"}
                        </span>
                        <span>·</span>
                        <span>{new Date(alert.createdAt).toLocaleString("vi-VN")}</span>
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
