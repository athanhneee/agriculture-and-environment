"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  LayoutDashboard,
  Leaf,
  LucideIcon,
  MapPinned,
  RadioTower,
  Sprout,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  match: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    match: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Vùng trồng",
    href: "/dashboard/zones",
    match: "/dashboard/zones",
    icon: MapPinned,
  },
  {
    title: "Cây trồng",
    href: "/dashboard/crops",
    match: "/dashboard/crops",
    icon: Leaf,
  },
  {
    title: "Cảm biến",
    href: "/dashboard/sensors",
    match: "/dashboard/sensors",
    icon: RadioTower,
  },
  {
    title: "Cảnh báo",
    href: "/dashboard/alerts",
    match: "/dashboard/alerts",
    icon: BellRing,
  },
  {
    title: "Bản đồ",
    href: "/dashboard/map",
    match: "/dashboard/map",
    icon: MapPinned,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-sidebar px-4 py-5 text-sidebar-foreground md:flex md:flex-col">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <Sprout className="size-6" aria-hidden="true" />
        </span>
        <span>
          <span className="block font-semibold leading-5">Smart Farm</span>
          <span className="block text-xs text-muted-foreground">
            Monitoring System
          </span>
        </span>
      </Link>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.match);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border bg-white/55 p-4 text-sm shadow-sm dark:bg-white/5">
        <p className="font-semibold">Frontend foundation</p>
        <p className="mt-2 leading-6 text-muted-foreground">
          Dữ liệu hiện là mock tĩnh để phần sau nối API gọn hơn.
        </p>
      </div>
    </aside>
  );
}
