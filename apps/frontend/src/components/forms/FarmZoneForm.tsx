"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save, UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useEffect, useState } from "react";

import { createFarmZoneAction, updateFarmZoneAction } from "@/app/dashboard/zones/actions";
import { farmZoneSchema, type FarmZoneFormValues } from "@/lib/validations";
import { ImportExcelModal } from "@/components/dashboard/ImportExcelModal";
import type { FarmZone } from "@/lib/api";

interface FarmZoneFormProps {
  initialData?: FarmZone;
}

export function FarmZoneForm({ initialData }: FarmZoneFormProps = {}) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FarmZoneFormValues>({
    resolver: zodResolver(farmZoneSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          area: initialData.area,
          latitude: initialData.latitude,
          longitude: initialData.longitude,
          soilType: initialData.soilType,
          status: initialData.status,
        }
      : {
          name: "",
          description: "",
          area: 0,
          latitude: 10.762622,
          longitude: 106.660172,
          soilType: "",
          status: "ACTIVE",
        },
  });

  const [areaInput, setAreaInput] = useState(initialData ? String(initialData.area) : "");

  useEffect(() => {
    register("area");
  }, [register]);

  const handleAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(",", ".");
    if (!/^\d*\.?\d*$/.test(nextValue)) return;
    setAreaInput(nextValue);
    setValue("area", nextValue === "" ? 0 : Number(nextValue), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: FarmZoneFormValues) => {
    setErrorMsg(null);
    try {
      const res = initialData 
        ? await updateFarmZoneAction(initialData.id, values)
        : await createFarmZoneAction(values);

      if (res.success) {
        router.push(initialData ? `/dashboard/zones/${initialData.id}` : "/dashboard/zones");
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg("Có lỗi xảy ra trong quá trình kết nối với server.");
    }
  };

  const [importSuccess, setImportSuccess] = useState(false);

  return (
    <>
      <div className="w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{initialData ? "Cập nhật vùng trồng" : "Thêm vùng trồng mới"}</h2>
            <p className="text-sm text-muted-foreground">
              {initialData ? "Chỉnh sửa thông tin chi tiết của khu vực giám sát." : "Nhập thông tin chi tiết để thiết lập khu vực giám sát mới."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </button>
        </div>

        {errorMsg ? (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMsg}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Tên vùng trồng *</span>
              <input
                type="text"
                placeholder="Vùng trồng A - Khu vực Phía Bắc"
                aria-invalid={Boolean(errors.name)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                {...register("name")}
              />
              {errors.name?.message ? (
                <p className="mt-2 text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Mô tả</span>
              <textarea
                placeholder="Mô tả cụ thể về giống cây trồng, điều kiện đặc biệt..."
                rows={3}
                className="mt-2 w-full rounded-xl border bg-background p-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                {...register("description")}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Diện tích (ha) *</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="1.5"
                value={areaInput}
                aria-invalid={Boolean(errors.area)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                name="area"
                onChange={handleAreaChange}
                onKeyDown={(event) => {
                  if (["-", "+", "e", "E"].includes(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
              {errors.area?.message ? (
                <p className="mt-2 text-sm text-destructive">{errors.area.message}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium">Loại đất *</span>
              <input
                type="text"
                placeholder="Đất đỏ Bazan, đất sét..."
                aria-invalid={Boolean(errors.soilType)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                {...register("soilType")}
              />
              {errors.soilType?.message ? (
                <p className="mt-2 text-sm text-destructive">{errors.soilType.message}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium">Vĩ độ *</span>
              <input
                type="number"
                step="any"
                placeholder="10.762622"
                aria-invalid={Boolean(errors.latitude)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                {...register("latitude", { valueAsNumber: true })}
              />
              {errors.latitude?.message ? (
                <p className="mt-2 text-sm text-destructive">{errors.latitude.message}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium">Kinh độ *</span>
              <input
                type="number"
                step="any"
                placeholder="106.660172"
                aria-invalid={Boolean(errors.longitude)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                {...register("longitude", { valueAsNumber: true })}
              />
              {errors.longitude?.message ? (
                <p className="mt-2 text-sm text-destructive">{errors.longitude.message}</p>
              ) : null}
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Trạng thái hoạt động *</span>
              <select
                aria-invalid={Boolean(errors.status)}
                className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10"
                {...register("status")}
              >
                <option value="ACTIVE">Đang hoạt động (Active)</option>
                <option value="INACTIVE">Ngừng hoạt động (Inactive)</option>
                <option value="MAINTENANCE">Đang bảo trì (Maintenance)</option>
              </select>
              {errors.status?.message ? (
                <p className="mt-2 text-sm text-destructive">{errors.status.message}</p>
              ) : null}
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-5">
            {/* Import Excel — mở modal */}
            {!initialData ? (
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600/15 dark:text-emerald-400"
              >
                <UploadCloud className="size-4" />
                Import từ Excel
              </button>
            ) : (
              <div></div>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isSubmitting ? "Đang lưu..." : "Lưu vùng trồng"}
            </button>
          </div>
        </form>
      </div>

      {/* Import Excel Modal */}
      <ImportExcelModal
        open={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          if (importSuccess) {
            router.push("/dashboard/zones");
          }
        }}
        onSuccess={(imported) => {
          if (imported > 0) setImportSuccess(true);
        }}
      />
    </>
  );
}
