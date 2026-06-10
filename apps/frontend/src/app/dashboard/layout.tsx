import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <div className="min-h-dvh md:pl-72">
        <Header />
        <main className="px-4 pb-24 pt-5 sm:px-6 lg:px-8">
          <AuthGuard>{children}</AuthGuard>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
