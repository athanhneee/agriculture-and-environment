"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Table } from "lucide-react";
import { type SensorReading } from "@/lib/api";

interface ReadingHistoryTableProps {
  readings: SensorReading[];
}

export function ReadingHistoryTable({ readings }: ReadingHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(readings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = readings.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
        <Table className="size-10 text-muted-foreground/45" />
        <h3 className="mt-4 text-base font-semibold">Chưa có bản ghi nào</h3>
        <p className="mt-1.5 text-xs text-muted-foreground max-w-xs">
          Vui lòng bấm nút Tra cứu để tải danh sách các bản ghi dữ liệu cảm biến lịch sử.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table grid */}
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-muted-foreground">
          <thead className="bg-emerald-50/60 dark:bg-emerald-950/20 border-b text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Thời gian</th>
              <th className="px-6 py-4">Vùng trồng</th>
              <th className="px-6 py-4">Thiết bị</th>
              <th className="px-6 py-4">Nhiệt độ</th>
              <th className="px-6 py-4">Ẩm không khí</th>
              <th className="px-6 py-4">Ẩm đất</th>
              <th className="px-6 py-4">Ánh sáng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {currentItems.map((reading) => (
              <tr key={reading.id} className="hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-all duration-200 cursor-default">
                <td className="px-6 py-4 font-medium text-foreground">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {new Date(reading.recordedAt).toLocaleString("vi-VN")}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-emerald-700 dark:text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {reading.farmZone?.name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 text-foreground font-medium">{reading.sensor?.name || "N/A"}</td>
                <td className="px-6 py-4 font-bold text-orange-600 dark:text-orange-400">
                  {reading.temperature !== null && reading.temperature !== undefined
                    ? `${reading.temperature}°C`
                    : "-"}
                </td>
                <td className="px-6 py-4 font-bold text-sky-600 dark:text-sky-400">
                  {reading.airHumidity !== null && reading.airHumidity !== undefined
                    ? `${reading.airHumidity}%`
                    : "-"}
                </td>
                <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                  {reading.soilMoisture !== null && reading.soilMoisture !== undefined
                    ? `${reading.soilMoisture}%`
                    : "-"}
                </td>
                <td className="px-6 py-4 font-bold text-yellow-600 dark:text-yellow-400">
                  {reading.lightIntensity !== null && reading.lightIntensity !== undefined
                    ? `${reading.lightIntensity.toLocaleString()} lx`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card border rounded-xl p-3 shadow-sm text-sm">
          <span className="text-muted-foreground font-medium">
            Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, readings.length)} trong tổng số {readings.length} bản ghi
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex size-8 items-center justify-center rounded-lg border bg-background hover:bg-muted transition text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-semibold text-foreground px-1">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex size-8 items-center justify-center rounded-lg border bg-background hover:bg-muted transition text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
