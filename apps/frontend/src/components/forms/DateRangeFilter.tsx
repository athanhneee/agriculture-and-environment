"use client";

import { useState } from "react";
import { Calendar, Download, Search } from "lucide-react";

interface DateRangeFilterProps {
  zones: Array<{ id: string; name: string }>;
  onFilterChange: (params: { farmZoneId: string; from: string; to: string }) => void;
  onExport: () => void;
  loading: boolean;
}

// Hàm lấy ngày định dạng YYYY-MM-DD
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function DateRangeFilter({
  zones,
  onFilterChange,
  onExport,
  loading,
}: DateRangeFilterProps) {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [farmZoneId, setFarmZoneId] = useState("ALL");
  const [from, setFrom] = useState(formatDate(sevenDaysAgo));
  const [to, setTo] = useState(formatDate(today));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (fromDate > toDate) {
      setErrorMsg("Ngày bắt đầu không được sau ngày kết thúc.");
      return;
    }

    // Giới hạn khoảng thời gian tối đa là 90 ngày để tránh quá tải dữ liệu
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      setErrorMsg("Khoảng thời gian tìm kiếm tối đa không quá 90 ngày.");
      return;
    }

    onFilterChange({ farmZoneId, from, to });
  };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Chọn Vùng trồng */}
          <label className="block">
            <span className="text-sm font-medium">Chọn vùng trồng</span>
            <select
              value={farmZoneId}
              onChange={(e) => setFarmZoneId(e.target.value)}
              className="mt-2 h-10 w-full rounded-3xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="ALL">Tất cả các vùng</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </label>

          {/* Ngày bắt đầu */}
          <label className="block">
            <span className="text-sm font-medium">Từ ngày</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-2 h-10 w-full rounded-3xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </label>

          {/* Ngày kết thúc */}
          <label className="block">
            <span className="text-sm font-medium">Đến ngày</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-2 h-10 w-full rounded-3xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </label>
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-destructive">{errorMsg}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-3xl bg-emerald-600 hover:bg-emerald-700 px-5 text-sm font-semibold text-white transition-all shadow-sm shadow-emerald-600/10 disabled:opacity-75"
          >
            <Search className="size-4" />
            {loading ? "Đang tìm kiếm..." : "Tra cứu dữ liệu"}
          </button>

          <button
            type="button"
            onClick={onExport}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-3xl border bg-background hover:bg-muted px-4 text-sm font-semibold transition disabled:opacity-75"
          >
            <Download className="size-4" />
            Tải Excel (.xlsx)
          </button>
        </div>
      </form>
    </div>
  );
}
