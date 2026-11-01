/* eslint-disable @next/next/no-img-element -- listing photos come from the database and can point at any host, so next/image cannot optimise them. */

import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CirclePlus, Pencil, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export const instant = false;

export const metadata = {
  title: "My Studio Listings | StudioSpace",
  description: "Manage the studios you host, their pricing, availability and status.",
};

type Listing = {
  _id: string;
  title: string;
  category: string;
  imageUrl?: string;
  location?: {
    city?: string;
    area?: string;
  };
  hourlyRate: number;
  rating?: number;
  status?: string;
  ownerEmail?: string;
  hostEmail?: string;
};

async function getMyListings(email: string): Promise<Listing[]> {
  const response = await fetch(`${API_URL}/studios`, { cache: "no-store" });

  if (!response.ok) {
    return [];
  }

  const studios: Listing[] = await response.json();

  return studios.filter(
    (studio) =>
      studio.title &&
      (studio.ownerEmail ?? studio.hostEmail)?.toLowerCase() === email.toLowerCase()
  );
}

const GHOST_BUTTON =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-3 text-[12px] text-neutral-200 transition-colors hover:bg-white/[0.06]";
const DANGER_BUTTON =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-red-500/30 px-3 text-[12px] text-red-300 transition-colors hover:bg-red-500/10";

function statusLabel(status?: string) {
  if (status === "approved") return "Active";
  if (status === "pending") return "Pending";
  return "Draft";
}

function statusStyles(status?: string) {
  if (status === "approved") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }
  if (status === "pending") {
    return "border-yellow-500/40 bg-yellow-500/10 text-yellow-300";
  }
  return "border-white/15 bg-white/[0.06] text-neutral-300";
}

export default async function MyListingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const listings = await getMyListings(session.user.email);
  const count = listings.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-white sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] sm:text-[28px]">
            My studio listings
          </h1>
          <p className="mt-1.5 text-[13px] text-neutral-400">
            Manage the spaces you host. {count} {count === 1 ? "listing" : "listings"}.
          </p>
        </div>
        <Link
          href="/add-studio"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-[12px] font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
        >
          <CirclePlus className="size-3.5" aria-hidden="true" />
          Add New Studio
        </Link>
      </header>

      {count === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#121212] px-6 py-16 text-center">
          <p className="text-[15px] font-semibold text-white">No listings yet</p>
          <p className="mt-1.5 max-w-xs text-[13px] text-neutral-400">
            Publish your first space and it will show up here.
          </p>
          <Link
            href="/add-studio"
            className="mt-5 inline-flex h-9 items-center rounded-full bg-white px-4 text-[12px] font-medium text-neutral-950 transition-colors hover:bg-neutral-200"
          >
            Add New Studio
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121212]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <caption className="sr-only">Your studio listings</caption>
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-[11px] font-normal text-neutral-500">Studio</th>
                  <th className="w-[150px] px-5 py-3 text-[11px] font-normal text-neutral-500">
                    Location
                  </th>
                  <th className="w-[110px] px-5 py-3 text-[11px] font-normal text-neutral-500">
                    Rate
                  </th>
                  <th className="w-[90px] px-5 py-3 text-[11px] font-normal text-neutral-500">
                    Rating
                  </th>
                  <th className="w-[110px] px-5 py-3 text-[11px] font-normal text-neutral-500">
                    Status
                  </th>
                  <th className="w-[190px] px-5 py-3 text-right text-[11px] font-normal text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {listings.map((listing) => {
                  const place =
                    [listing.location?.area, listing.location?.city].filter(Boolean).join(", ") ||
                    "—";
                  const thumbnail = listing.imageUrl?.startsWith("http")
                    ? listing.imageUrl
                    : undefined;

                  return (
                    <tr key={listing._id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-600/60 via-blue-900/40 to-neutral-900">
                            {thumbnail && (
                              <img
                                src={thumbnail}
                                alt={listing.title}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13.5px] font-semibold text-white">
                              {listing.title}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-neutral-400">
                              {listing.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-[13px] text-neutral-200">{place}</td>

                      <td className="px-5 py-3 text-[13px] font-medium text-white">
                        ${listing.hourlyRate}
                        <span className="ml-1 text-[11px] font-normal text-neutral-400">/hr</span>
                      </td>

                      <td className="px-5 py-3 text-[13px] text-neutral-200">
                        {listing.rating ? (
                          listing.rating
                        ) : (
                          <span className="text-neutral-500">New</span>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium ${statusStyles(
                            listing.status
                          )}`}
                        >
                          {statusLabel(listing.status)}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" className={GHOST_BUTTON}>
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Update
                          </button>
                          <button type="button" className={DANGER_BUTTON}>
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
