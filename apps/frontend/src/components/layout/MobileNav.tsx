"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  BellRing,
  CircleUserRound,
  LayoutDashboard,
  Leaf,
  MapPinned,
  RadioTower,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";

/* ── nav item type ──────────────────────────────────────────── */
type NavItem = {
  href: string;
  match: string;
  icon: LucideIcon;
  label: string;
  isCenter?: boolean;
};

/* ── farmer nav: 3 left + [center] + 3 right ────────────────── */
const farmerItems: NavItem[] = [
  { href: "/dashboard/zones",      match: "/dashboard/zones",      icon: Leaf,            label: "Vùng trồng" },
  { href: "/dashboard/sensors",    match: "/dashboard/sensors",    icon: RadioTower,      label: "Cảm biến" },
  { href: "/dashboard/statistics", match: "/dashboard/statistics", icon: BarChart,         label: "Thống kê" },
  { href: "/dashboard",            match: "/dashboard",            icon: LayoutDashboard, label: "Tổng quan",  isCenter: true },
  { href: "/dashboard/alerts",     match: "/dashboard/alerts",     icon: BellRing,         label: "Cảnh báo" },
  { href: "/dashboard/map",        match: "/dashboard/map",        icon: MapPinned,        label: "Bản đồ" },
  { href: "/dashboard/profile",    match: "/dashboard/profile",    icon: CircleUserRound,  label: "Hồ sơ" },
];

/* ── admin nav: 3 left + [center] + 3 right ─────────────────── */
const adminItems: NavItem[] = [
  { href: "/dashboard/zones",       match: "/dashboard/zones",       icon: Leaf,            label: "Vùng trồng" },
  { href: "/dashboard/sensors",     match: "/dashboard/sensors",     icon: RadioTower,      label: "Cảm biến" },
  { href: "/dashboard/statistics",  match: "/dashboard/statistics",  icon: BarChart,         label: "Thống kê" },
  { href: "/dashboard/admin",       match: "/dashboard/admin",       icon: LayoutDashboard, label: "Tổng quan",   isCenter: true },
  { href: "/dashboard/alerts",      match: "/dashboard/alerts",      icon: BellRing,         label: "Cảnh báo" },
  { href: "/dashboard/admin/users", match: "/dashboard/admin/users", icon: Users,            label: "Người dùng" },
  { href: "/dashboard/profile",     match: "/dashboard/profile",     icon: CircleUserRound,  label: "Hồ sơ" },
];

export function MobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const items = isAdmin ? adminItems : farmerItems;

  const isActiveCheck = (href: string, match: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/admin" && match === "/dashboard/admin")
      return pathname === "/dashboard/admin";
    return pathname.startsWith(match);
  };

  const centerItem = items.find((i) => i.isCenter)!;
  const sideItems = items.filter((i) => !i.isCenter);
  const leftItems = sideItems.slice(0, 3);
  const rightItems = sideItems.slice(3);
  const centerActive = isActiveCheck(centerItem.href, centerItem.match);
  const CenterIcon = centerItem.icon;

  return (
    <nav
      className="lg-nav-wrapper md:!hidden"
      aria-label="Điều hướng chính trên điện thoại"
    >
      <div className="lg-nav">
        {/* icon grid: 3 left + spacer + 3 right */}
        <div className="lg-nav-grid">
          {leftItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveCheck(item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`lg-nav-item${active ? " active" : ""}`}
              >
                <span className="lg-nav-icon-box">
                  <Icon />
                </span>
              </Link>
            );
          })}

          <span className="lg-nav-spacer" aria-hidden="true" />

          {rightItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveCheck(item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`lg-nav-item${active ? " active" : ""}`}
              >
                <span className="lg-nav-icon-box">
                  <Icon />
                </span>
              </Link>
            );
          })}
        </div>

        {/* floating center button */}
        <Link
          href={centerItem.href}
          aria-label={centerItem.label}
          className={`lg-nav-center${centerActive ? " active" : ""}`}
        >
          <span className="lg-nav-center-btn">
            <CenterIcon />
          </span>
        </Link>
      </div>
    </nav>
  );
}
