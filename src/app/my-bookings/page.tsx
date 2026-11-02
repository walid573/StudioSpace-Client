"use client";

/* eslint-disable @next/next/no-img-element -- studio photos come from the database and can point at any host, so next/image cannot optimise them. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import EditBooking, { Booking, Studio } from "@/components/studios/EditBookings";
import DeleteBooking from "@/components/studios/DeleteBookings";


const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

const STATUS_META: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300" },
  confirmed: { label: "Confirmed", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
  completed: { label: "Completed", className: "border-white/15 bg-white/[0.06] text-neutral-300" },
  cancelled: { label: "Cancelled", className: "border-red-500/40 bg-red-500/10 text-red-300" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

const PRIMARY_BUTTON =
  "inline-flex h-8 items-center rounded-full bg-white px-3.5 text-[12px] font-medium text-neutral-950 transition-colors hover:bg-neutral-200";

const THUMBNAIL_GRADIENTS = [
  "from-blue-500/70 via-blue-800/40 to-neutral-900",
  "from-indigo-500/60 via-blue-900/40 to-neutral-900",
  "from-neutral-500/40 via-neutral-700/40 to-neutral-900",
  "from-sky-500/60 via-blue-900/40 to-neutral-900",
  "from-violet-500/50 via-neutral-800/50 to-neutral-900",
];

function thumbnailGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 997;
  }
  return THUMBNAIL_GRADIENTS[hash % THUMBNAIL_GRADIENTS.length];
}

function toStatus(status: Booking["status"]): BookingStatus {
  if (status === "confirmed") return "confirmed";
  if (status === "declined") return "cancelled";
  return "pending";
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const email = session?.user?.email;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookings + studios once we know who the user is
  useEffect(() => {
    if (isPending) return;
    if (!email) {
      router.replace("/login");
      return;
    }

    let active = true;

    async function loadData() {
      try {
        const [bookingsRes, studiosRes] = await Promise.all([
          fetch(`${API_URL}/my-bookings/${encodeURIComponent(email!)}`, { cache: "no-store" }),
          fetch(`${API_URL}/studios`, { cache: "no-store" }),
        ]);
        const bookingData = await bookingsRes.json();
        const studioData = studiosRes.ok ? await studiosRes.json() : [];

        if (!active) return;
        setBookings(Array.isArray(bookingData) ? bookingData : []);
        setStudios(Array.isArray(studioData) ? studioData : []);
      } catch {
        if (active) setBookings([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [email, isPending, router]);

  // Called by DeleteBooking after the server deleted the booking
  function handleDeleted(id: string) {
    setBookings((current) => current.filter((b) => b._id !== id));
  }

  // Called by EditBooking after the server saved the changes
  function handleUpdated(updated: Booking) {
    setBookings((current) => current.map((b) => (b._id === updated._id ? updated : b)));
  }

  if (isPending || loading) return <BookingsSkeleton />;

  const studiosById = new Map(studios.map((s) => [s._id, s]));

  const counts: Record<(typeof FILTERS)[number]["key"], number> = {
    all: bookings.length,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const booking of bookings) {
    counts[toStatus(booking.status)] += 1;
  }

  return (
    <div className="mx-auto max-w-5xl min-h-[65vh] px-4 py-10 text-white sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.02em]">My bookings</h1>
          <p className="mt-1.5 text-[13px] text-neutral-400">
            Review, edit or cancel your studio reservations.
          </p>
        </div>
        <Link
          href="/studios"
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-white px-4 text-[12px] font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
        >
          Explore Studios
        </Link>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = filter.key === "all";
          return (
            <button
              key={filter.key}
              type="button"
              aria-pressed={active}
              className={
                active
                  ? "inline-flex h-7 items-center rounded-full bg-white px-3 text-[11px] font-medium text-neutral-950"
                  : "inline-flex h-7 items-center rounded-full border border-white/10 px-3 text-[11px] text-neutral-400"
              }
            >
              {filter.label}
              <span className={`ml-1 tabular-nums ${active ? "opacity-50" : "opacity-60"}`}>
                {counts[filter.key]}
              </span>
            </button>
          );
        })}
      </div>

      {bookings.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#121212] px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-white">No bookings yet</p>
          <p className="mt-1.5 max-w-xs text-[13px] text-neutral-400">
            Browse the studios and reserve your first session.
          </p>
          <Link href="/studios" className={`mt-5 h-9 px-4 ${PRIMARY_BUTTON}`}>
            Explore Studios
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {bookings.map((booking) => {
            const status = toStatus(booking.status);
            const meta = STATUS_META[status];
            const studio = studiosById.get(booking.studioId);
            const thumbnail = studio?.imageUrl?.trim() || undefined;

            return (
              <li
                key={booking._id}
                className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-[#121212] p-3"
              >
                <div
                  className={`size-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${thumbnailGradient(booking.studioId)}`}
                >
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt={studio?.title ?? "Studio"}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-white">
                    {studio?.title ?? "Studio booking"}
                  </p>
                  <p className="mt-1 truncate text-[12px] text-neutral-400">
                    {booking.date} · {booking.start} to {booking.end} · {booking.hours} hrs · ${booking.total}
                  </p>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium ${meta.className}`}
                  >
                    {meta.label}
                  </span>

                  {status === "pending" && (
                    <EditBooking booking={booking} studioTitle={studio?.title}  onUpdated={handleUpdated} />
                  )}

                  {(status === "pending" || status === "cancelled") && (
                    <DeleteBooking bookingId={booking._id}
                      studioTitle={studio?.title}
                      onDeleted={handleDeleted} />
                  )}

                  {status === "confirmed" && <button type="button" className={PRIMARY_BUTTON}>View details</button>}
                  {status === "completed" && <button type="button" className={PRIMARY_BUTTON}>Book again</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-white/10" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded-md bg-white/5" />

      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-white/[0.06]" />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-[#121212] p-3"
          >
            <div className="size-14 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-56 animate-pulse rounded bg-white/5" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}