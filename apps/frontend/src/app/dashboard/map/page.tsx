import { Metadata } from "next";
import MapClient from "@/components/dashboard/MapClient";
import { getFarmZones } from "@/lib/farm-zones-server";

// Ép kiểu render dynamic phía máy chủ để lấy thông tin vùng mới nhất
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bản đồ Vùng Trồng | Smart Farm Monitoring System",
  description: "Trang bản đồ tương tác hiển thị định vị GPS các vùng trồng trọt và thiết bị cảm biến IoT.",
};

export default async function MapPage() {
  const zones = await getFarmZones();

  return <MapClient zones={zones} />;
}
