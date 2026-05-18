import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";

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
        <main className="px-4 pb-24 pt-5 sm:px-6 lg:px-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
