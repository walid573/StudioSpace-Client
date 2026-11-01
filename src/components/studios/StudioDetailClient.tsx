"use client";

/* eslint-disable @next/next/no-img-element -- gallery URLs come from the API and can point at any host, so next/image cannot optimise them. */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO, startOfToday } from "date-fns";
import { ArrowLeft, ChevronDown, Pencil, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";


// Client components only see NEXT_PUBLIC_* variables
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Studio = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  rating: number;
  reviewCount: number;
  location: { city: string; area: string; address: string };
  capacity: string;
  description: string;
  gallery: string[];
  amenities: string[];
  specs: { label: string; value: string }[];
  host: {
    name: string;
    avatar: string;
    title: string;
    responseTime: string;
    joined: string;
  };
  reviews: { name: string; date: string; text: string }[];
};

const DEFAULT_SPECS = [
  { label: "Space type", value: "Studio loft" },
  { label: "Capacity", value: "12 guests" },
  { label: "Setup", value: "Portrait / product / fashion" },
  { label: "Access", value: "24/7 host access" },
];

const DEFAULT_REVIEWS = [
  {
    name: "Nadia S.",
    date: "May 2026",
    text: "Beautifully lit space and the host was extremely easy to coordinate with. The backdrop was perfect for our product shoot.",
  },
  {
    name: "Tariq M.",
    date: "Apr 2026",
    text: "The room feels huge and the natural light is fantastic. Great for small team shoots and client meetings.",
  },
];

// Only used in development so a broken API is obvious in production
const fallbackStudio: Studio = {
  _id: "fallback-cyclorama-white-loft",
  slug: "cyclorama-white-loft",
  title: "Cyclorama White Loft",
  category: "Photo Studio",
  hourlyRate: 45,
  securityDeposit: 100,
  rating: 4.9,
  reviewCount: 128,
  location: { city: "Dhaka", area: "Gulshan", address: "Gulshan, Dhaka" },
  capacity: "Up to 12 people",
  description:
    "A seamless white cyc wall with a full white backdrop, ideal for product, fashion, and portrait shoots.",
  gallery: [
    "linear-gradient(135deg, #3a8bc2 0%, #2e5d93 40%, #173f66 100%)",
    "linear-gradient(135deg, #4b6a8a 0%, #2a3d59 100%)",
    "linear-gradient(135deg, #394d66 0%, #1f2b3d 100%)",
    "linear-gradient(135deg, #1d4b7b 0%, #0c2037 100%)",
  ],
  amenities: ["Natural light", "Wi-Fi", "Backdrops", "Soundproofing", "Parking", "Green room"],
  specs: DEFAULT_SPECS,
  host: {
    name: "Rahim Ahmed",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    title: "Verified host",
    responseTime: "Usually replies in 1 hour",
    joined: "Joined in 2021",
  },
  reviews: DEFAULT_REVIEWS,
};

async function getStudio(studioId: string): Promise<any | null> {
  const safeId = encodeURIComponent(decodeURIComponent(studioId).trim());
  try {
    const res = await fetch(`${API_URL}/studios/${safeId}`, { cache: "no-store" });
    if (res.ok) return await res.json();

    const allRes = await fetch(`${API_URL}/studios`, { cache: "no-store" });
    if (!allRes.ok) return null;

    const studios = await allRes.json();
    return (
      studios.find((s: any) => s._id === studioId || s.slug === decodeURIComponent(studioId).trim()) ??
      null
    );
  } catch (error) {
    console.error("Error fetching studio:", error);
    return null;
  }
}

function normalizeCapacity(value: unknown): string {
  if (typeof value === "number") {
    return `Up to ${value} people`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "Up to 12 people";
    return trimmed.startsWith("Up to") ? trimmed : `Up to ${trimmed}`;
  }

  return "Up to 12 people";
}

function transformStudio(api: any): Studio {
  const gallery = Array.isArray(api.gallery)
    ? api.gallery.filter(Boolean)
    : Array.isArray(api.images)
      ? api.images.filter(Boolean)
      : [api.imageUrl, api.coverImage].filter(Boolean);

  return {
    _id: api._id,
    title: api.title,
    slug: api.slug,
    category: api.category,
    hourlyRate: api.hourlyRate,
    securityDeposit: api.securityDeposit ?? 100,
    rating: api.rating ?? 0,
    reviewCount: api.reviewCount ?? 0,
    location: {
      city: api.location?.city ?? api.city ?? "",
      area: api.location?.area ?? api.area ?? "",
      address: api.location?.address ?? api.address ?? "",
    },
    capacity: normalizeCapacity(api.capacity ?? api.maxCapacity),
    description: api.description ?? api.overview ?? "",
    gallery: gallery.length ? gallery : ["linear-gradient(135deg, #3a8bc2 0%, #2e5d93 40%, #173f66 100%)"],
    amenities: api.amenities ?? [],
    specs: api.specs ?? DEFAULT_SPECS,
    host: {
      name: api.hostName ?? api.ownerName ?? "Host",
      avatar: api.hostAvatar ?? api.ownerAvatar ?? "",
      title: api.hostTitle ?? api.ownerTitle ?? "Verified host",
      responseTime: api.hostResponseTime ?? "Usually replies in 1 hour",
      joined: api.hostJoined ?? "Joined in 2021",
    },
    reviews: api.reviews ?? DEFAULT_REVIEWS,
  };
}

