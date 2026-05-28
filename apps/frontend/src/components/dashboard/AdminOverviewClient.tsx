"use client";

import { Users, LayoutDashboard, RadioTower, BellRing, MapPinned, Sprout } from "lucide-react";
import { type OverviewStats } from "@/lib/dashboard-server";
import { useAuthStore } from "@/stores/auth.store";

interface AdminOverviewClientProps {
  initialOverview: OverviewStats;
}

export function AdminOverviewClient({ initialOverview }: AdminOverviewClientProps) {
  const user = useAuthStore((state) => state.user);
  
  if (user?.role !== "ADMIN") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-2xl bg-destructive/10 p-6 text-destructive">
          <ShieldAlertIcon className="mx-auto size-12 mb-4" />
          <h2 className="text-xl font-bold">Truy cập bị từ chối</h2>
          <p className="mt-2 text-sm">Bạn không có quyền truy cập trang quản trị này.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng số Người dùng",
      value: initialOverview.usersCount.toString(),
      icon: Users,
      description: "Tài khoản nông dân",
      tone: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-200",
    },
    {
      title: "Tổng Vùng trồng",
      value: initialOverview.zonesCount.toString(),
      icon: MapPinned,
      description: "Trên toàn hệ thống",
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
    },
    {
      title: "Tổng Thiết bị IoT",
      value: initialOverview.sensorsCount.toString(),
      icon: RadioTower,
      description: "Cảm biến đã đăng ký",
      tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
    },
    {
      title: "Tổng số Cây trồng",
      value: initialOverview.cropsCount.toString(),
      icon: Sprout,
      description: "Lịch trình canh tác",
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
    },
    {
      title: "Cảnh báo chưa xử lý",
      value: initialOverview.openAlertsCount.toString(),
      icon: BellRing,
      description: "Toàn hệ thống",
      tone: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản trị Hệ thống</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Giám sát tài nguyên và hoạt động tổng thể của nền tảng Smart Farm Monitoring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border bg-card p-5 shadow-sm transition hover:border-emerald-500/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground line-clamp-1">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                </div>
                <div className={`flex size-10 items-center justify-center rounded-xl ${card.tone}`}>
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
        <LayoutDashboard className="mx-auto size-12 opacity-20 mb-4" />
        <h3 className="font-semibold text-lg text-foreground">Không gian Quản trị viên</h3>
        <p className="mt-2 text-sm max-w-md mx-auto">
          Trang này cung cấp cái nhìn toàn cảnh về tài nguyên hệ thống. Chức năng quản lý tài khoản và cấu hình hệ thống chuyên sâu sẽ được cập nhật trong các phiên bản tiếp theo.
        </p>
      </div>
    </div>
  );
}

function ShieldAlertIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
