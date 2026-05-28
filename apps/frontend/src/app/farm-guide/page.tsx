import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Leaf, RadioTower, ShieldAlert } from "lucide-react";
import { AIAssistantChat } from "./AIAssistantChat";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Hướng dẫn Smart Farm | Smart Farm Monitoring",
    description:
        "Trang hướng dẫn tĩnh có ISR, dùng để chứng minh rendering strategy ngoài SSR trong đồ án.",
};

const guideItems = [
    {
        title: "Theo dõi cảm biến",
        description:
            "Dashboard nhận dữ liệu nhiệt độ, độ ẩm không khí, độ ẩm đất và ánh sáng theo thời gian thực.",
        icon: RadioTower,
    },
    {
        title: "Quản lý vùng trồng",
        description:
            "Mỗi vùng trồng có diện tích, tọa độ bản đồ, loại đất, cây trồng và cảm biến được gán.",
        icon: Leaf,
    },
    {
        title: "Cảnh báo bất thường",
        description:
            "Khi chỉ số vượt ngưỡng, backend tự sinh cảnh báo môi trường hoặc nguy cơ sâu bệnh.",
        icon: ShieldAlert,
    },
];

export default function FarmGuidePage() {
    return (
        <main className="min-h-dvh bg-background px-5 py-10 text-foreground">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
                >
                    <ArrowLeft className="size-4" />
                    Về trang chủ
                </Link>

                <section className="mt-8 rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                        ISR Demo
                    </p>
                    <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                        Hướng dẫn vận hành hệ thống Smart Farm
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                        Trang này dùng Incremental Static Regeneration với revalidate 3600
                        giây. Có thể ghi vào báo cáo rằng dự án dùng SSR cho dashboard dữ
                        liệu thật và ISR cho trang nội dung hướng dẫn.
                    </p>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {guideItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <article
                                key={item.title}
                                className="rounded-2xl border bg-card p-5 shadow-sm"
                            >
                                <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
                                    <Icon className="size-5" />
                                </span>
                                <h2 className="mt-4 font-semibold">{item.title}</h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {item.description}
                                </p>
                            </article>
                        );
                    })}
                </section>
                <AIAssistantChat />
            </div>
        </main>
    );
}