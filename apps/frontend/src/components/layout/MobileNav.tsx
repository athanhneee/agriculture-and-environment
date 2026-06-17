"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  BellRing,
  LayoutDashboard,
  Leaf,
  MapPinned,
  RadioTower,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ── side items (left & right of center button) ─────────────── */
const leftItems = [
  {
    href: "/dashboard/zones",
    match: "/dashboard/zones",
    icon: Leaf,
  },
  {
    href: "/dashboard/sensors",
    match: "/dashboard/sensors",
    icon: RadioTower,
  },
];

const rightItems = [
  {
    href: "/dashboard/statistics",
    match: "/dashboard/statistics",
    icon: BarChart,
  },
  {
    href: "/dashboard/alerts",
    match: "/dashboard/alerts",
    icon: BellRing,
  },
  {
    href: "/dashboard/map",
    match: "/dashboard/map",
    icon: MapPinned,
  },
];

/* ── centre "Tổng quan" item ────────────────────────────────── */
const centerItem = {
  href: "/dashboard",
  match: "/dashboard",
  icon: LayoutDashboard,
};

export function MobileNav() {
  const pathname = usePathname();

  const isActiveCheck = (href: string, match: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(match);

  const renderSideItem = (item: (typeof leftItems)[number]) => {
    const Icon = item.icon;
    const isActive = isActiveCheck(item.href, item.match);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
          isActive
            ? "text-[#2e7d32]"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className="size-[22px]" strokeWidth={isActive ? 2.4 : 1.8} aria-hidden="true" />
      </Link>
    );
  };

  /* ── centre floating button ───────────────────────────────── */
  const CenterIcon = centerItem.icon;
  const centerActive = isActiveCheck(centerItem.href, centerItem.match);

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 md:hidden">
      {/* bar */}
      <div className="relative flex items-center justify-between rounded-2xl border bg-card/95 px-3 py-2 shadow-2xl backdrop-blur">
        {/* left group */}
        <div className="flex items-center gap-2">
          {leftItems.map(renderSideItem)}
        </div>

        {/* centre spacer */}
        <div className="w-14 shrink-0" />

        {/* right group */}
        <div className="flex items-center gap-2">
          {rightItems.map(renderSideItem)}
        </div>
      </div>

      {/* floating centre button – overlaps the bar */}
      <Link
        href={centerItem.href}
        className={cn(
          "absolute left-1/2 -translate-x-1/2 -top-4 flex size-[56px] items-center justify-center rounded-full shadow-lg ring-4 ring-card/95 transition-transform active:scale-95",
          centerActive
            ? "bg-[#2e7d32] text-white"
            : "bg-[#2e7d32]/85 text-white/90 hover:bg-[#2e7d32]",
        )}
      >
        <CenterIcon className="size-6" strokeWidth={2} aria-hidden="true" />
      </Link>
    </nav>
  );
}
