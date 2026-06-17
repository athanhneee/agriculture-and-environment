"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type SensorReading } from "@/lib/api";

interface HistoryLineChartProps {
  data: SensorReading[];
  metricKey: "temperature" | "airHumidity" | "soilMoisture" | "lightIntensity";
  title: string;
  strokeColor: string;
  unit: string;
}

const formatDateLabel = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("vi-VN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export function HistoryLineChart({
  data,
  metricKey,
  title,
  strokeColor,
  unit,
}: HistoryLineChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed bg-card">
        <span className="text-sm text-muted-foreground animate-pulse">Đang tải biểu đồ {title}...</span>
      </div>
    );
  }

  // Định dạng lại dữ liệu cho Recharts
  const chartData = data
    .map((reading) => ({
      time: formatDateLabel(reading.recordedAt),
      value: reading[metricKey] ?? 0,
      originalDate: new Date(reading.recordedAt).getTime(),
    }))
    .sort((a, b) => a.originalDate - b.originalDate); // Sắp xếp theo trình tự thời gian tăng dần

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h4 className="font-bold text-sm text-foreground">{title}</h4>
      </div>

      <div className="h-56 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9 }}
                stroke="#94a3b8"
                dy={8}
              />
              <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-card)",
                  borderRadius: "10px",
                  borderColor: "#e2e8f0",
                  fontSize: "11px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
              <Line
                name={`${title} (${unit})`}
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                dot={{ r: 1.5 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/20 rounded-3xl">
            <span className="text-xs text-muted-foreground">Không có dữ liệu</span>
          </div>
        )}
      </div>
    </div>
  );
}
