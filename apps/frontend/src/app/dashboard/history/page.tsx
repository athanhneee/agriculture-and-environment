import { Metadata } from "next";
import { getFarmZones } from "@/lib/farm-zones-server";
import { HistoryClient } from "@/components/dashboard/HistoryClient";

// LƯU Ý VỀ CHIẾN LƯỢC RENDERING (Rendering Strategy):
// Trang Lịch sử dữ liệu cảm biến (Sensor History) sử dụng kết hợp:
// 1. SSR (Server Side Rendering) cho danh sách Vùng trồng ban đầu để tối ưu SEO và bảo mật token cookie.
// 2. Client-side Fetching cho dữ liệu lịch sử và các biểu đồ Recharts, vì trang này phụ thuộc hoàn toàn vào 
//    bộ lọc khoảng ngày (from/to) và vùng trồng do người dùng thao tác liên tục ở phía Client.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lịch sử Dữ liệu Cảm biến | Smart Farm Monitoring System",
  description: "Tra cứu chỉ số đo đạc cảm biến môi trường theo thời gian và xuất báo cáo Excel định kỳ.",
};

export default async function HistoryPage() {
  const zones = await getFarmZones();

  const formattedZones = zones.map((z) => ({
    id: z.id,
    name: z.name,
  }));

  return <HistoryClient initialZones={formattedZones} />;
}
