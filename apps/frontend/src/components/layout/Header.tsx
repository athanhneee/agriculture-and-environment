import { Bell, ChevronDown, Search, UserCircle } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/88 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Smart Farm Dashboard
          </p>
          <h1 className="text-base font-semibold sm:text-lg">
            Giám sát trang trại
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden h-10 w-72 items-center gap-2 rounded-xl border bg-card px-3 text-sm text-muted-foreground lg:flex">
            <Search className="size-4" aria-hidden="true" />
            Tìm vùng trồng, cảm biến...
          </div>
          <button
            type="button"
            aria-label="Thông báo"
            className="flex size-10 items-center justify-center rounded-xl border bg-card text-muted-foreground transition hover:text-foreground"
          >
            <Bell className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-xl border bg-card px-2 text-sm font-medium transition hover:bg-muted sm:px-3"
          >
            <UserCircle className="size-5 text-emerald-700 dark:text-emerald-300" />
            <span className="hidden sm:inline">User demo</span>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:inline" />
          </button>
        </div>
      </div>
    </header>
  );
}
