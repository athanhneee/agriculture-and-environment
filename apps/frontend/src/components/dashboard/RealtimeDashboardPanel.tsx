"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, RadioTower } from "lucide-react";

import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth.store";

type ZoneSummary = {
  id: string;
  name: string;
  latestSensorSummary?: {
    temperature?: number;
    airHumidity?: number;
    soilMoisture?: number;
    lightIntensity?: number;
    recordedAt?: string;
  };
  openAlertsCount?: number;
};

type SensorReadingPayload = {
  farmZoneId: string;
  reading: {
    temperature?: number;
    airHumidity?: number;
    soilMoisture?: number;
    lightIntensity?: number;
    recordedAt?: string;
  };
  timestamp?: string;
};

type AlertPayload = {
  farmZoneId?: string;
  title?: string;
  severity?: string;
  createdAt?: string;
};

const severityLabels: Record<string, string> = {
  INFO: "Thông tin",
  WARNING: "Cảnh báo",
  CRITICAL: "Nghiêm trọng",
};

export function RealtimeDashboardPanel({ zones }: { zones: ZoneSummary[] }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [latestReadings, setLatestReadings] = useState<
    Record<string, SensorReadingPayload["reading"]>
  >({});
  const [latestAlert, setLatestAlert] = useState<AlertPayload | null>(null);

  const rooms = useMemo(
    () => zones.map((zone) => `farm-zone:${zone.id}`),
    [zones],
  );

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = getSocket(accessToken);

    const handleConnect = () => {
      rooms.forEach((room) => socket.emit("join-room", room));
    };

    const handleReading = (payload: SensorReadingPayload) => {
      setLatestReadings((current) => ({
        ...current,
        [payload.farmZoneId]: payload.reading,
      }));
    };
    const handleAlert = (payload: AlertPayload) => {
      setLatestAlert(payload);
    };

    socket.on("connect", handleConnect);
    socket.on("sensor:reading-created", handleReading);
    socket.on("sensor:global-reading", handleReading);
    socket.on("alert:created", handleAlert);
    socket.on("alert:global", handleAlert);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      rooms.forEach((room) => socket.emit("leave-room", room));
      socket.off("connect", handleConnect);
      socket.off("sensor:reading-created", handleReading);
      socket.off("sensor:global-reading", handleReading);
      socket.off("alert:created", handleAlert);
      socket.off("alert:global", handleAlert);
    };
  }, [accessToken, rooms]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Cảm biến thời gian thực</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Số liệu từ các trạm IoT</p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
            <RadioTower className="size-5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {zones.length > 0 ? (
            zones.slice(0, 4).map((zone) => {
              const reading = latestReadings[zone.id] ?? zone.latestSensorSummary;

              return (
                <div
                  key={zone.id}
                  className="rounded-2xl border bg-background p-4"
                >
                  <p className="text-sm font-semibold">{zone.name}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span className="flex flex-col gap-0.5 rounded-xl bg-sky-50 px-3 py-2 font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                      <span className="text-[10px] font-medium text-muted-foreground">Độ ẩm đất</span>
                      {reading?.soilMoisture ?? "--"}%
                    </span>
                    <span className="flex flex-col gap-0.5 rounded-xl bg-amber-50 px-3 py-2 font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      <span className="text-[10px] font-medium text-muted-foreground">Nhiệt độ</span>
                      {reading?.temperature ?? "--"}°C
                    </span>
                    <span className="flex flex-col gap-0.5 rounded-xl bg-teal-50 px-3 py-2 font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                      <span className="text-[10px] font-medium text-muted-foreground">Ẩm không khí</span>
                      {reading?.airHumidity ?? "--"}%
                    </span>
                    <span className="flex flex-col gap-0.5 rounded-xl bg-lime-50 px-3 py-2 font-semibold text-lime-700 dark:bg-lime-950/40 dark:text-lime-300">
                      <span className="text-[10px] font-medium text-muted-foreground">Ánh sáng</span>
                      {reading?.lightIntensity ?? "--"} lx
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-background py-8 text-center">
              <RadioTower className="size-7 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">Chưa có vùng trồng nào</p>
              <p className="text-xs text-muted-foreground/70">Thêm vùng trồng để bắt đầu giám sát</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BellRing className="size-5 text-emerald-700 dark:text-emerald-300" />
          <h2 className="text-lg font-semibold">Cảnh báo thời gian thực</h2>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="font-semibold">
            {latestAlert?.title ?? "Không có cảnh báo mới"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {latestAlert?.severity
              ? `Mức ${severityLabels[latestAlert.severity] ?? latestAlert.severity}`
              : "Hệ thống đang theo dõi bình thường"}
          </p>
        </div>
      </div>
    </div>
  );
}

