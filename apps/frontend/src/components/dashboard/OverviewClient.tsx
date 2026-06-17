"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Cpu,
  Leaf,
  Map,
  X,
} from "lucide-react";

import { MetricCard } from "./MetricCard";
import { RealtimeReadingPanel } from "./RealtimeReadingPanel";
import { SensorLineChart } from "../charts/SensorLineChart";
import { AlertBadge } from "../alerts/AlertBadge";
import { useSocket } from "@/hooks/useSocket";
import { useRealtimeStore, type Alert } from "@/stores/realtime.store";
import { type OverviewStats } from "@/lib/dashboard-server";

interface OverviewClientProps {
  initialStats: OverviewStats;
  initialLatestReading: any;
  initialAlerts: Alert[];
}

export function OverviewClient({
  initialStats,
  initialLatestReading,
  initialAlerts,
}: OverviewClientProps) {
  const setInitialData = useRealtimeStore((state) => state.setInitialData);
  const readings = useRealtimeStore((state) => state.readings);
  const alerts = useRealtimeStore((state) => state.alerts);
  const [activeToasts, setActiveToasts] = useState<Alert[]>([]);

  // Khởi tạo Zustand store với dữ liệu SSR ban đầu
  useEffect(() => {
    setInitialData({
      latestReading: initialLatestReading,
      alerts: initialAlerts,
    });
  }, [initialLatestReading, initialAlerts, setInitialData]);

  // Lắng nghe Socket.io, kích hoạt Toast khi có alert mới
  const { isConnected } = useSocket((newAlert) => {
    setActiveToasts((prev) => [newAlert, ...prev].slice(0, 3)); // Giữ tối đa 3 toast
    // Tự động tắt toast sau 5 giây
    setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.id !== newAlert.id));
    }, 6000);
  });

  const removeToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {activeToasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-lg animate-slide-in-bottom ${toast.severity === "CRITICAL"
                ? "border-destructive/30 bg-destructive/5 text-destructive-foreground"
                : "border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-100"
              }`}
          >
            <AlertTriangle className={`size-5 shrink-0 ${toast.severity === "CRITICAL" ? "text-destructive" : "text-amber-500"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-75">
                Cảnh báo mới xuất hiện!
              </p>
              <h4 className="font-bold text-sm text-foreground mt-0.5">{toast.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Intro */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Bảng điều khiển
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight">
              Hệ thống giám sát nông nghiệp thông minh
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Dữ liệu cảm biến IoT cập nhật thời gian thực qua Socket.io — tự động đánh giá và kích hoạt cảnh báo tức thì.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Summary Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tổng số vùng trồng"
          value={initialStats.zonesCount}
          icon={Map}
          description="Khu vực đang giám sát"
        />
        <MetricCard
          title="Cây trồng đang trồng"
          value={initialStats.cropsCount}
          icon={Leaf}
          description="Loại cây giống"
        />
        <MetricCard
          title="Thiết bị cảm biến"
          value={initialStats.sensorsCount}
          icon={Cpu}
          description="Đầu đo hoạt động"
        />
        <MetricCard
          title="Cảnh báo đang mở"
          value={alerts.length}
          icon={Bell}
          description="Cần xử lý trong ngày"
          className={alerts.length > 0 ? "border-destructive/20 bg-destructive/5" : ""}
        />
      </section>

      {/* Realtime readings panel */}
      <RealtimeReadingPanel isConnected={isConnected} />

      {/* Recharts and Alerts lists */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        {/* Realtime Line Chart */}
        <SensorLineChart data={readings} />

        {/* List of Alerts */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="font-bold text-lg">Cảnh báo đang mở ({alerts.length})</h3>
              <span className="text-xs text-muted-foreground">Mới nhất</span>
            </div>

            <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-3xl border p-3.5 text-xs flex gap-3 ${alert.severity === "CRITICAL"
                        ? "border-destructive/15 bg-destructive/5 text-destructive"
                        : "border-amber-500/15 bg-amber-500/5 text-amber-800 dark:text-amber-400"
                      }`}
                  >
                    <AlertTriangle className="size-4.5 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{alert.title}</p>
                        <AlertBadge severity={alert.severity} />
                      </div>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{alert.message}</p>
                      <span className="inline-block mt-2 text-[10px] opacity-75 font-medium">
                        {new Date(alert.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed rounded-3xl">
                  <Bell className="size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-xs font-medium">Môi trường an toàn</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">Không ghi nhận cảnh báo nào đang mở.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
