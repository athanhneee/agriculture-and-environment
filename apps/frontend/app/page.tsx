const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            INT1334 - Lap trinh Web
          </p>
          <h1 className="text-3xl font-bold text-slate-950 sm:text-5xl">
            Smart Farm Monitoring System
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">
            Khoi tao frontend Next.js App Router cho he thong giam sat vung trong,
            cam bien moi truong, canh bao va dashboard theo thoi gian thuc.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Frontend", "Next.js App Router + Tailwind CSS"],
            ["Backend", "Express REST API + JWT"],
            ["Realtime", "Socket.io/SSE cho du lieu cam bien"]
          ].map(([title, description]) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={title}
            >
              <h2 className="font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>

        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Backend API local: <code>{apiUrl}</code>
        </p>
      </section>
    </main>
  );
}
