import { Metadata } from "next";
import { getFarmZones } from "@/lib/farm-zones-server";
import { CropsClient } from "@/components/dashboard/CropsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quản lý Cây Trồng | Smart Farm Monitoring System",
  description: "Trang quản lý danh sách cây trồng, theo dõi quá trình sinh trưởng và lập lịch trình thu hoạch.",
};

export default async function CropsPage() {
  const zones = await getFarmZones();

  // Chỉ lấy ID và tên vùng để truyền vào client dropdown
  const formattedZones = zones.map((z) => ({
    id: z.id,
    name: z.name,
  }));

  return <CropsClient initialZones={formattedZones} />;
}
