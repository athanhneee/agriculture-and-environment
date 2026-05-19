import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Leaf,
  MapPinned,
  RadioTower,
  ShieldCheck,
  Sprout,
} from "lucide-react";

const features = [
  {
    title: "Vùng trồng",
    description: "Quản lý khu canh tác, loại cây, diện tích và trạng thái vận hành.",
    icon: Leaf,
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
  },
  {
    title: "Cảm biến real-time",
    description: "Theo dõi nhiệt độ, độ ẩm, ánh sáng và độ ẩm đất theo thời gian thực.",
    icon: RadioTower,
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
  },
  {
    title: "Cảnh báo",
    description: "Phát hiện sớm chỉ số vượt ngưỡng để xử lý trước khi cây bị ảnh hưởng.",
    icon: BellRing,
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
  },
  {
    title: "Bản đồ",
    description: "Xem vị trí vùng trồng, trạm cảm biến và điểm cần kiểm tra.",
    icon: MapPinned,
    tone: "bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-200",
  },
];

export default function HomePage() {
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
              <span className="block text-xs font-medium text-emerald-700 dark:text-emerald-200">
                INT1334 Web Project
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-white/70 dark:text-emerald-100 dark:hover:bg-white/10 sm:inline-flex"
            >
              Đăng nhập
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800"
            >
              Dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 text-emerald-950 lg:grid-cols-[0.95fr_1.05fr] lg:py-10 dark:text-emerald-50">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/75 px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-300/15 dark:bg-white/10 dark:text-emerald-100">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Giám sát nông trại thông minh
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Smart Farm Monitoring System
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-900/75 dark:text-emerald-50/75 sm:text-lg">
              Hệ thống frontend mô phỏng dashboard giúp người quản lý trang trại
              theo dõi vùng trồng, dữ liệu cảm biến, cảnh báo môi trường và bản
              đồ vận hành trong một giao diện responsive.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white shadow-xl shadow-emerald-900/15 transition hover:bg-emerald-800"
              >
                Xem dashboard
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white/80 px-6 text-sm font-semibold text-emerald-900 transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-emerald-50 dark:hover:bg-white/15"
              >
                Tạo tài khoản demo
              </Link>
            </div>
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
                {[
                  ["24", "sensor online"],
                  ["3", "vùng trồng"],
                  ["98%", "uptime"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl bg-muted p-3">
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 pb-8 text-emerald-950 sm:grid-cols-2 lg:grid-cols-4 dark:text-emerald-50">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-emerald-100 bg-white/85 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/10"
              >
                <div
                  className={`mb-4 flex size-11 items-center justify-center rounded-xl ${feature.tone}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h2 className="text-base font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-900/70 dark:text-emerald-50/70">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
