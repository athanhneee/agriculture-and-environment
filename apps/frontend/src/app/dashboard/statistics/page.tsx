import { Metadata } from "next";
import { getOverviewStats } from "@/lib/dashboard-server";
import { StatisticsClient } from "@/components/dashboard/StatisticsClient";

// Using SSR (dynamic rendering) inherited from dashboard layout


export const metadata: Metadata = {
  title: "Báo cáo Thống kê | Thành Phát An Smart Farm",
  description: "Trang hiển thị biểu đồ phân tích tần suất cảnh báo và thông số cảm biến nông trại.",
};

export default async function StatisticsPage() {
  const overview = await getOverviewStats();

  return <StatisticsClient initialOverview={overview} />;
}
