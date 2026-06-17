"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, RefreshCw, BarChart2 } from "lucide-react";

import { sensorReadingsApi, type SensorReading } from "@/lib/api";
import { DateRangeFilter } from "../forms/DateRangeFilter";
import { HistoryLineChart } from "../charts/HistoryLineChart";
import { ReadingHistoryTable } from "./ReadingHistoryTable";

interface HistoryClientProps {
  initialZones: Array<{ id: string; name: string }>;
}

export function HistoryClient({ initialZones }: HistoryClientProps) {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [filters, setFilters] = useState({
    farmZoneId: "ALL",
    from: formatDate(sevenDaysAgo),
    to: formatDate(today),
  });

  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sensorReadingsApi.list(filters);
      setReadings(data as SensorReading[]);
    } catch (err: any) {
      console.error("Fetch sensor readings history failed:", err);
      setError("Không thể tải dữ liệu lịch sử cảm biến. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterChange = (newFilters: { farmZoneId: string; from: string; to: string }) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    // Gọi đường dẫn API xuất tệp Excel
    const url = sensorReadingsApi.exportUrl(filters);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lịch Sử Dữ Liệu Cảm Biến</h1>
        <p className="text-sm text-muted-foreground">
          Xem lại và xuất báo cáo (Excel) chỉ số đo đạc cảm biến theo thời gian.
        </p>
      </div>

      {/* Date filter panel */}
      <DateRangeFilter
        zones={initialZones}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        loading={loading}
      />

      {/* Main content grid */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-12 w-full bg-muted/65 rounded-3xl animate-pulse" />
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="h-64 bg-muted/50 rounded-3xl animate-pulse" />
            <div className="h-64 bg-muted/50 rounded-3xl animate-pulse" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-3 inline-flex items-center gap-1.5 rounded-3xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold hover:bg-destructive/20 transition"
          >
            <RefreshCw className="size-3" />
            Thử lại
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recharts Grid (4 charts) */}
          <div className="grid gap-6 sm:grid-cols-2">
            <HistoryLineChart
              data={readings}
              metricKey="temperature"
              title="Lịch sử Nhiệt độ Không khí"
              strokeColor="#f97316"
              unit="°C"
            />
            <HistoryLineChart
              data={readings}
              metricKey="airHumidity"
              title="Lịch sử Độ ẩm Không khí"
              strokeColor="#06b6d4"
              unit="%"
            />
            <HistoryLineChart
              data={readings}
              metricKey="soilMoisture"
              title="Lịch sử Độ ẩm Đất"
              strokeColor="#3b82f6"
              unit="%"
            />
            <HistoryLineChart
              data={readings}
              metricKey="lightIntensity"
              title="Lịch sử Cường độ Ánh sáng"
              strokeColor="#eab308"
              unit="Lux"
            />
          </div>

          {/* Details Table */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 mb-2">
              <Table className="size-5 text-emerald-700 dark:text-emerald-400" />
              <h3 className="font-bold text-lg">Bảng chi tiết thông số</h3>
            </div>
            <ReadingHistoryTable readings={readings} />
          </div>
        </div>
      )}
    </div>
  );
}
