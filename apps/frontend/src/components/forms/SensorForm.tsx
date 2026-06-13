"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";

import { sensorsApi, type Sensor } from "@/lib/api";
import { sensorSchema, type SensorFormValues } from "@/lib/validations";

interface SensorFormProps {
  initialData?: Sensor;
  zones: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

const DEFAULT_UNITS = {
  TEMPERATURE: "°C",
  AIR_HUMIDITY: "%",
  SOIL_MOISTURE: "%",
  LIGHT_INTENSITY: "Lux",
  ALL_IN_ONE: "Mixed",
};

export function SensorForm({ initialData, zones, onSuccess, onCancel }: SensorFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isEdit = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SensorFormValues>({
    resolver: zodResolver(sensorSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      code: initialData?.code ?? "",
      type: initialData?.type ?? "TEMPERATURE",
      unit: initialData?.unit ?? "°C",
      status: initialData?.status ?? "ACTIVE",
      farmZoneId: initialData?.farmZoneId ?? "",
    },
  });

  // Tự động gán đơn vị đo (unit) mặc định dựa trên loại cảm biến được chọn
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as keyof typeof DEFAULT_UNITS;
    if (DEFAULT_UNITS[type]) {
      setValue("unit", DEFAULT_UNITS[type]);
    }
  };

  const onSubmit = async (values: SensorFormValues) => {
    setErrorMsg(null);
    try {
      if (isEdit && initialData) {
        await sensorsApi.update(initialData.id, values);
      } else {
        await sensorsApi.create(values);
      }
      onSuccess();
    } catch (error: unknown) {
      console.error("Submit sensor form failed:", error);
      setErrorMsg(error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu thông tin cảm biến.");
    }
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border bg-card p-6 shadow-lg">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h3 className="text-lg font-bold">
          {isEdit ? "Cập nhật thông tin cảm biến" : "Đăng ký thiết bị cảm biến"}
        </h3>
        <button
          onClick={onCancel}
          className="rounded-lg p-1 hover:bg-muted transition text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Tên cảm biến */}
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Tên cảm biến *</span>
            <input
              type="text"
              placeholder="Cảm biến Nhiệt độ Không khí Khu A..."
              aria-invalid={Boolean(errors.name)}
              className="mt-2 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
              {...register("name")}
            />
            {errors.name?.message && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </label>

          {/* Mã thiết bị */}
          <label className="block">
            <span className="text-sm font-medium">Mã thiết bị (IoT Code) *</span>
            <input
              type="text"
              placeholder="ESP32-TEMP-ZONE1-01"
              disabled={isEdit} // Không cho phép sửa mã định danh sau khi tạo
              aria-invalid={Boolean(errors.code)}
              className="mt-2 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10 disabled:bg-muted disabled:cursor-not-allowed"
              {...register("code")}
            />
            {errors.code?.message && (
              <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>
            )}
          </label>

          {/* Vùng trồng */}
          <label className="block">
            <span className="text-sm font-medium">Chọn vùng trồng *</span>
            <select
              aria-invalid={Boolean(errors.farmZoneId)}
              className="mt-2 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
              {...register("farmZoneId")}
            >
              <option value="">-- Chọn vùng trồng --</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
            {errors.farmZoneId?.message && (
              <p className="mt-1 text-xs text-destructive">{errors.farmZoneId.message}</p>
            )}
          </label>

          {/* Loại cảm biến */}
          <label className="block">
            <span className="text-sm font-medium">Loại cảm biến *</span>
            <select
              className="mt-2 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              {...register("type")}
              onChange={handleTypeChange}
            >
              <option value="TEMPERATURE">Nhiệt độ (Temperature)</option>
              <option value="AIR_HUMIDITY">Độ ẩm không khí (Air Humidity)</option>
              <option value="SOIL_MOISTURE">Độ ẩm đất (Soil Moisture)</option>
              <option value="LIGHT_INTENSITY">Cường độ ánh sáng (Light)</option>
              <option value="ALL_IN_ONE">Tích hợp đa năng (All-in-one)</option>
            </select>
          </label>

          {/* Đơn vị đo */}
          <label className="block">
            <span className="text-sm font-medium">Đơn vị đo *</span>
            <input
              type="text"
              placeholder="°C, %, Lux..."
              aria-invalid={Boolean(errors.unit)}
              className="mt-2 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
              {...register("unit")}
            />
            {errors.unit?.message && (
              <p className="mt-1 text-xs text-destructive">{errors.unit.message}</p>
            )}
          </label>

          {/* Trạng thái hoạt động */}
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Trạng thái hoạt động *</span>
            <select
              className="mt-2 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              {...register("status")}
            >
              <option value="ACTIVE">Đang hoạt động (Active)</option>
              <option value="INACTIVE">Ngừng hoạt động (Inactive)</option>
              <option value="ERROR">Đang gặp lỗi (Error)</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border bg-background px-4 text-sm font-semibold hover:bg-muted transition"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-semibold text-white transition disabled:opacity-75"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Lưu thiết bị
          </button>
        </div>
      </form>
    </div>
  );
}
