import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

// A studio document as it comes back from the Express API (GET /studios).
export type Studio = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  hourlyRate: number;
  location: {
    city: string;
    area: string;
    address: string;
  };
  imageUrl: string;
  rating: number;
  reviewCount: number;
  status: string;
};

const API_URL = process.env.API_URL ?? "http://localhost:8000";

// Grab every studio, keep the approved ones, then take the 6 best rated.
async function getFeaturedStudios(): Promise<Studio[]> {
  const res = await fetch(`${API_URL}/featured`, { cache: "no-store" });

  if (!res.ok) {
    return [];
  }

  const studios: Studio[] = await res.json();

  return studios
    .filter((studio) => studio.status === "approved")
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6)
    .map((studio) => ({
      ...studio,
       imageUrl: `${studio.imageUrl}?auto=format&fit=crop&w=800&q=80`,
    }));
}

export function StudioCard({ studio }: { studio: Studio }) {
  return (
    <article className="group flex flex-col rounded-lg border border-white/10 bg-white/[0.04] p-2">
      <div className="relative aspect-[5/3] overflow-hidden rounded-lg bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
        <Image
          src={studio.imageUrl}
          alt={studio.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-1 pt-4">
        <span className="w-fit rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-neutral-200">
          {studio.category}
        </span>

        <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.01em] text-white">
          {studio.title}
        </h3>
        <p className="mt-1 text-[13px] text-neutral-400">
          {studio.location.area}, {studio.location.city}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="text-[17px] font-semibold text-white">
            ${studio.hourlyRate}
            <span className="ml-1 text-[13px] font-normal text-neutral-400">/hr</span>
          </p>
          <p className="flex items-center gap-1 text-[13px] text-neutral-300">
            <Star aria-hidden="true" className="size-3.5 fill-current text-white/80" />
            {studio.rating.toFixed(1)}
            <span className="sr-only">out of 5</span>
          </p>
        </div>

        <Link
          href={`/studios/${studio.slug}`}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-white text-[14px] font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

// Shown while the studios are being fetched.
export function FeaturedStudiosSkeleton() {
  return (
    <section className="bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-7xl px-4 pt-2 pb-12 sm:px-6 lg:px-8 lg:pt-4 lg:pb-16">
        <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded bg-white/5" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2"
            >
              <div className="aspect-[5/3] animate-pulse rounded-lg bg-white/5" />
              <div className="px-3 pb-1 pt-4">
                <div className="h-6 w-24 animate-pulse rounded-full bg-white/5" />
                <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-white/5" />
                <div className="mt-10 h-10 w-full animate-pulse rounded-full bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function FeaturedStudios() {
  const studios = await getFeaturedStudios();

  return (
    <section className="bg-[#0A0A0A] text-white mt-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:pt-4 lg:pb-16">
        <h2 className="text-[26px] font-bold tracking-[-0.02em] text-white sm:text-[28px]">
          Featured studios
        </h2>
        <p className="mt-2 text-[15px] text-neutral-400">Top-rated spaces, freshly listed.</p>

        {studios.length === 0 ? (
          <p className="mt-8 text-[15px] text-neutral-400">
            No studios yet. Add one from your dashboard.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <StudioCard key={studio._id} studio={studio} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
