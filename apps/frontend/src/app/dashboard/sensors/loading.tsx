export default function SensorsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded-full bg-muted" />
          <div className="h-4 w-80 rounded-full bg-muted" />
        </div>
        <div className="h-10 w-32 rounded-3xl bg-muted" />
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap gap-3 rounded-2xl border bg-card p-4">
        <div className="h-9 w-28 rounded-3xl bg-muted" />
        <div className="h-9 w-36 rounded-3xl bg-muted" />
        <div className="h-9 w-32 rounded-3xl bg-muted" />
        <div className="ml-auto h-9 w-9 rounded-3xl bg-muted" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="h-12 w-full bg-muted/50" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t px-6 py-4">
            <div className="h-4 flex-[2] rounded-full bg-muted/70" />
            <div className="h-4 flex-1 rounded-full bg-muted/60" />
            <div className="h-4 flex-[1.5] rounded-full bg-muted/60" />
            <div className="h-4 flex-[1.5] rounded-full bg-muted/60" />
            <div className="h-4 w-12 rounded-full bg-muted/60" />
            <div className="h-6 w-20 rounded-full bg-muted/70" />
            <div className="flex gap-2 ml-auto">
              <div className="size-8 rounded-3xl bg-muted/60" />
              <div className="size-8 rounded-3xl bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
