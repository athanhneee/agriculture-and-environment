import { Metadata } from "next";
import {
  getLatestSensorReading,
  getOpenAlerts,
  getOverviewStats,
} from "@/lib/dashboard-server";
import { OverviewClient } from "@/components/dashboard/OverviewClient";

// Ép kiểu render dynamic phía máy chủ (SSR - no-store) 
// Vì các chỉ số cảm biến nông nghiệp và cảnh báo biến thiên liên tục từng giây qua Socket.io
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tổng quan Dashboard | Smart Farm Monitoring System",
  description: "Trang giám sát tổng hợp nông trại thông minh, cập nhật thông số cảm biến thời gian thực.",
};

export default async function DashboardPage() {
  // Lấy dữ liệu ban đầu từ các API thông qua cookies xác thực phía server
  const [stats, latestReading, openAlerts] = await Promise.all([
    getOverviewStats(),
    getLatestSensorReading(),
    getOpenAlerts(),
  ]);

  return (
    <OverviewClient
      initialStats={stats}
      initialLatestReading={latestReading}
      initialAlerts={openAlerts}
    />
  );
}
