"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  Loader2,
  MapPin,
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

type ZoneOption = { id: string; name: string };
type AlertsClientProps = { initialAlerts: AlertItem[]; zones: ZoneOption[] };
type AlertFilters = {
  status: AlertStatus | "ACTIVE" | "ALL";
  severity: AlertSeverity | "ALL";
  farmZoneId: string;
};
type SeverityConfig = {
  label: string;
  badgeClass: string;
  iconClass: string;
  cardClass: string;
  icon: LucideIcon;
  dotClass: string;
};
type StatusConfig = { label: string; icon: LucideIcon; className: string };
type ActionType = "acknowledge" | "resolve" | "delete";

const severityConfig: Record<string, SeverityConfig> = {
  INFO: {
    label: "Thông tin",
    badgeClass: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    cardClass: "border-l-4 border-l-sky-400",
    dotClass: "bg-sky-500",
    icon: Info,
  },
  WARNING: {
    label: "Cảnh báo",
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    cardClass: "border-l-4 border-l-amber-500",
    dotClass: "bg-amber-500",
    icon: AlertTriangle,
  },
  CRITICAL: {
    label: "Nghiêm trọng",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
    iconClass: "bg-red-500/10 text-red-600 dark:text-red-400",
    cardClass: "border-l-4 border-l-red-500 bg-red-500/[0.02] dark:bg-red-950/10",
    dotClass: "bg-red-500",
    icon: AlertCircle,
  },
};

