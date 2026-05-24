export default function Loading() {
  return (
    <main className="min-h-dvh bg-background px-5 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border bg-card"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl border bg-card" />
      </div>
    </main>
  );
}
