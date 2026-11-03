
export default function DashboardLoading() {
  return (
    <div className="mx-auto min-h-[65vh] max-w-5xl animate-pulse px-4 py-10">
     
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-9 w-44 rounded-lg bg-muted" />
          <div className="h-4 w-56 rounded-md bg-muted" />
        </div>

        <div className="h-10 w-36 shrink-0 rounded-full bg-muted" />
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="mt-3 h-9 w-16 rounded-md bg-muted" />
            <div className="mt-4 h-3 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>

     
      <section className="mt-8">
        <div className="h-6 w-36 rounded-md bg-muted" />

        <ul className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
            
              <div className="size-14 shrink-0 rounded-xl bg-muted" />

          
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-40 max-w-full rounded bg-muted" />
                <div className="h-3 w-64 max-w-full rounded bg-muted" />
              </div>

       
              <div className="h-7 w-20 shrink-0 rounded-full bg-muted" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
