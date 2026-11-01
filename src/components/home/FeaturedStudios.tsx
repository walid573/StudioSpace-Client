import Image from "next/image";
import Link from "next/link";
import { Building2, Star } from "lucide-react";
import { toDisplayImage } from "@/lib/images";

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

// Grab every studio, keep the live ones, then take the 6 best rated.
async function getFeaturedStudios(): Promise<Studio[]> {
  const res = await fetch(`${API_URL}/featured`, { cache: "no-store" });

  if (!res.ok) {
    return [];
  }

  const studios: Studio[] = await res.json();

  return studios
    // "pending" listings still need review. Studios created through the Add Studio
    // form have no status at all, so they are treated as live rather than hidden.
    .filter((studio) => Boolean(studio.title) && studio.status !== "pending")
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 6)
    .map((studio) => ({
      ...studio,
      imageUrl: toDisplayImage(studio.imageUrl),
    }));
}

export function StudioCard({ studio }: { studio: Studio }) {
  return (
    <article className="group flex flex-col rounded-lg border border-white/10 bg-white/[0.04] p-2">
      <div className="relative aspect-[5/3] overflow-hidden rounded-lg bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
        {studio.imageUrl ? (
          <Image
            src={studio.imageUrl}
            alt={studio.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-neutral-500">
            No photo yet
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-1 pt-4">
        <span className="w-fit rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-blue-400">
          {studio.category}
        </span>

        <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.01em] text-white">
          {studio.title}
        </h3>
        <p className="mt-1 text-[13px] text-neutral-400">
          {[studio.location?.area, studio.location?.city].filter(Boolean).join(", ") ||
            "Location not set"}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="text-[17px] font-semibold text-white">
            ${studio.hourlyRate}
            <span className="ml-1 text-[13px] font-normal text-neutral-400">/hr</span>
          </p>
          <p className="flex items-center gap-1 text-[13px] text-neutral-300">
            <Star aria-hidden="true" className="size-3.5 fill-current text-white/80" />
            {typeof studio.rating === "number" ? (
              <>
                {studio.rating.toFixed(1)}
                <span className="sr-only">out of 5</span>
              </>
            ) : (
              <span className="text-neutral-400">New</span>
            )}
          </p>
        </div>

        <Link
          href={`/studios/${studio._id}`}
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
    <section className="bg-[#0A0A0A] text-white pt-8">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:pt-4 lg:pb-16">
        <h2 className="text-[26px] font-bold tracking-[-0.02em] text-white sm:text-[28px]">
          Featured studios
        </h2>
        <p className="mt-2 text-[15px] text-neutral-400">Top-rated spaces, freshly listed.</p>

        {studios.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#121212] px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <Building2 className="size-5 text-neutral-400" aria-hidden="true" />
            </div>
            <p className="mt-4 text-[15px] font-semibold text-white">No studios yet</p>
            <p className="mt-1.5 max-w-xs text-[13px] text-neutral-400">
              Nothing has been published here yet. Be the first to list a space, or check back soon.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/add-studio"
                className="inline-flex h-9 items-center rounded-full bg-white px-4 text-[12px] font-medium text-neutral-950 transition-colors hover:bg-neutral-200"
              >
                List your studio
              </Link>
              <Link
                href="/studios"
                className="inline-flex h-9 items-center rounded-full border border-white/15 px-4 text-[12px] font-medium text-neutral-200 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Browse studios
              </Link>
            </div>
          </div>
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
