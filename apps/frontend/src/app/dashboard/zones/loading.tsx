export default function ZonesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-full bg-muted" />
          <div className="h-4 w-64 rounded-full bg-muted" />
        </div>
        <div className="h-11 w-36 rounded-xl bg-muted" />
      </div>

      {/* Search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-11 flex-1 rounded-xl bg-muted" />
        <div className="h-11 w-40 rounded-xl bg-muted" />
      </div>

      {/* Zone cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-36 rounded-full bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded-full bg-muted/70" />
              <div className="h-3.5 w-3/4 rounded-full bg-muted/70" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-14 rounded-xl bg-muted/60" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
