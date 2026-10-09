export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="border-b border-border pb-6">
        <div className="h-4 w-28 animate-pulse bg-muted" />

        <div className="mt-3 h-8 w-64 animate-pulse bg-muted" />

        <div className="mt-3 h-4 w-96 max-w-full animate-pulse bg-muted" />
      </section>

      <section>
        <div className="mb-4 h-4 w-32 animate-pulse bg-muted" />

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 bg-card" />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="h-72 border border-border bg-card" />
        <div className="h-72 border border-border bg-card" />
      </section>

      <section className="h-80 border border-border bg-card" />
    </div>
  );
}
