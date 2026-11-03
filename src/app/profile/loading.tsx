
export default function ProfileLoading() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background text-foreground">
      <div className="mx-auto w-full max-w-2xl animate-pulse px-4 py-12 sm:px-6 lg:py-16">

  
        <section className="flex flex-col items-center text-center">

      
          <div className="size-28 rounded-full border-2 border-border bg-muted p-1">
            <div className="size-full rounded-full bg-muted-foreground/15" />
          </div>

          <div className="mt-5 h-7 w-40 rounded-md bg-muted" />

       
          <div className="mt-2 h-4 w-52 rounded-md bg-muted" />

         
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-7 w-28 rounded-full bg-muted" />
            <div className="h-7 w-20 rounded-full bg-muted" />
          </div>

       
          <div className="mt-5 h-9 w-28 rounded-full bg-muted" />
        </section>

       
        <dl className="mt-10 grid grid-cols-2 gap-y-5 border-y border-border py-5 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-border">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="sm:px-5 sm:first:pl-0 sm:last:pr-0"
            >
              <div className="h-7 w-12 rounded-md bg-muted" />
              <div className="mt-2 h-3 w-20 max-w-full rounded bg-muted" />
            </div>
          ))}
        </dl>

      
        <section className="mt-10">
          <div className="h-6 w-36 rounded-md bg-muted" />

          <dl className="mt-3 divide-y divide-border border-y border-border">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-6 py-4"
              >
              
                <div className="h-4 w-16 rounded bg-muted" />

              
                <div className="h-4 w-36 max-w-[70%] rounded bg-muted" />
              </div>
            ))}
          </dl>
        </section>

      </div>
    </div>
  );
}
