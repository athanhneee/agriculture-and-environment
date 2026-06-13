"use client";

import { useState } from "react";
import { Edit2, Trash2, Calendar, AlertTriangle, Leaf, MapPin, Sprout, CheckCircle2, Clock } from "lucide-react";
import { type Crop } from "@/lib/api";

interface CropTableProps {
  crops: Crop[];
  onEdit: (crop: Crop) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
}

export function CropTable({ crops, onEdit, onDelete, canManage }: CropTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const statusConfig = {
    PLANTED: {
      label: "Mới gieo hạt",
      className: "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
    },
    GROWING: {
      label: "Đang phát triển",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    },
    HARVESTED: {
      label: "Đã thu hoạch",
      className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-400/10 dark:text-zinc-300",
    },
    DISEASED: {
      label: "Nhiễm bệnh",
      className: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400 border border-red-500/10",
    },
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (crops.length === 0) {
    const DEMO_CROPS = [
      {
        name: "Rau thủy canh Ngọc Xanh",
        variety: "Lactuca sativa",
        zone: "Miền Bắc Việt Nam",
        planted: "15/04/2025",
        harvest: "15/06/2025",
        status: "GROWING" as const,
      },
      {
        name: "Thanh long Ruột Đỏ",
        variety: "Hylocereus costaricensis",
        zone: "Miền Trung Việt Nam",
        planted: "01/03/2025",
        harvest: "01/08/2025",
        status: "PLANTED" as const,
      },
      {
        name: "Xoài Cát Hòa Lộc",
        variety: "Mangifera indica",
        zone: "Miền Nam Việt Nam",
        planted: "10/01/2025",
        harvest: "10/05/2025",
        status: "HARVESTED" as const,
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <Leaf className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold">Chưa có cây trồng nào</h3>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-xs">
            Hệ thống chưa ghi nhận dữ liệu cây trồng. Vui lòng bấm thêm mới để thiết lập.
          </p>
        </div>

        {/* Preview cây trồng mẫu */}
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ví dụ cây trồng theo 3 miền
        </p>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm opacity-60 pointer-events-none select-none">
          <table className="w-full border-collapse text-left text-sm text-muted-foreground">
            <thead className="border-b bg-emerald-50/60 dark:bg-emerald-950/20 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-emerald-800 dark:text-emerald-300">Tên cây trồng</th>
                <th className="px-6 py-3.5 text-muted-foreground">Giống cây</th>
                <th className="px-6 py-3.5 text-muted-foreground">Vùng trồng</th>
                <th className="px-6 py-3.5 text-muted-foreground">Ngày gieo</th>
                <th className="px-6 py-3.5 text-muted-foreground">Thu hoạch</th>
                <th className="px-6 py-3.5 text-muted-foreground">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {DEMO_CROPS.map((crop) => {
                const st = statusConfig[crop.status];
                return (
                  <tr key={crop.name} className="hover:bg-muted/30">
                    <td className="px-6 py-3.5 font-bold text-foreground">{crop.name}</td>
                    <td className="px-6 py-3.5 text-xs">{crop.variety}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <MapPin className="size-3" /> {crop.zone}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs">{crop.planted}</td>
                    <td className="px-6 py-3.5 text-xs">{crop.harvest}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Custom Confirm Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="size-6" />
              <h4 className="font-bold text-lg">Xác nhận xóa</h4>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Bạn có chắc chắn muốn xóa cây trồng này? Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="h-9 rounded-xl border bg-background px-4 text-xs font-semibold hover:bg-muted transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="h-9 rounded-xl bg-destructive text-destructive-foreground px-4 text-xs font-semibold hover:bg-destructive/90 transition"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive View: Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border bg-card shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-muted-foreground">
          <thead className="border-b bg-emerald-50/60 dark:bg-emerald-950/20 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5 text-emerald-800 dark:text-emerald-300">Tên cây trồng</th>
              <th className="px-6 py-3.5 text-muted-foreground">Giống cây</th>
              <th className="px-6 py-3.5 text-muted-foreground">Vùng trồng</th>
              <th className="px-6 py-3.5 text-muted-foreground">Ngày gieo trồng</th>
              <th className="px-6 py-3.5 text-muted-foreground">Thu hoạch dự kiến</th>
              <th className="px-6 py-3.5 text-muted-foreground">Trạng thái</th>
              {canManage && <th className="px-6 py-3.5 text-right text-muted-foreground">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {crops.map((crop) => {
              const status = statusConfig[crop.status] || { label: crop.status, className: "" };
              return (
                <tr key={crop.id} className="hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-all duration-200 cursor-default">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground leading-tight">{crop.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{crop.variety}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">{crop.variety}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <MapPin className="size-3" />
                      {crop.farmZone?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(crop.plantedDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    {crop.expectedHarvestDate
                      ? new Date(crop.expectedHarvestDate).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(crop)}
                          className="flex size-8 items-center justify-center rounded-lg border bg-card hover:bg-muted transition text-muted-foreground hover:text-foreground"
                          title="Sửa"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(crop.id)}
                          className="flex size-8 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition text-destructive"
                          title="Xóa"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Responsive View: Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {crops.map((crop) => {
          const status = statusConfig[crop.status] || { label: crop.status, className: "" };
          return (
            <article
              key={crop.id}
              className="rounded-2xl border bg-card p-4 shadow-sm space-y-4 hover:border-emerald-500/35 transition"
            >
              <div className="flex items-start justify-between gap-4 border-b pb-3">
                <div>
                  <h4 className="font-bold text-base text-foreground leading-tight">{crop.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Giống: {crop.variety}</p>
                </div>
                <span className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <p className="opacity-70">Vùng trồng</p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {crop.farmZone?.name || "N/A"}
                  </p>
                </div>
                <div className="flex flex-col">
                  <span className="opacity-70 flex items-center gap-1">
                    <Calendar className="size-3" /> Ngày gieo
                  </span>
                  <span className="font-medium text-foreground mt-0.5">
                    {new Date(crop.plantedDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                {crop.expectedHarvestDate && (
                  <div className="flex flex-col col-span-2 border-t pt-2 mt-1">
                    <span className="opacity-70 flex items-center gap-1">
                      <Calendar className="size-3" /> Ngày thu hoạch dự kiến
                    </span>
                    <span className="font-medium text-foreground mt-0.5">
                      {new Date(crop.expectedHarvestDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>

              {canManage && (
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    onClick={() => onEdit(crop)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border bg-card hover:bg-muted px-3 text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    <Edit2 className="size-3" /> Sửa
                  </button>
                  <button
                    onClick={() => setDeleteId(crop.id)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 px-3 text-xs text-destructive transition"
                  >
                    <Trash2 className="size-3" /> Xóa
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
