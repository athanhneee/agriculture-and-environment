import { Metadata } from "next";
import { FarmZoneForm } from "@/components/forms/FarmZoneForm";

export const metadata: Metadata = {
  title: "Thêm Vùng Trồng Mới | Smart Farm Monitoring System",
  description: "Thiết lập và đăng ký vùng trồng trọt mới để quản lý chỉ số cảm biến và thời tiết.",
};

export default function NewFarmZonePage() {
  return (
    <div className="flex justify-center py-4">
      <FarmZoneForm />
    </div>
  );
}
