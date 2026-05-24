import { Metadata } from "next";
import { getFarmZones } from "@/lib/farm-zones-server";
import { SensorsClient } from "@/components/dashboard/SensorsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quản lý Cảm Biến | Smart Farm Monitoring System",
  description: "Trang đăng ký và quản lý thiết bị cảm biến IoT trong trang trại nông nghiệp.",
};

export default async function SensorsPage() {
  const zones = await getFarmZones();

  // Định dạng lại danh sách vùng trồng
  const formattedZones = zones.map((z) => ({
    id: z.id,
    name: z.name,
  }));

  return <SensorsClient initialZones={formattedZones} />;
}
