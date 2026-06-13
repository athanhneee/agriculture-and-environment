import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

// This enables ISR: Revalidate the page every 3600 seconds (1 hour).
export const revalidate = 3600;

// This enables SSG: Pre-generate these routes at build time.
export async function generateStaticParams() {
  const guides = ["setup-sensors", "manage-zones", "alert-system"];
  return guides.map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Hướng dẫn: ${slug} | Thành Phát An Smart Farm`,
    description: `Trang hướng dẫn chi tiết cho chủ đề ${slug}. Demo SSG/ISR.`,
  };
}

export default async function FarmGuideDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-dvh bg-background px-5 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/farm-guide"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Quay lại danh sách hướng dẫn
        </Link>

        <section className="mt-8 rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
              <BookOpen className="size-5" />
            </span>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
              SSG / ISR Demo
            </p>
          </div>
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl capitalize">
            {slug.replace("-", " ")}
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Đây là một trang được xây dựng hoàn toàn bằng <strong>SSG (Static Site Generation)</strong> nhờ
            vào hàm <code>generateStaticParams()</code>. Đồng thời, trang này có sử dụng <strong>ISR (Incremental Static Regeneration)</strong> 
            với <code>revalidate = 3600</code>. Nhờ đó, trang web có tốc độ tải siêu nhanh và giảm tải cho máy chủ backend.
          </p>

          <div className="mt-8 prose prose-emerald dark:prose-invert">
            <h3>Nội dung hướng dẫn chi tiết</h3>
            <p>
              Đây là nội dung giả định cho chủ đề <strong>{slug}</strong>. Trong môi trường thực tế, nội dung này
              sẽ được fetch từ CMS (Hệ quản trị nội dung) như Sanity, Strapi hoặc Markdown files.
            </p>
            <ul>
              <li>Bước 1: Kiểm tra kết nối mạng và nguồn điện.</li>
              <li>Bước 2: Cấu hình thông số môi trường tối ưu.</li>
              <li>Bước 3: Lưu và giám sát qua màn hình Dashboard.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
