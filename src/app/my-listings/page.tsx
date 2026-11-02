/* eslint-disable @next/next/no-img-element -- listing photos come from the database and can point at any host, so next/image cannot optimise them. */

import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CirclePlus } from "lucide-react";
import { auth } from "@/lib/auth";
import DeleteStudioDialog from "@/components/studios/DeleteStudioDialog";
import EditStudioDialog from "@/components/studios/EditStudioDialog";
import { getTokenFromServer } from "@/lib/getTokenFromSever";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
 
  const token = await getTokenFromServer()
   
  const fetchOptions: RequestInit = {
    next: { revalidate: 30 },
    credentials: "include",
  };

  if (token) {
    fetchOptions.headers = {
            Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    };
  }

  try {
    const response = await fetch(
      "" + API_URL + "/my-listings/" + encodeURIComponent(email),
      fetchOptions,
    );

    if (!response.ok) {
      return [];
    }

    const studios: Listing[] = await response.json();
    return Array.isArray(studios) ? studios.filter((studio) => studio.title) : [];
  } catch {
    return [];
  }
}

const GHOST_BUTTON =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[12px] text-foreground transition-colors hover:bg-accent";
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
  return "border-border/40 bg-accent text-muted-foreground";
}

export default async function MyListingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login"); 

  const listings = await getMyListings(session.user.email);
  const count = listings.length;

  return (
    <div className="mx-auto min-h-[65vh] max-w-5xl px-4 py-10 text-foreground sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] sm:text-[28px]">
            My studio listings
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Manage the spaces you host. {count} {count === 1 ? "listing" : "listings"}.
          </p>
        </div>
        <Link
          href="/add-studio"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <CirclePlus className="size-3.5" aria-hidden="true" />
          Add New Studio
        </Link>
      </header>

      {count === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-[15px] font-semibold text-foreground">No listings yet</p>
          <p className="mt-1.5 max-w-xs text-[13px] text-muted-foreground">
            Publish your first space and it will show up here.
          </p>
          <Link
            href="/add-studio"
            className="mt-5 inline-flex h-9 items-center rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Add New Studio
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <caption className="sr-only">Your studio listings</caption>
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-[11px] font-normal text-muted-foreground">Studio</th>
                  <th className="w-[150px] px-5 py-3 text-[11px] font-normal text-muted-foreground">
                    Location
                  </th>
                  <th className="w-[110px] px-5 py-3 text-[11px] font-normal text-muted-foreground">
                    Rate
                  </th>
                  <th className="w-[90px] px-5 py-3 text-[11px] font-normal text-muted-foreground">
                    Rating
                  </th>
                  <th className="w-[110px] px-5 py-3 text-[11px] font-normal text-muted-foreground">
                    Status
                  </th>
                  <th className="w-[190px] px-5 py-3 text-right text-[11px] font-normal text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((listing) => {
                  const place =
                    [listing.location?.area, listing.location?.city].filter(Boolean).join(", ") ||
                    "—";
                 
                  const thumbnail = listing.imageUrl?.trim() || undefined;

                  return (
                    <tr key={listing._id} className="transition-colors hover:bg-accent/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/60 via-primary/40 to-muted">
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
                            <p className="truncate text-[13.5px] font-semibold text-foreground">
                              {listing.title}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {listing.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-[13px] text-muted-foreground">{place}</td>

                      <td className="px-5 py-3 text-[13px] font-medium text-foreground">
                        ${listing.hourlyRate}
                        <span className="ml-1 text-[11px] font-normal text-muted-foreground">/hr</span>
                      </td>

                      <td className="px-5 py-3 text-[13px] text-muted-foreground">
                        {listing.rating ? listing.rating : <span>New</span>}
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
                          <EditStudioDialog
                            studio={listing}
                            label="Update"
                            triggerClassName={GHOST_BUTTON}
                          />
                          <DeleteStudioDialog
                            studioId={listing._id}
                            studioTitle={listing.title}
                            triggerClassName={DANGER_BUTTON}
                          />
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