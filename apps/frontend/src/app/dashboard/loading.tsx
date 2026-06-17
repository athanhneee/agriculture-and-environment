export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded-full bg-muted" />
            <div className="h-7 w-56 rounded-full bg-muted" />
          </div>
          <div className="h-11 w-36 rounded-3xl bg-muted" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-3.5 w-24 rounded-full bg-muted" />
                <div className="h-8 w-16 rounded-full bg-muted" />
                <div className="h-3 w-20 rounded-full bg-muted" />
              </div>
              <div className="size-11 rounded-3xl bg-muted shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid skeleton */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
          <div className="h-5 w-40 rounded-full bg-muted" />
          <div className="h-3.5 w-64 rounded-full bg-muted" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 w-full rounded-2xl bg-muted/60" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 shadow-sm h-48 bg-muted/30" />
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="h-5 w-24 rounded-full bg-muted mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-muted/60" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
