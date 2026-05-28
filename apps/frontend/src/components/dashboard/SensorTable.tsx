"use client";

import { useState } from "react";
import { Edit2, Trash2, Cpu, AlertTriangle } from "lucide-react";
import { type Sensor } from "@/lib/api";

interface SensorTableProps {
  sensors: Sensor[];
  onEdit: (sensor: Sensor) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export function SensorTable({ sensors, onEdit, onDelete, isAdmin }: SensorTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const statusConfig = {
    ACTIVE: {
      label: "Hoạt động",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    },
    INACTIVE: {
      label: "Ngừng hoạt động",
      className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-400/10 dark:text-zinc-300",
    },
    ERROR: {
      label: "Lỗi thiết bị",
      className: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400 border border-red-500/10",
    },
  };

  const typeConfig = {
    TEMPERATURE: "Nhiệt độ",
    AIR_HUMIDITY: "Độ ẩm không khí",
    SOIL_MOISTURE: "Độ ẩm đất",
    LIGHT_INTENSITY: "Ánh sáng",
    ALL_IN_ONE: "Tích hợp đa năng",
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (sensors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
        <Cpu className="size-10 text-muted-foreground/45" />
        <h3 className="mt-4 text-base font-semibold">Không tìm thấy cảm biến nào</h3>
        <p className="mt-1.5 text-xs text-muted-foreground max-w-xs">
          Hệ thống chưa ghi nhận thiết bị IoT. Vui lòng bấm thêm mới để kết nối.
        </p>
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
              Bạn có chắc chắn muốn xóa cảm biến này khỏi hệ thống? Hành động này sẽ hủy đăng ký thiết bị IoT.
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

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border bg-card shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-muted-foreground">
          <thead className="bg-muted/50 text-xs font-semibold text-foreground uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Tên cảm biến</th>
              <th className="px-6 py-4">Mã thiết bị</th>
              <th className="px-6 py-4">Vùng trồng</th>
              <th className="px-6 py-4">Loại cảm biến</th>
              <th className="px-6 py-4">Đơn vị</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              {(!isAdmin) && <th className="px-6 py-4 text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {sensors.map((sensor) => {
              const status = statusConfig[sensor.status] || { label: sensor.status, className: "" };
              const typeLabel = typeConfig[sensor.type] || sensor.type;
              return (
                <tr key={sensor.id} className="hover:bg-muted/30 transition-all duration-150">
                  <td className="px-6 py-4 align-middle font-bold text-foreground">{sensor.name}</td>
                  <td className="px-6 py-4 align-middle font-mono text-xs">{sensor.code}</td>
                  <td className="px-6 py-4 align-middle font-medium text-emerald-700 dark:text-emerald-400">
                    {sensor.farmZone?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 align-middle">{typeLabel}</td>
                  <td className="px-6 py-4 align-middle font-semibold">{sensor.unit}</td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </td>
                  {(!isAdmin) && (
                    <td className="px-6 py-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(sensor)}
                          className="flex size-8 items-center justify-center rounded-lg border bg-card hover:bg-muted transition text-muted-foreground hover:text-foreground"
                          title="Sửa"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(sensor.id)}
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

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {sensors.map((sensor) => {
          const status = statusConfig[sensor.status] || { label: sensor.status, className: "" };
          const typeLabel = typeConfig[sensor.type] || sensor.type;
          return (
            <article
              key={sensor.id}
              className="rounded-2xl border bg-card p-4 shadow-sm space-y-4 hover:border-emerald-500/35 transition"
            >
              <div className="flex items-start justify-between gap-4 border-b pb-3">
                <div>
                  <h4 className="font-bold text-base text-foreground leading-tight">{sensor.name}</h4>
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">Code: {sensor.code}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <p className="opacity-70">Vùng trồng</p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {sensor.farmZone?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="opacity-70">Loại cảm biến</p>
                  <p className="font-medium text-foreground mt-0.5">{typeLabel}</p>
                </div>
                <div>
                  <p className="opacity-70">Đơn vị đo</p>
                  <p className="font-semibold text-foreground mt-0.5">{sensor.unit}</p>
                </div>
              </div>

              {(!isAdmin) && (
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    onClick={() => onEdit(sensor)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border bg-card hover:bg-muted px-3 text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    <Edit2 className="size-3" /> Sửa
                  </button>
                  <button
                    onClick={() => setDeleteId(sensor.id)}
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
