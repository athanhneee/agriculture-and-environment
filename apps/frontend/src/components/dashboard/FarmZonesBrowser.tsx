"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Leaf } from "lucide-react";
import { type FarmZone } from "@/lib/api";
import { FarmZoneCard } from "./FarmZoneCard";
import { useAuthStore } from "@/stores/auth.store";

interface FarmZonesBrowserProps {
  initialZones: FarmZone[];
}

export function FarmZonesBrowser({ initialZones }: FarmZonesBrowserProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredZones = initialZones.filter((zone) => {
    const matchesSearch =
      zone.name.toLowerCase().includes(search.toLowerCase()) ||
      (zone.description && zone.description.toLowerCase().includes(search.toLowerCase())) ||
      zone.soilType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || zone.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Vùng Trồng</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi, chỉnh sửa và cấu hình các khu vực trồng trọt và cảm biến.
          </p>
        </div>

        {!isAdmin && (
          <Link
            href="/dashboard/zones/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-semibold text-white transition-all shadow-sm shadow-emerald-600/10"
          >
            <Plus className="size-4" />
            Thêm vùng trồng
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/75" />
          <input
            type="text"
            placeholder="Tìm theo tên vùng trồng, mô tả, loại đất..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border bg-card px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
            <option value="MAINTENANCE">Đang bảo trì</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {filteredZones.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredZones.map((zone) => (
            <FarmZoneCard key={zone.id} zone={zone} />
          ))}
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <Leaf className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Không tìm thấy vùng trồng nào</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái để tìm thấy khu vực mong muốn.
          </p>
        </div>
      )}
    </div>
  );
}
