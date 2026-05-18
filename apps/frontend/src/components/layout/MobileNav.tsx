"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Leaf, Map, Radio } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { title: "Home", href: "/dashboard", icon: Home },
  { title: "Vùng", href: "/dashboard/fields/north-greenhouse", icon: Leaf },
  { title: "Sensor", href: "/dashboard/sensors", icon: Radio },
  { title: "Alert", href: "/dashboard/alerts", icon: Bell },
  { title: "Map", href: "/dashboard/map", icon: Map },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border bg-card/95 p-2 shadow-2xl backdrop-blur md:hidden">
      {items.map((item) => {
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
              "flex h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
