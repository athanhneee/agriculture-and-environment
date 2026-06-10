import { Metadata } from "next";
import { ImportFarmZonesClient } from "@/components/dashboard/ImportFarmZonesClient";

export const metadata: Metadata = {
  title: "Nhập Dữ Liệu Excel | Thành Phát An Smart Farm",
  description: "Nhập nhanh dữ liệu vùng trồng từ Excel, CSV hoặc TXT.",
};

export default function ImportPage() {
  return <ImportFarmZonesClient />;
}
