"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, Cell, PieChart, Pie,
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { AlertTriangle, Info, RefreshCw, TrendingUp, MapPin, Cpu, Bell, Calendar } from "lucide-react";

import { statisticsApi } from "@/lib/api";
import type { OverviewStats } from "@/lib/dashboard-server";

interface StatisticsClientProps {
  initialOverview: OverviewStats;
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#3b82f6",
};

const TYPE_MAP: Record<string, string> = {
  CRITICAL_WEATHER: "Thời tiết cực đoan",
  SOIL_DRY: "Đất khô hạn",
  SENSOR_MALFUNCTION: "Lỗi cảm biến",
  OVERHEATING: "Quá nhiệt",
  HIGH_TEMPERATURE: "Nhiệt độ cao",
  LOW_SOIL_MOISTURE: "Ẩm đất thấp",
  HIGH_HUMIDITY: "Độ ẩm cao",
  LOW_LIGHT: "Thiếu ánh sáng",
  PEST_RISK: "Nguy cơ sâu bệnh",
};

export function StatisticsClient({ initialOverview }: StatisticsClientProps) {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [from, setFrom] = useState(formatDate(thirtyDaysAgo));
  const [to, setTo] = useState(formatDate(today));

  const [alertSeverityStats, setAlertSeverityStats] = useState<any[]>([]);
  const [alertTypeStats, setAlertTypeStats] = useState<any[]>([]);
  const [readingsStats, setReadingsStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [alertsData, readingsData] = await Promise.all([
        statisticsApi.alerts({ from, to }),
        statisticsApi.readings({ from, to }),
      ]);

      setAlertSeverityStats(alertsData?.bySeverity ?? []);
      setAlertTypeStats(alertsData?.byType ?? []);
      setReadingsStats(Array.isArray(readingsData) ? readingsData : []);
    } catch (err) {
      console.error("Fetch statistics failed:", err);
      setError("Không thể tải dữ liệu phân tích thống kê. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Chuẩn hóa dữ liệu cảnh báo theo Severity để vẽ PieChart
  const getSeverityData = () => {
    const nameMap: Record<string, string> = {
      CRITICAL: "Nghiêm trọng",
      WARNING: "Cảnh báo",
      INFO: "Thông tin",
    };

    return alertSeverityStats
      .map((item) => ({
        name: nameMap[item.severity] ?? item.severity,
        value: item.count,
        severity: item.severity,
      }))
      .filter((item) => item.value > 0);
  };

  // Chuẩn hóa dữ liệu cảnh báo theo Loại (Type) dịch sang tiếng Việt để vẽ BarChart
  const getAlertTypesData = () => {
    return alertTypeStats
      .map((item) => ({
        name: TYPE_MAP[item.type] || item.type,
        count: item.count,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const severityData = getSeverityData();
  const alertTypesData = getAlertTypesData();

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(from) > new Date(to)) {
      setDateError("Ngày bắt đầu không được sau ngày kết thúc.");
      return;
    }
    setDateError(null);
    fetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thống Kê Phân Tích</h1>
          <p className="text-sm text-muted-foreground">
            Báo cáo tổng hợp số liệu đo đạc cảm biến và tần suất cảnh báo toàn trang trại.
          </p>
        </div>
      </div>

      {/* Overview KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-5 shadow-sm animate-pulse flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-8 w-12 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted/60" />
              </div>
              <div className="size-10 rounded-3xl bg-muted" />
            </div>
          ))
          : [
            { label: "Vùng trồng", value: initialOverview.zonesCount, unit: "Đang được giám sát", icon: MapPin, color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" },
            { label: "Cảm biến", value: initialOverview.sensorsCount, unit: "Thiết bị IoT kết nối", icon: Cpu, color: "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400" },
            { label: "Cảnh báo mở", value: initialOverview.openAlertsCount, unit: "Cần được xử lý", icon: Bell, color: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400" },
            { label: "Nghiêm trọng", value: initialOverview.criticalAlertsCount, unit: "Sự cố khẩn cấp", icon: AlertTriangle, color: "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400" },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="rounded-2xl border bg-card p-5 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{kpi.value}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground font-medium">{kpi.unit}</p>
                </div>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-3xl ${kpi.color}`}>
                  <Icon className="size-5" />
                </div>
              </div>
            );
          })}
      </div>

      {/* Date Filter Form */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <form onSubmit={handleFilterSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Từ ngày
              </span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 w-40 sm:w-44 rounded-3xl border bg-background px-3 text-xs font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Đến ngày
              </span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 w-40 sm:w-44 rounded-3xl border bg-background px-3 text-xs font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 px-4 text-xs font-semibold text-white transition shadow-sm shadow-emerald-600/10 hover:shadow-emerald-600/20 disabled:opacity-75"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Lọc thống kê
            </button>
          </div>
        </form>
        {dateError && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <AlertTriangle className="size-3.5 shrink-0" />
            {dateError}
          </p>
        )}
      </div>

      {/* Loader */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="h-80 bg-muted/65 rounded-2xl animate-pulse" />
          <div className="h-80 bg-muted/50 rounded-2xl animate-pulse" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-3 inline-flex items-center gap-1.5 rounded-3xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold hover:bg-destructive/20 transition"
          >
            <RefreshCw className="size-3" /> Thử lại
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart Section 1: Sensors Line Over Time */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-600" />
                Chỉ số cảm biến trung bình theo ngày
              </h3>
            </div>
            <div className="h-72 w-full">
              {readingsStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={readingsStats.map((item) => ({
                      date: new Date(item.date).toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" }),
                      temp: item.avgTemperature ? Number(item.avgTemperature.toFixed(1)) : 0,
                      hum: item.avgAirHumidity ? Number(item.avgAirHumidity.toFixed(1)) : 0,
                      soil: item.avgSoilMoisture ? Number(item.avgSoilMoisture.toFixed(1)) : 0,
                    }))}
                    margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSoil" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Area name="Nhiệt độ TB (°C)" type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />
                    <Area name="Ẩm đất TB (%)" type="monotone" dataKey="soil" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSoil)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/20 rounded-3xl">
                  <span className="text-xs text-muted-foreground">Không có dữ liệu trong khoảng thời gian này</span>
                </div>
              )}
            </div>
          </div>

          {/* Chart Section 2: Alert Analysis */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* PieChart for Alert Severity */}
            <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                  <Info className="size-4 text-emerald-600" />
                  Mức độ nghiêm trọng của cảnh báo
                </h3>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                {severityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                          `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                        }
                      >
                        {severityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={SEVERITY_COLORS[entry.severity] ?? "#cbd5e1"}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} cảnh báo`, "Số lượng"]} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/20 rounded-3xl">
                    <span className="text-xs text-muted-foreground font-medium">Không ghi nhận cảnh báo nào</span>
                  </div>
                )}
              </div>
            </div>

            {/* BarChart for Alert Types */}
            <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="size-4 text-emerald-600" />
                  Tần suất cảnh báo theo loại lỗi
                </h3>
              </div>
              <div className="h-64 w-full">
                {alertTypesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={alertTypesData}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                      <XAxis type="number" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={90} />
                      <Tooltip contentStyle={{ fontSize: "11px" }} />
                      <Bar name="Số lần cảnh báo" dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                        {alertTypesData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill="#f59e0b" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/20 rounded-3xl">
                    <span className="text-xs text-muted-foreground font-medium">Môi trường an toàn, không có cảnh báo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
