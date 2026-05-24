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
          <thead className="bg-muted/50 text-xs font-semibold text-foreground uppercase tracking-wider">
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
          <tbody className="divide-y">
            {currentItems.map((reading) => (
              <tr key={reading.id} className="hover:bg-muted/30 transition-all duration-150">
                <td className="px-6 py-4 font-medium text-foreground">
                  {new Date(reading.recordedAt).toLocaleString("vi-VN")}
                </td>
                <td className="px-6 py-4 font-semibold text-emerald-700 dark:text-emerald-400">
                  {reading.farmZone?.name || "N/A"}
                </td>
                <td className="px-6 py-4">{reading.sensor?.name || "N/A"}</td>
                <td className="px-6 py-4 font-semibold text-orange-600">
                  {reading.temperature !== null && reading.temperature !== undefined
                    ? `${reading.temperature}°C`
                    : "-"}
                </td>
                <td className="px-6 py-4 font-semibold text-sky-600">
                  {reading.airHumidity !== null && reading.airHumidity !== undefined
                    ? `${reading.airHumidity}%`
                    : "-"}
                </td>
                <td className="px-6 py-4 font-semibold text-blue-600">
                  {reading.soilMoisture !== null && reading.soilMoisture !== undefined
                    ? `${reading.soilMoisture}%`
                    : "-"}
                </td>
                <td className="px-6 py-4 font-semibold text-yellow-600">
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
