"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BellRing, RadioTower } from "lucide-react";

import { getSocket, socketBaseUrl } from "@/lib/socket";
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
  const [status, setStatus] = useState<"connecting" | "connected" | "offline">(
    "connecting",
  );
  const [latestReadings, setLatestReadings] = useState<
    Record<string, SensorReadingPayload["reading"]>
  >({});
  const [latestAlert, setLatestAlert] = useState<AlertPayload | null>(null);
  const [eventCount, setEventCount] = useState(0);

  const rooms = useMemo(
    () => zones.map((zone) => `farm-zone:${zone.id}`),
    [zones],
  );

  useEffect(() => {
    if (!accessToken) {
      setStatus("offline");
      return;
    }

    const socket = getSocket(accessToken);

    const handleConnect = () => {
      setStatus("connected");
      rooms.forEach((room) => socket.emit("join-room", room));
    };

    const handleDisconnect = () => setStatus("offline");
    const handleReading = (payload: SensorReadingPayload) => {
      setLatestReadings((current) => ({
        ...current,
        [payload.farmZoneId]: payload.reading,
      }));
      setEventCount((count) => count + 1);
    };
    const handleAlert = (payload: AlertPayload) => {
      setLatestAlert(payload);
      setEventCount((count) => count + 1);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
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
      socket.off("disconnect", handleDisconnect);
      socket.off("sensor:reading-created", handleReading);
      socket.off("sensor:global-reading", handleReading);
      socket.off("alert:created", handleAlert);
      socket.off("alert:global", handleAlert);
    };
  }, [accessToken, rooms]);

  const statusText =
    status === "connected"
      ? ""
      : status === "connecting"
        ? "Dang ket noi"
        : "Socket offline";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Realtime sensors</h2>

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
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <span className="rounded-xl bg-muted px-3 py-2">
                      Dat {reading?.soilMoisture ?? "--"}%
                    </span>
                    <span className="rounded-xl bg-muted px-3 py-2">
                      Nhiet {reading?.temperature ?? "--"}C
                    </span>
                    <span className="rounded-xl bg-muted px-3 py-2">
                      Am {reading?.airHumidity ?? "--"}%
                    </span>
                    <span className="rounded-xl bg-muted px-3 py-2">
                      Sang {reading?.lightIntensity ?? "--"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
              Chua co farm zones.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <BellRing className="size-5 text-emerald-700 dark:text-emerald-300" />
          <h2 className="text-lg font-semibold">Realtime alerts</h2>
        </div>
        <div className="mt-4 rounded-2xl border bg-background p-4">
                                                          
          <p className="mt-3 font-semibold">
            {latestAlert?.title ?? "Chua nhan alert moi"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {latestAlert?.severity
              ? `Mức ${severityLabels[latestAlert.severity] ?? latestAlert.severity}`
              : "Dang xay ra loi"}
          </p>
        </div>
      </div>
    </div>
  );
}
