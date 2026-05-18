import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Leaf,
  Map,
  Radio,
  ShieldCheck,
  Sprout,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "Vùng trồng",
      description: "Quản lý từng khu canh tác, loại cây và trạng thái chăm sóc.",
      icon: Leaf,
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
    },
    {
      title: "Cảm biến real-time",
      description: "Theo dõi nhiệt độ, độ ẩm, ánh sáng và độ ẩm đất theo thời gian thực.",
      icon: Radio,
      tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
    },
    {
      title: "Cảnh báo",
      description: "Nhận tín hiệu sớm khi chỉ số vượt ngưỡng an toàn.",
      icon: Bell,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200",
    },
    {
      title: "Bản đồ",
      description: "Quan sát vị trí vùng trồng, trạm cảm biến và điểm cần xử lý.",
      icon: Map,
      tone: "bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-200",
    },
  ];

  return (
    <main className="min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),linear-gradient(135deg,#f7fee7_0%,#ecfdf5_42%,#f8fafc_100%)] text-emerald-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.16),transparent_34%),linear-gradient(135deg,#071b14_0%,#10241f_45%,#111827_100%)] dark:text-emerald-50">
      <section className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/15">
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
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-white/70 dark:text-emerald-100 dark:hover:bg-white/10 sm:inline-flex"
            >
              Đăng nhập
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800"
            >
              Dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-3 py-1 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-300/15 dark:bg-white/10 dark:text-emerald-100">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Giám sát nông trại thông minh
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Smart Farm Monitoring System
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-900/75 dark:text-emerald-50/75 sm:text-lg">
              Hệ thống frontend mô phỏng dashboard giúp người quản lý trang trại
              theo dõi vùng trồng, cảm biến IoT, cảnh báo môi trường và bản đồ
              vận hành trong một giao diện responsive.
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
                className="inline-flex h-12 items-center justify-center rounded-xl border border-emerald-200 bg-white/75 px-6 text-sm font-semibold text-emerald-900 transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-emerald-50 dark:hover:bg-white/15"
              >
                Tạo tài khoản mẫu
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-emerald-900/10 backdrop-blur dark:border-white/10 dark:bg-white/10">
              <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-950 p-5 text-white dark:border-white/10">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-100/70">Farm Overview</p>
                    <h2 className="text-2xl font-semibold">Khu A - Nhà kính</h2>
                  </div>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                    Online
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Độ ẩm đất 68%", "Nhiệt độ 27°C", "Ánh sáng 820 lux", "Gió 6 km/h"].map(
                    (item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/10 p-4"
                      >
                        <Activity className="mb-4 size-5 text-lime-200" />
                        <p className="text-sm font-medium">{item}</p>
                      </div>
                    ),
                  )}
                </div>
                <div className="mt-4 rounded-2xl border border-amber-200/20 bg-amber-300/15 p-4 text-amber-50">
                  <p className="text-sm font-semibold">Cảnh báo gần nhất</p>
                  <p className="mt-1 text-sm text-amber-50/75">
                    Độ ẩm đất khu B giảm dưới ngưỡng khuyến nghị.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/10"
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
