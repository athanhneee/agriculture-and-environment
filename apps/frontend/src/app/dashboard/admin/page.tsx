import { Metadata } from "next";
import { getOverviewStats } from "@/lib/dashboard-server";
import { AdminOverviewClient } from "@/components/dashboard/AdminOverviewClient";


// Using SSR (dynamic rendering) inherited from dashboard layout

export const metadata: Metadata = {
  title: "Quản trị Hệ thống | Thành Phát An Smart Farm",
  description: "Trang tổng quan dành cho quản trị viên hệ thống.",
};

export default async function AdminDashboardPage() {
  // Bỏ qua check auth chi tiết ở đây vì đã có AuthGuard, nhưng có thể check token để redirect nếu cần
  const overview = await getOverviewStats();

  return <AdminOverviewClient initialOverview={overview} />;
}
