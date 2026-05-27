export default function AlertsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="rounded-3xl border bg-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-3.5 w-20 rounded-full bg-muted" />
            <div className="h-8 w-64 rounded-full bg-muted" />
          </div>
          <div className="h-11 w-32 rounded-2xl bg-muted" />
        </div>
      </div>

      {/* Alert cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-3 flex-1">
              <div className="size-11 rounded-2xl bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 rounded-full bg-muted" />
                <div className="h-3.5 w-36 rounded-full bg-muted/70" />
                <div className="h-3.5 w-full rounded-full bg-muted/60 mt-2" />
                <div className="h-3.5 w-2/3 rounded-full bg-muted/60" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
