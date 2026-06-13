"use client";

import { useEffect, useState } from "react";
import { Droplet, Droplets, Sun, Thermometer, Wifi, WifiOff } from "lucide-react";
import { useRealtimeStore } from "@/stores/realtime.store";

interface RealtimeReadingPanelProps {
  isConnected: boolean;
}

export function RealtimeReadingPanel({ isConnected }: RealtimeReadingPanelProps) {
  const latestReading = useRealtimeStore((state) => state.latestReading);
  const [pulse, setPulse] = useState(false);

  // Hiệu ứng nháy xanh khi có dữ liệu mới đẩy về
  useEffect(() => {
    if (latestReading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Lý do: Kích hoạt animation khi có dữ liệu mới
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 800);
      return () => clearTimeout(timer);
    }
  }, [latestReading]);

  const metrics = [
    {
      label: "Nhiệt độ không khí",
      value: latestReading?.temperature !== undefined ? `${latestReading.temperature}°C` : "N/A",
      icon: Thermometer,
      color: "text-orange-500 bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Độ ẩm không khí",
      value: latestReading?.airHumidity !== undefined ? `${latestReading.airHumidity}%` : "N/A",
      icon: Droplet,
      color: "text-sky-500 bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      label: "Độ ẩm đất",
      value: latestReading?.soilMoisture !== undefined ? `${latestReading.soilMoisture}%` : "N/A",
      icon: Droplets,
      color: "text-blue-500 bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Cường độ ánh sáng",
      value: latestReading?.lightIntensity !== undefined ? `${latestReading.lightIntensity.toLocaleString()} lx` : "N/A",
      icon: Sun,
      color: "text-yellow-500 bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
  ];

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold">Chỉ số cảm biến Realtime</h2>
          <p className="text-xs text-muted-foreground">
            Thông số môi trường cập nhật trực tiếp qua kết nối Socket.io
          </p>
        </div>
        
        {/* Status bar */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
              <Wifi className="size-3.5" />
              Realtime Active
              <span className={`inline-block size-2 rounded-full bg-emerald-500 ${pulse ? "animate-ping scale-150" : "animate-pulse"}`} />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-400/10 dark:text-zinc-400">
              <WifiOff className="size-3.5" />
              Offline / Reconnecting
            </span>
          )}
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <article
              key={index}
              className={`rounded-2xl border bg-card p-4 transition-all duration-300 ${metric.border} ${
                pulse ? "ring-2 ring-emerald-500/20 scale-[1.01]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{metric.label}</span>
                <div className={`flex size-8 items-center justify-center rounded-lg ${metric.color}`}>
                  <Icon className="size-4.5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight">{metric.value}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