const isGradient = (value: string) =>
  value.startsWith("linear-gradient") || value.startsWith("radial-gradient");

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function GalleryCarousel({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];
  if (!current) return null;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        {isGradient(current) ? (
          <div
            role="img"
            aria-label="Studio gallery preview"
            className="aspect-[5/3] w-full"
            style={{ background: current }}
          />
        ) : (
          <Image
            src={current}
            alt="Studio gallery preview"
            width={300}
            height={300}
            className="aspect-[5/3] w-full object-cover"
          />
        )}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2.5 sm:gap-3">
        {images.map((image, index) => {
          const active = index === selected;

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Show gallery image ${index + 1}`}
              aria-pressed={active}
              className={`aspect-[5/3] overflow-hidden rounded-lg border p-0 transition duration-200 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none ${active
                  ? "border-white/60 opacity-100"
                  : "border-white/10 opacity-50 hover:opacity-90"
                }`}
            >
              {isGradient(image) ? (
                <div className="size-full" style={{ background: image }} />
              ) : (
                <img src={image} alt="" className="size-full object-cover" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type BookingState = {
  date: string;
  start: string;
  end: string;
};

const FIELD_TRIGGER_CLASS =
  "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-left text-[14px] text-white transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none";

function formatDateLabel(value: string) {
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? "Select date" : format(parsed, "d MMM yyyy");
}

function formatHoursLabel(hours: number) {
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
}

export default function StudioDetailClient({ studioId }: { studioId: string }) {
  const [studio, setStudio] = useState<Studio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<BookingState>({
    date: "2026-11-12",
    start: "10:00",
    end: "14:00",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const api = await getStudio(studioId);
      if (cancelled) return;
      if (api) setStudio(transformStudio(api));
      else setStudio(process.env.NODE_ENV === "development" ? fallbackStudio : null);
      setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [studioId]);

  const { hours, error } = useMemo(() => {
    const diff = (toMinutes(booking.end) - toMinutes(booking.start)) / 60;
    if (!booking.start || !booking.end || Number.isNaN(diff)) {
      return { hours: 0, error: "Choose a start and end time." };
    }
    if (diff <= 0) return { hours: 0, error: "End time must be after start time." };
    return { hours: diff, error: null };
  }, [booking.start, booking.end]);

  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;


  async function handleBook() {
    if (!studio) return;

    if (!user) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/my-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioId: studio._id,
          userEmail: user.email,
          userName: user.name,
          date: booking.date,
          start: booking.start,
          end: booking.end,
          hours,
          total: hours * studio.hourlyRate,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setMessage({
        type: "success",
        text: "Request sent! Status is Pending until the host confirms.",
      });

      setTimeout(() => router.push("/my-bookings"), 1500);
    } catch {
      setMessage({
        type: "error",
        text: "We couldn't send your request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }
  if (isLoading) return <StudioDetailSkeleton />;

  if (!studio) {
    return (
      <div className="dark min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/studios"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to studios
          </Link>
          <div className="mt-8 text-center">
            <h1 className="text-2xl font-bold">Studio not found</h1>
            <p className="mt-2 text-muted-foreground">
              This studio doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/studios"
              className="mt-4 inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Browse all studios
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const locationLabel = [studio.location.area, studio.location.city].filter(Boolean).join(", ");
  const total = Math.round(hours * studio.hourlyRate * 100) / 100;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          <div>
            <GalleryCarousel images={studio.gallery} />

            <div className="mt-5">
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-neutral-200">
                {studio.category}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-[34px] leading-[1.05] font-bold tracking-[-0.04em] text-white sm:text-[42px]">
                {studio.title}
              </h1>

              <div className="flex shrink-0 items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1.5 rounded-full border-white/15 bg-transparent px-4 text-[12px] font-medium text-neutral-200 hover:bg-white/[0.06] hover:text-white"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1.5 rounded-full border-red-500/30 bg-red-500/5 px-4 text-[12px] font-medium text-red-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-neutral-400 sm:text-[15px]">
              <span>{locationLabel}</span>
              <span aria-hidden>•</span>
              <span>{studio.capacity}</span>
              <span aria-hidden>•</span>
              <span className="inline-flex items-center gap-1 text-neutral-300">
                <Star className="size-3.5 fill-current text-yellow-400" />
                {studio.rating.toFixed(1)} rating
              </span>
            </div>

            <p className="mt-4 max-w-[64ch] text-[15px] leading-7 text-neutral-400">
              {studio.description}
            </p>

            <section className="mt-7">
              <h2 className="text-[15px] font-semibold text-white">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {studio.amenities.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[12px] text-neutral-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <aside className="w-full self-start md:sticky md:top-6">
            <div className="rounded-[20px] border border-white/10 bg-[#111111] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[28px] leading-none font-bold tracking-[-0.04em] text-white">
                  ${studio.hourlyRate}
                  <span className="ml-1 text-[13px] font-medium tracking-normal text-neutral-400">
                    / hr
                  </span>
                </p>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-neutral-300">
                  Deposit ${studio.securityDeposit}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-date" className="text-[12px] text-neutral-400">
                    Date
                  </Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger id="booking-date" className={FIELD_TRIGGER_CLASS}>
                      <span>{formatDateLabel(booking.date)}</span>
                      <ChevronDown
                        className={`size-3.5 shrink-0 text-neutral-500 transition-transform duration-200 ${dateOpen ? "rotate-180" : ""
                          }`}
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="dark w-auto border border-white/10 bg-[#161616] p-0 shadow-2xl"
                    >
                      <Calendar
                        mode="single"
                        selected={parseISO(booking.date)}
                        onSelect={(date) => {
                          if (!date) return;
                          setBooking((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
                          setDateOpen(false);
                        }}
                        disabled={{ before: startOfToday() }}
                        className="text-neutral-200"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="booking-hours" className="text-[12px] text-neutral-400">
                    Hours
                  </Label>
                  <Popover open={hoursOpen} onOpenChange={setHoursOpen}>
                    <PopoverTrigger id="booking-hours" className={FIELD_TRIGGER_CLASS}>
                      <span>
                        {booking.start} to {booking.end}
                      </span>
                      <ChevronDown
                        className={`size-3.5 shrink-0 text-neutral-500 transition-transform duration-200 ${hoursOpen ? "rotate-180" : ""
                          }`}
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="dark w-[280px] border border-white/10 bg-[#161616] p-3 shadow-2xl"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="booking-start"
                            className="text-[11px] font-normal text-neutral-400"
                          >
                            Start
                          </Label>
                          <Input
                            id="booking-start"
                            type="time"
                            value={booking.start}
                            onChange={(e) =>
                              setBooking((prev) => ({ ...prev, start: e.target.value }))
                            }
                            className="h-10 rounded-lg border-white/10 bg-white/[0.04] px-2.5 text-[13px] text-white [color-scheme:dark]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="booking-end"
                            className="text-[11px] font-normal text-neutral-400"
                          >
                            End
                          </Label>
                          <Input
                            id="booking-end"
                            type="time"
                            value={booking.end}
                            onChange={(e) =>
                              setBooking((prev) => ({ ...prev, end: e.target.value }))
                            }
                            className="h-10 rounded-lg border-white/10 bg-white/[0.04] px-2.5 text-[13px] text-white [color-scheme:dark]"
                          />
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-neutral-500">
                          {hours > 0
                            ? `${formatHoursLabel(hours)} ${hours === 1 ? "hr" : "hrs"} selected`
                            : "Pick a time range"}
                        </span>
                        <Button
                          type="button"
                          onClick={() => setHoursOpen(false)}
                          className="h-7 rounded-full bg-white px-3 text-[11px] font-medium text-neutral-950 hover:bg-neutral-200"
                        >
                          Done
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-neutral-400">
                    {formatHoursLabel(hours)} {hours === 1 ? "hr" : "hrs"} × ${studio.hourlyRate}
                  </span>
                  <span className="text-[15px] font-semibold text-white">${total}</span>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-[13px] text-red-400" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  className={`rounded-lg border px-3 py-2 text-[13px] ${message.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/30 bg-red-500/10 text-red-300"
                    }`}
                >
                  {message.text}
                </p>
              )}

              <Button
                type="button"
                className="mt-4 h-11 w-full rounded-full bg-white text-[13px] font-semibold text-neutral-950 hover:bg-neutral-200 disabled:opacity-50"
                disabled={!!error || submitting || hours <= 0}
                onClick={handleBook}
              >
                {submitting ? "Sending…" : "Book Workspace Now"}
              </Button>

              <p className="mt-3 text-center text-[11px] text-neutral-500">
                Status starts as Pending until the host confirms.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Exported for use as a Suspense fallback
export function StudioDetailSkeleton() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Skeleton className="h-6 w-36" />
        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_320px] md:gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          <div>
            <Skeleton className="aspect-[5/3] w-full rounded-2xl" />
            <div className="mt-3 grid grid-cols-4 gap-2.5 sm:gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[5/3] w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="mt-6 h-6 w-28 rounded-full" />
            <Skeleton className="mt-4 h-10 w-72 max-w-full" />
            <Skeleton className="mt-3 h-5 w-96 max-w-full" />
            <Skeleton className="mt-4 h-16 w-full" />
            <div className="mt-8 flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-[380px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}