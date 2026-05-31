"use client";

import { useState } from "react";
import { Edit2, Trash2, Cpu, AlertTriangle, Thermometer, Droplets, Sun, Layers } from "lucide-react";
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
      dot: "bg-emerald-500",
      ping: "bg-emerald-400",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    },
    INACTIVE: {
      label: "Ngừng hoạt động",
      dot: "bg-zinc-400",
      ping: "",
      className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-400/10 dark:text-zinc-400",
    },
    ERROR: {
      label: "Lỗi thiết bị",
      dot: "bg-red-500",
      ping: "bg-red-400",
      className: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400 border border-red-500/10",
    },
  };

  const typeConfig: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
    TEMPERATURE: {
      label: "Nhiệt độ",
      icon: <Thermometer className="size-3.5" />,
      badge: "bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300",
    },
    AIR_HUMIDITY: {
      label: "Độ ẩm không khí",
      icon: <Droplets className="size-3.5" />,
      badge: "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
    },
    SOIL_MOISTURE: {
      label: "Độ ẩm đất",
      icon: <Droplets className="size-3.5" />,
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    },
    LIGHT_INTENSITY: {
      label: "Ánh sáng",
      icon: <Sun className="size-3.5" />,
      badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300",
    },
    ALL_IN_ONE: {
      label: "Tích hợp đa năng",
      icon: <Layers className="size-3.5" />,
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
    },
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
          <thead className="bg-emerald-50/60 dark:bg-emerald-950/20 border-b">
            <tr>
              <th className="px-6 py-3.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Cảm biến</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Vùng trồng</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Loại</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Đơn vị</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-center">Trạng thái</th>
              {isAdmin && <th className="px-6 py-3.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sensors.map((sensor) => {
              const status = statusConfig[sensor.status as keyof typeof statusConfig] || { label: sensor.status, className: "", dot: "bg-zinc-400", ping: "" };
              const typeInfo = typeConfig[sensor.type] || { label: sensor.type, icon: <Cpu className="size-3.5" />, badge: "bg-zinc-100 text-zinc-700" };
              return (
                <tr key={sensor.id} className="group hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-all duration-150 cursor-default">
                  <td className="px-6 py-3.5 align-middle font-bold text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/50 transition">
                        <Cpu className="size-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm leading-tight">{sensor.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground/70 mt-0.5">{sensor.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 align-middle">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span>{sensor.farmZone?.name || <span className="text-muted-foreground/50 italic">Chưa gán</span>}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 align-middle">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${typeInfo.badge}`}>
                      {typeInfo.icon}
                      {typeInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 align-middle">
                    <span className="inline-flex items-center rounded-lg bg-muted/60 px-2 py-0.5 text-xs font-mono font-semibold text-muted-foreground">
                      {sensor.unit}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 align-middle">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                        <span className="relative flex size-1.5">
                          {status.ping && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${status.ping} opacity-75`}></span>}
                          <span className={`relative inline-flex size-1.5 rounded-full ${status.dot}`}></span>
                        </span>
                        {status.label}
                      </span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-3.5 align-middle text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => onEdit(sensor)}
                          className="flex size-8 items-center justify-center rounded-lg border bg-card hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-500/30 dark:hover:text-emerald-400 transition text-muted-foreground"
                          title="Chỉnh sửa cảm biến"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(sensor.id)}
                          className="flex size-8 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/15 hover:border-destructive/30 transition text-destructive"
                          title="Xóa cảm biến"
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
      <div className="grid gap-3 md:hidden">
        {sensors.map((sensor) => {
          const status = statusConfig[sensor.status as keyof typeof statusConfig] || { label: sensor.status, className: "", dot: "bg-zinc-400", ping: "" };
          const typeInfo = typeConfig[sensor.type] || { label: sensor.type, icon: <Cpu className="size-3.5" />, badge: "bg-zinc-100 text-zinc-700" };
          return (
            <article
              key={sensor.id}
              className="rounded-2xl border bg-card p-4 shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all duration-200"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <Cpu className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground leading-tight">{sensor.name}</h4>
                    <p className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">{sensor.code}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${status.className}`}>
                  <span className="relative flex size-1.5">
                    {status.ping && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${status.ping} opacity-75`}></span>}
                    <span className={`relative inline-flex size-1.5 rounded-full ${status.dot}`}></span>
                  </span>
                  {status.label}
                </span>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-2 gap-2.5 p-3 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">Vùng trồng</p>
                  <p className="font-semibold text-xs text-emerald-700 dark:text-emerald-400">
                    {sensor.farmZone?.name || <span className="italic text-muted-foreground/50">Chưa gán</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">Loại cảm biến</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeInfo.badge}`}>
                    {typeInfo.icon}
                    {typeInfo.label}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">Đơn vị đo</p>
                  <span className="font-mono text-xs font-bold text-foreground bg-muted rounded px-1.5 py-0.5">{sensor.unit}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end gap-2 pt-3 mt-2 border-t">
                  <button
                    onClick={() => onEdit(sensor)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border bg-card hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-950/30 px-3 text-xs text-muted-foreground transition"
                  >
                    <Edit2 className="size-3" /> Sửa
                  </button>
                  <button
                    onClick={() => setDeleteId(sensor.id)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/15 px-3 text-xs text-destructive transition"
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
