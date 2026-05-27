import { Metadata } from "next";
import { getOverviewStats } from "@/lib/dashboard-server";
import { AdminOverviewClient } from "@/components/dashboard/AdminOverviewClient";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Quản trị Hệ thống | Smart Farm Monitoring System",
  description: "Trang tổng quan dành cho quản trị viên hệ thống.",
};

export default async function AdminDashboardPage() {
  // Bỏ qua check auth chi tiết ở đây vì đã có AuthGuard, nhưng có thể check token để redirect nếu cần
  const overview = await getOverviewStats();

  return <AdminOverviewClient initialOverview={overview} />;
}
