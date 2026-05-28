"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteFarmZoneAction } from "@/app/dashboard/zones/actions";

interface ZoneActionButtonsProps {
  zoneId: string;
}

export function ZoneActionButtons({ zoneId }: ZoneActionButtonsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vùng trồng này? Mọi dữ liệu liên quan sẽ bị xóa!")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteFarmZoneAction(zoneId);
    
    if (result.success) {
      router.push("/dashboard/zones");
    } else {
      alert(result.message || "Đã xảy ra lỗi khi xóa vùng trồng.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link 
        href={`/dashboard/zones/${zoneId}/edit`}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border bg-card hover:bg-muted px-4 text-xs font-semibold transition"
      >
        <Edit className="size-3.5" />
        Sửa vùng
      </Link>
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive px-4 text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
        {isDeleting ? "Đang xóa..." : "Xóa vùng"}
      </button>
    </div>
  );
}
