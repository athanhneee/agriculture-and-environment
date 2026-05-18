"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  Leaf,
  LucideIcon,
  Map,
  Radio,
  Sprout,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { title: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { title: "Vùng trồng", href: "/dashboard/fields/north-greenhouse", icon: Leaf },
  { title: "Cảm biến", href: "/dashboard/sensors", icon: Radio },
  { title: "Cảnh báo", href: "/dashboard/alerts", icon: Bell },
  { title: "Bản đồ", href: "/dashboard/map", icon: Map },
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
              ? pathname === item.href
              : pathname.startsWith(item.href.split("/").slice(0, 3).join("/"));

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
        <p className="font-semibold">Demo dữ liệu</p>
        <p className="mt-2 leading-6 text-muted-foreground">
          UI đang dùng dữ liệu tĩnh để nhóm dễ nối API ở bước sau.
        </p>
      </div>
    </aside>
  );
}
