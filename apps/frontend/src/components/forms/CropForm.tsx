"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";

import { cropsApi, type Crop } from "@/lib/api";
import { cropSchema, type CropFormValues } from "@/lib/validations";

interface CropFormProps {
  initialData?: Crop;
  zones: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

const formatDateForInput = (dateStr?: string | null) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

export function CropForm({ initialData, zones, onSuccess, onCancel }: CropFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isEdit = Boolean(initialData);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      variety: initialData?.variety ?? "",
      plantedDate: formatDateForInput(initialData?.plantedDate),
      expectedHarvestDate: formatDateForInput(initialData?.expectedHarvestDate) || "",
      status: initialData?.status ?? "PLANTED",
      farmZoneId: initialData?.farmZoneId ?? "",
    },
  });

  const onSubmit = async (values: CropFormValues) => {
    setErrorMsg(null);
    try {
      // Chuẩn hóa ngày trước khi gửi lên API (Next.js format ISO string)
      const payload: Partial<Crop> = {
        ...values,
        plantedDate: new Date(values.plantedDate).toISOString(),
        expectedHarvestDate: values.expectedHarvestDate
          ? new Date(values.expectedHarvestDate).toISOString()
          : undefined,
      };

      if (isEdit && initialData) {
        await cropsApi.update(initialData.id, payload);
      } else {
        await cropsApi.create(payload);
      }
      onSuccess();
    } catch (error: any) {
      console.error("Submit crop form failed:", error);
      setErrorMsg(error.message || "Có lỗi xảy ra khi lưu thông tin cây trồng.");
    }
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border bg-card p-6 shadow-lg">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h3 className="text-lg font-bold">
          {isEdit ? "Cập nhật thông tin cây trồng" : "Thêm cây trồng mới"}
        </h3>
        <button
          onClick={onCancel}
          className="rounded-3xl p-1 hover:bg-muted transition text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-3xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Tên cây trồng */}
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Tên cây trồng *</span>
            <input
              type="text"
              placeholder="Cà chua Cherry, Dưa lưới..."
              aria-invalid={Boolean(errors.name)}
              className="mt-2 h-10 w-full rounded-3xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
              {...register("name")}
            />
            {errors.name?.message && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </label>

          {/* Giống cây trồng */}
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Giống cây trồng (Variety) *</span>
            <input
              type="text"
              placeholder="F1 Nhật Bản, Thuần chủng..."
              aria-invalid={Boolean(errors.variety)}
              className="mt-2 h-10 w-full rounded-3xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
              {...register("variety")}
            />
            {errors.variety?.message && (
              <p className="mt-1 text-xs text-destructive">{errors.variety.message}</p>
            )}
          </label>

          {/* Ngày trồng */}
          <label className="block">
            <span className="text-sm font-medium">Ngày trồng *</span>
            <input
              type="date"
              aria-invalid={Boolean(errors.plantedDate)}
              className="mt-2 h-10 w-full rounded-3xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
              {...register("plantedDate")}
            />
            {errors.plantedDate?.message && (
              <p className="mt-1 text-xs text-destructive">{errors.plantedDate.message}</p>
            )}
          </label>

          {/* Ngày thu hoạch dự kiến */}
          <label className="block">
            <span className="text-sm font-medium">Thu hoạch dự kiến</span>
            <input
              type="date"
              aria-invalid={Boolean(errors.expectedHarvestDate)}
              className="mt-2 h-10 w-full rounded-3xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
              {...register("expectedHarvestDate")}
            />
            {errors.expectedHarvestDate?.message && (
              <p className="mt-1 text-xs text-destructive">{errors.expectedHarvestDate.message}</p>
            )}
          </label>

          {/* Vùng trồng */}
          <label className="block">
            <span className="text-sm font-medium">Chọn vùng trồng *</span>
            <select
              aria-invalid={Boolean(errors.farmZoneId)}
              className="mt-2 h-10 w-full rounded-3xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
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

          {/* Trạng thái */}
          <label className="block">
            <span className="text-sm font-medium">Trạng thái cây trồng *</span>
            <select
              className="mt-2 h-10 w-full rounded-3xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              {...register("status")}
            >
              <option value="PLANTED">Mới gieo hạt (Planted)</option>
              <option value="GROWING">Đang phát triển (Growing)</option>
              <option value="HARVESTED">Đã thu hoạch (Harvested)</option>
              <option value="DISEASED">Nhiễm bệnh (Diseased)</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-3xl border bg-background px-4 text-sm font-semibold hover:bg-muted transition"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-semibold text-white transition disabled:opacity-75"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Lưu thông tin
          </button>
        </div>
      </form>
    </div>
  );
}
