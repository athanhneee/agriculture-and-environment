import { Metadata } from "next";
import { ImportFarmZonesClient } from "@/components/dashboard/ImportFarmZonesClient";

export const metadata: Metadata = {
  title: "Import dữ liệu | Smart Farm Monitoring System",
  description: "Nhập nhanh dữ liệu vùng trồng từ Excel, CSV hoặc TXT.",
};

export default function ImportPage() {
  return <ImportFarmZonesClient />;
}
