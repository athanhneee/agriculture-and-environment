export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Skeleton header */}
      <div className="rounded-2xl border bg-card p-6 animate-pulse space-y-3">
        <div className="h-4 w-1/4 rounded bg-muted" />
        <div className="h-7 w-2/5 rounded bg-muted" />
        <div className="h-4 w-3/5 rounded bg-muted" />
      </div>

      {/* Skeleton grid cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border bg-card p-5 shadow-sm animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="size-8 rounded bg-muted" />
            </div>
            <div className="h-8 w-12 rounded bg-muted" />
            <div className="h-3 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Skeleton chart panel */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="h-80 rounded-2xl border bg-card p-5 animate-pulse space-y-4">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-60 w-full rounded bg-muted/40" />
        </div>
        <div className="h-80 rounded-2xl border bg-card p-5 animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-60 w-full rounded bg-muted/40" />
        </div>
      </div>
    </div>
  );
}
