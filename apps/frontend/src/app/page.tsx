import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  BellRing,
  Leaf,
  MapPinned,
  RadioTower,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Wifi,
} from "lucide-react";

import {
  HomeHeroAuthActions,
  HomeNavAuthActions,
} from "@/components/auth/HomeAuthActions";

import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Vùng trồng",
    description:
      "Quản lý khu canh tác, loại cây, diện tích và trạng thái vận hành.",
    icon: Leaf,
    href: "/dashboard/zones",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-500/40",
    arrowColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Cảm biến real-time",
    description:
      "Theo dõi nhiệt độ, độ ẩm, ánh sáng và độ ẩm đất theo thời gian thực.",
    icon: RadioTower,
    href: "/dashboard/sensors",
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
    hoverBorder: "hover:border-sky-300 dark:hover:border-sky-500/40",
    arrowColor: "text-sky-600 dark:text-sky-400",
  },
  {
    title: "Cảnh báo",
    description:
      "Phát hiện sớm chỉ số vượt ngưỡng để xử lý trước khi cây bị ảnh hưởng.",
    icon: BellRing,
    href: "/dashboard/alerts",
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-500/40",
    arrowColor: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Bản đồ",
    description:
      "Xem vị trí vùng trồng, trạm cảm biến và điểm cần kiểm tra.",
    icon: MapPinned,
    href: "/dashboard/map",
    tone: "bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-200",
    hoverBorder: "hover:border-lime-300 dark:hover:border-lime-500/40",
    arrowColor: "text-lime-600 dark:text-lime-400",
  },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get("accessToken")?.value);

  return (
    <main className="min-h-dvh overflow-hidden bg-[linear-gradient(135deg,#f7fee7_0%,#ecfdf5_46%,#f8fafc_100%)] text-emerald-950 dark:bg-[linear-gradient(135deg,#071712_0%,#10231d_52%,#111827_100%)] dark:text-emerald-50">
      <section className="farm-grid mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-6 text-emerald-950/30 sm:px-8 lg:px-10 dark:text-emerald-50/20">
        <header className="flex items-center justify-between gap-4 text-emerald-950 dark:text-emerald-50">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15">
              <Sprout className="size-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold leading-5">
                Smart Farm
              </span>
            </span>
          </Link>

          <HomeNavAuthActions initialIsAuthenticated={isAuthenticated} />
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 text-emerald-950 lg:grid-cols-[0.95fr_1.05fr] lg:py-10 dark:text-emerald-50">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/75 px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-300/15 dark:bg-white/10 dark:text-emerald-100">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Giám sát nông trại thông minh
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Hệ thống Quản lý Nông trại{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Thông minh
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-900/75 dark:text-emerald-50/75 sm:text-lg">
              Hệ thống mô phỏng dashboard giúp người quản lý trang trại theo
              dõi vùng trồng, dữ liệu cảm biến, cảnh báo môi trường.
            </p>
            <HomeHeroAuthActions initialIsAuthenticated={isAuthenticated} />
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 shadow-2xl shadow-emerald-900/10 backdrop-blur dark:border-white/10 dark:bg-white/10">
              <Image
                src="/smart-farm-hero.png"
                alt="Minh họa nông trại thông minh với nhà kính và cảm biến"
                width={1100}
                height={760}
                priority
                className="aspect-[11/7] w-full object-cover"
              />
              <div className="grid gap-3 border-t bg-white/90 p-4 dark:border-white/10 dark:bg-emerald-950/80 sm:grid-cols-3">
                {/* Stat 1: Sensor online với live dot nhấp nháy */}
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/60">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-300">
                    <Wifi className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xl font-bold text-emerald-900 dark:text-emerald-50">24</p>
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                      </span>
                    </div>
                    <p className="text-xs font-medium text-emerald-700/70 dark:text-emerald-300/70">sensor online</p>
                  </div>
                </div>

                {/* Stat 2: Vùng trồng */}
                <div className="flex items-center gap-3 rounded-xl bg-teal-50 p-3 dark:bg-teal-950/60">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-800/50 dark:text-teal-300">
                    <Activity className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-teal-900 dark:text-teal-50">3</p>
                    <p className="text-xs font-medium text-teal-700/70 dark:text-teal-300/70">vùng trồng</p>
                  </div>
                </div>

                {/* Stat 3: Uptime */}
                <div className="flex items-center gap-3 rounded-xl bg-sky-50 p-3 dark:bg-sky-950/60">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-800/50 dark:text-sky-300">
                    <TrendingUp className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-sky-900 dark:text-sky-50">98%</p>
                    <p className="text-xs font-medium text-sky-700/70 dark:text-sky-300/70">uptime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 pb-8 text-emerald-950 sm:grid-cols-2 lg:grid-cols-4 dark:text-emerald-50">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.title}
                href={feature.href}
                className={`group flex flex-col rounded-2xl border border-emerald-100 bg-white/85 p-5 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/10 ${feature.hoverBorder}`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl ${feature.tone}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <ArrowRight
                    className={`size-4 translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 ${feature.arrowColor}`}
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-base font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-900/70 dark:text-emerald-50/70">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </section>
      </section>
    </main>
  );
}