const statusConfig: Record<string, StatusConfig> = {
  OPEN: {
    label: "Đang mở",
    icon: Clock,
    className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  ACKNOWLEDGED: {
    label: "Đã xác nhận",
    icon: ShieldCheck,
    className: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  RESOLVED: {
    label: "Đã xử lý",
    icon: CheckCircle2,
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
};

const defaultFilters: AlertFilters = { status: "ACTIVE", severity: "ALL", farmZoneId: "ALL" };

function toRequestParams(filters: AlertFilters) {
  return { status: filters.status, severity: filters.severity, farmZoneId: filters.farmZoneId, limit: "1000" };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function AlertsClient({ initialAlerts, zones }: AlertsClientProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  const [alerts, setAlerts] = useState(initialAlerts);
  const [filters, setFilters] = useState<AlertFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AlertItem | null>(null);

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const warningCount = alerts.filter((a) => a.severity === "WARNING").length;
  const infoCount = alerts.filter((a) => a.severity === "INFO").length;
  const openCount = alerts.filter((a) => a.status === "OPEN").length;

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
      showToast("error", getErrorMessage(error, "Không thể tải danh sách cảnh báo."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async <K extends keyof AlertFilters>(key: K, value: AlertFilters[K]) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    await loadAlerts(nextFilters);
  };

  const handleResetFilters = async () => {
    setFilters(defaultFilters);
    await loadAlerts(defaultFilters);
  };

  const handleAction = async (alert: AlertItem, action: ActionType) => {
    if (action === "delete") { setConfirmDelete(alert); return; }
    await executeAction(alert, action);
  };

  const executeAction = async (alert: AlertItem, action: ActionType) => {
    const actionKey = `${action}:${alert.id}`;
    setPendingAction(actionKey);
    try {
      if (action === "acknowledge") { await alertsApi.acknowledge(alert.id); showToast("success", "Đã xác nhận cảnh báo."); }
      if (action === "resolve") { await alertsApi.resolve(alert.id); showToast("success", "Đã đánh dấu cảnh báo là đã xử lý."); }
      if (action === "delete") { await alertsApi.delete(alert.id); showToast("success", "Đã xóa cảnh báo."); }
      await loadAlerts(filters);
    } catch (error) {
      showToast("error", getErrorMessage(error, "Không thể cập nhật cảnh báo."));
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
      {/* ── Confirm Delete Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base">Xác nhận xóa cảnh báo</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Bạn sắp xóa{" "}
                  <span className="font-semibold text-foreground">&ldquo;{confirmDelete.title}&rdquo;</span>.
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <button onClick={() => setConfirmDelete(null)} className="shrink-0 rounded-3xl p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="h-9 rounded-3xl border bg-card px-4 text-sm font-semibold hover:bg-muted transition">Hủy</button>
              <button onClick={handleConfirmDelete} className="inline-flex h-9 items-center gap-2 rounded-3xl bg-destructive px-4 text-sm font-semibold text-white hover:bg-destructive/90 transition">
                <Trash2 className="size-3.5" /> Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-3xl border px-4 py-3 text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 ${toast.type === "success"
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
          : "border-destructive/20 bg-destructive/10 text-destructive"
          }`}>
          {toast.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertTriangle className="size-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Cảnh Báo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi, xác nhận và xử lý các cảnh báo được tạo tự động từ hệ thống cảm biến IoT.
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Tổng */}
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm hover:shadow-md transition-shadow sm:p-4 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 sm:size-11 sm:rounded-3xl">
            <BellRing className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">Tổng</p>
            <p className="text-xl font-bold tracking-tight mt-0.5 sm:text-2xl">{isLoading ? "..." : alerts.length}</p>
            {!isLoading && openCount > 0 && (
              <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">{openCount} đang mở</p>
            )}
          </div>
        </div>

        {/* Nghiêm trọng */}
        <div className={`flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm hover:shadow-md transition-shadow sm:p-4 sm:gap-4 ${criticalCount > 0 ? "border-red-200 dark:border-red-800/40" : ""}`}>
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400 sm:size-11 sm:rounded-3xl">
            {criticalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2.5 bg-red-500"></span>
              </span>
            )}
            <AlertCircle className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">Nghiêm trọng</p>
            <p className={`text-xl font-bold tracking-tight mt-0.5 sm:text-2xl ${criticalCount > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
              {isLoading ? "..." : criticalCount}
            </p>
          </div>
        </div>

        {/* Cảnh báo */}
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm hover:shadow-md transition-shadow sm:p-4 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 sm:size-11 sm:rounded-3xl">
            <AlertTriangle className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">Cảnh báo</p>
            <p className={`text-xl font-bold tracking-tight mt-0.5 sm:text-2xl ${warningCount > 0 ? "text-amber-600 dark:text-amber-400" : ""}`}>
              {isLoading ? "..." : warningCount}
            </p>
          </div>
        </div>

        {/* Thông tin */}
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm hover:shadow-md transition-shadow sm:p-4 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400 sm:size-11 sm:rounded-3xl">
            <Info className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">Thông tin</p>
            <p className="text-xl font-bold tracking-tight text-sky-600 dark:text-sky-400 mt-0.5 sm:text-2xl">
              {isLoading ? "..." : infoCount}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="rounded-2xl border bg-card shadow-sm">
        {/* Mobile: collapsed filter toggle */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("alert-filters");
            el?.classList.toggle("hidden");
          }}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-muted-foreground sm:hidden"
        >
          <span className="flex items-center gap-2">
            <Filter className="size-4" />
            Bộ lọc
          </span>
          <span className="text-xs text-muted-foreground/60">Nhấn để mở</span>
        </button>

        <div id="alert-filters" className="hidden sm:block">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:gap-4">
            <div className="grid flex-1 gap-3 sm:grid-cols-3">
              {/* Trạng thái */}
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Clock className="size-3" /> Trạng thái
                </span>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value as AlertFilters["status"])}
                  className="h-9 w-full rounded-3xl border bg-background px-3 text-xs font-semibold outline-none transition hover:bg-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Chưa xử lý (Đang mở &amp; Xác nhận)</option>
                  <option value="OPEN">Chưa xác nhận (Đang mở)</option>
                  <option value="ACKNOWLEDGED">Đang xử lý (Đã xác nhận)</option>
                  <option value="RESOLVED">Đã giải quyết (Đã xử lý)</option>
                </select>
              </div>

              {/* Mức độ */}
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <AlertTriangle className="size-3" /> Mức độ
                </span>
                <select
                  value={filters.severity}
                  onChange={(e) => handleFilterChange("severity", e.target.value as AlertFilters["severity"])}
                  className="h-9 w-full rounded-3xl border bg-background px-3 text-xs font-semibold outline-none transition hover:bg-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
                >
                  <option value="ALL">Tất cả mức độ</option>
                  <option value="INFO">Thông tin (Info)</option>
                  <option value="WARNING">Cảnh báo (Warning)</option>
                  <option value="CRITICAL">Nghiêm trọng (Critical)</option>
                </select>
              </div>

              {/* Vùng trồng */}
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="size-3" /> Vùng trồng
                </span>
                <select
                  value={filters.farmZoneId}
                  onChange={(e) => handleFilterChange("farmZoneId", e.target.value)}
                  className="h-9 w-full rounded-3xl border bg-background px-3 text-xs font-semibold outline-none transition hover:bg-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
                >
                  <option value="ALL">Tất cả vùng trồng</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleResetFilters}
                className="inline-flex h-9 items-center gap-2 rounded-3xl border bg-background px-4 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <Filter className="size-3.5" /> Xóa lọc
              </button>
              <button
                onClick={() => loadAlerts(filters)}
                disabled={isLoading}
                className="inline-flex h-9 items-center gap-2 rounded-3xl bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
              >
                {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                Tải lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alert List ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card p-5 animate-pulse border-l-4 border-l-muted">
              <div className="flex gap-4 items-start">
                <div className="size-11 rounded-3xl bg-muted/70 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-2/5 bg-muted rounded" />
                    <div className="h-4 w-16 bg-muted/60 rounded-full ml-auto" />
                  </div>
                  <div className="h-3 w-1/3 bg-muted/60 rounded" />
                  <div className="h-3 w-full bg-muted/40 rounded mt-1" />
                  <div className="h-3 w-4/5 bg-muted/30 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-20 text-center">
          <div className="relative flex size-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400">
            <Bell className="size-9" />
            <span className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow">0</span>
          </div>
          <h2 className="mt-5 text-lg font-bold text-foreground">Không có cảnh báo phù hợp</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
            Hệ thống đang hoạt động an toàn hoặc không có cảnh báo nào khớp với bộ lọc hiện tại.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-3xl border bg-card px-4 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <Filter className="size-3.5" /> Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {alerts.map((alert) => {
            const sev = severityConfig[alert.severity] ?? severityConfig.INFO;
            const sta = statusConfig[alert.status] ?? statusConfig.OPEN;
            const StatusIcon = sta.icon;
            const SevIcon = sev.icon;
            const isCritical = alert.severity === "CRITICAL";
            const acknowledgePending = pendingAction === `acknowledge:${alert.id}`;
            const resolvePending = pendingAction === `resolve:${alert.id}`;
            const deletePending = pendingAction === `delete:${alert.id}`;

            return (
              <article
                key={alert.id}
                className={`group rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md ${sev.cardClass}`}
              >
                <div className="p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    {/* Left: Icon + Content */}
                    <div className="flex min-w-0 flex-1 gap-3.5">
                      {/* Severity Icon */}
                      <div className={`relative flex size-11 shrink-0 items-center justify-center rounded-3xl ${sev.iconClass}`}>
                        {isCritical && alert.status === "OPEN" && (
                          <span className="absolute inset-0 rounded-3xl animate-ping bg-red-400/20"></span>
                        )}
                        <SevIcon className="relative size-5" />
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h2 className="font-bold text-sm leading-snug text-foreground">{alert.title}</h2>
                          {isCritical && alert.status === "OPEN" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider animate-pulse">
                              ● KHẨN
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {alert.farmZone?.name ?? "Không rõ vùng"}
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <Clock className="size-3" />
                          <span title={new Date(alert.createdAt).toLocaleString("vi-VN")}>
                            {formatRelativeTime(alert.createdAt)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    {/* Right: Badges + Actions */}
                    <div className="flex flex-col gap-2.5 xl:items-end xl:shrink-0">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${sev.badgeClass}`}>
                          <span className={`size-1.5 rounded-full ${sev.dotClass} inline-block`} />
                          {sev.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${sta.className}`}>
                          <StatusIcon className="size-3" />
                          {sta.label}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {alert.status === "OPEN" && (
                          <button
                            type="button"
                            onClick={() => handleAction(alert, "acknowledge")}
                            disabled={Boolean(pendingAction)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-3xl border border-sky-500/20 bg-sky-500/10 px-3 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
                          >
                            {acknowledgePending ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5" />}
                            Xác nhận
                          </button>
                        )}

                        {alert.status !== "RESOLVED" && (
                          <button
                            type="button"
                            onClick={() => handleAction(alert, "resolve")}
                            disabled={Boolean(pendingAction)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
                          >
                            {resolvePending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                            Đã xử lý
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleAction(alert, "delete")}
                            disabled={Boolean(pendingAction)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-3xl border border-destructive/20 bg-destructive/10 px-3 text-xs font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
                          >
                            {deletePending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                            Xóa
                          </button>
                        )}
                      </div>
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
