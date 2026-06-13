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
import { type ChartDataPoint } from "@/stores/realtime.store";

interface SensorLineChartProps {
  data: ChartDataPoint[];
}

export function SensorLineChart({ data }: SensorLineChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Client only
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-dashed bg-card">
        <span className="text-sm text-muted-foreground animate-pulse">Đang tải biểu đồ cảm biến...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-80 w-full flex-col items-center justify-center rounded-2xl border border-dashed bg-card text-center p-6">
        <p className="text-sm font-medium">Chưa có dữ liệu biểu đồ</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Vui lòng đợi kết nối Socket.io nhận các tín hiệu cảm biến tiếp theo để bắt đầu vẽ đồ thị.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h3 className="font-bold text-lg">Đồ thị biến thiên Realtime</h3>
        <p className="text-xs text-muted-foreground">
          Biểu diễn sự biến động của Nhiệt độ và Độ ẩm qua 20 điểm dữ liệu gần nhất
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
              dy={10}
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-card)",
                borderRadius: "12px",
                borderColor: "#e2e8f0",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            <Line
              name="Nhiệt độ (°C)"
              type="monotone"
              dataKey="temperature"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              name="Độ ẩm không khí (%)"
              type="monotone"
              dataKey="airHumidity"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              name="Độ ẩm đất (%)"
              type="monotone"
              dataKey="soilMoisture"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
