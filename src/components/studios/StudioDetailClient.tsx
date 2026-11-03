
"use client";

/* eslint-disable @next/next/no-img-element -- gallery URLs come from the API and can point at any host, so next/image cannot optimise them. */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO, startOfToday } from "date-fns";
import { ChevronDown, Compass, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { isImageSource } from "@/lib/images";
import DeleteStudioDialog from "@/components/studios/DeleteStudioDialog";
import EditStudioDialog, { type EditableStudio } from "@/components/studios/EditStudioDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

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
  ownerEmail?: string;
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

async function getStudio(studioId: string): Promise<any | null> {
  const decoded = decodeURIComponent(studioId).trim();
  const safeId = encodeURIComponent(decoded);

  try {
    const token = await getTokenFromClient();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/studios/${safeId}`, {
      cache: "no-store",
      headers,
    });

    if (res.ok) {
      const json = await res.json();
      return json?.studio ?? json?.data ?? json;
    }

    console.warn("GET /studios/:id failed", res.status, await res.text());

    const allRes = await fetch(`${API_URL}/studios`, {
      cache: "no-store",
      headers,
    });

    if (!allRes.ok) {
      console.warn("GET /studios failed", allRes.status);
      return null;
    }

    const body = await allRes.json();
    const list = Array.isArray(body) ? body : body?.studios ?? body?.data ?? [];

    return list.find((s: any) => s._id === decoded || s.slug === decoded) ?? null;
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

const isGradient = (value: string) =>
  value.startsWith("linear-gradient") || value.startsWith("radial-gradient");

const DEFAULT_GALLERY =
  "linear-gradient(135deg, #3a8bc2 0%, #2e5d93 40%, #173f66 100%)";

function transformStudio(api: any): Studio {
  const gallerySources: unknown[] = Array.isArray(api.gallery)
    ? api.gallery
    : Array.isArray(api.images)
      ? api.images
      : [api.imageUrl, api.coverImage];

  const gallery = gallerySources
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => isGradient(value) || isImageSource(value));

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
    gallery: gallery.length ? gallery : [DEFAULT_GALLERY],
    amenities: api.amenities ?? [],
    specs: api.specs ?? DEFAULT_SPECS,
    ownerEmail: api.ownerEmail ?? api.hostEmail,
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
      <div className="overflow-hidden rounded-2xl border border-border bg-muted/40">
        {isGradient(current) ? (
          <div
            role="img"
            aria-label="Studio gallery preview"
            className="aspect-[5/3] w-full"
            style={{ background: current }}
          />
        ) : isImageSource(current) ? (
          <Image
            src={current}
            alt="Studio gallery preview"
            width={300}
            height={300}
            className="aspect-[5/3] w-full object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label="Studio gallery preview"
            className="aspect-[5/3] w-full bg-gradient-to-br from-muted via-background to-border"
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
              className={`aspect-[5/3] overflow-hidden rounded-lg border p-0 transition duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                active
                  ? "border-border opacity-100"
                  : "border-border/70 opacity-50 hover:opacity-90"
              }`}
            >
              {isGradient(image) ? (
                <div className="size-full" style={{ background: image }} />
              ) : isImageSource(image) ? (
                <img src={image} alt="" className="size-full object-cover" />
              ) : (
                <div className="size-full bg-muted" />
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
  "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 text-left text-[14px] text-foreground transition-colors hover:border-border/80 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

function formatDateLabel(value: string) {
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? "Select date" : format(parsed, "d MMM yyyy");
}

function formatHoursLabel(hours: number) {
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
}

export default function StudioDetailClient({ studioId }: { studioId: string }) {
  const [studio, setStudio] = useState<Studio | null>(null);
  const [rawStudio, setRawStudio] = useState<EditableStudio | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [booking, setBooking] = useState<BookingState>({
    date: "2026-11-12",
    start: "10:00",
    end: "14:00",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [dateOpen, setDateOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);

  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      const api = await getStudio(studioId);

      if (cancelled) return;

      if (api) {
        setStudio(transformStudio(api));
        setRawStudio(api as EditableStudio);
      } else {
        setStudio(null);
        setRawStudio(null);
      }

      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [studioId, refreshKey]);

  const { hours, error } = useMemo(() => {
    const diff = (toMinutes(booking.end) - toMinutes(booking.start)) / 60;

    if (!booking.start || !booking.end || Number.isNaN(diff)) {
      return { hours: 0, error: "Choose a start and end time." };
    }

    if (diff <= 0) {
      return { hours: 0, error: "End time must be after start time." };
    }

    return { hours: diff, error: null };
  }, [booking.start, booking.end]);

  const handleBook = async () => {
    if (!studio || submitting) return;

    if (!user || !user.email) {
      setMessage({
        type: "error",
        text: "Please sign in to book this workspace.",
      });
      router.push("/login");
      return;
    }

    const studioOwnerEmail = studio.ownerEmail?.trim();

    if (
      studioOwnerEmail &&
      user.email.toLowerCase() === studioOwnerEmail.toLowerCase()
    ) {
      setMessage({
        type: "error",
        text: "You cannot book your own studio.",
      });
      return;
    }

    if (error || hours <= 0) {
      setMessage({
        type: "error",
        text: error || "Please select a valid time.",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const token = await getTokenFromClient();

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(`${API_URL}/my-bookings`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studioId: studio._id,
          userName: user.name ?? user.email,
          date: booking.date,
          start: booking.start,
          end: booking.end,
          hours,
          total: Math.round(hours * studio.hourlyRate * 100) / 100,
        }),
      });

      const data = await response.json().catch(() => ({}));

    
      if (response.status === 409) {
        setMessage({
          type: "error",
          text: data.message || "This studio is already booked for this time. Please choose another time.",
        });
        return;
      }

     
      if (!response.ok) {
        throw new Error(
          data.message || data.msg || data.error || "Booking failed. Please try again."
        );
      }

      
      setMessage({
        type: "success",
        text: "Request sent! Status is Pending until the host confirms.",
      });

      router.refresh();

      setTimeout(() => {
        router.push("/my-bookings");
      }, 1500);
    } catch (error) {
      console.error("Booking error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't send your request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <StudioDetailSkeleton />;

  if (!studio) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <div className="flex size-14 items-center justify-center rounded-full border border-border bg-muted">
            <Compass className="size-6 text-muted-foreground" aria-hidden="true" />
          </div>

          <h1 className="mt-5 text-[24px] font-bold tracking-[-0.02em] text-foreground sm:text-[26px]">
            Studio not found
          </h1>

          <p className="mt-2 max-w-sm text-[14px] leading-6 text-muted-foreground">
            This studio doesn&apos;t exist, or the link is broken. Browse the spaces we have and find
            one that fits your shoot.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/studios"
              className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Browse all studios
            </Link>

            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-full border border-border px-5 text-[13px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const locationLabel = [studio.location.area, studio.location.city]
    .filter(Boolean)
    .join(", ");

  const total = Math.round(hours * studio.hourlyRate * 100) / 100;

  const isOwner =
    !!user &&
    !!user.email &&
    !!studio.ownerEmail &&
    user.email.toLowerCase() === studio.ownerEmail.toLowerCase();

  const canManage = isOwner;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          <div>
            <GalleryCarousel images={studio.gallery} />

            <div className="mt-5">
              <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {studio.category}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-[34px] leading-[1.05] font-bold tracking-[-0.04em] text-foreground sm:text-[42px]">
                {studio.title}
              </h1>

              {canManage && (
                <div className="flex shrink-0 items-center gap-2 pt-1">
                  {rawStudio && (
                    <EditStudioDialog
                      studio={rawStudio}
                      triggerClassName="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-transparent px-4 text-[12px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      onUpdated={() => setRefreshKey((key) => key + 1)}
                    />
                  )}

                  <DeleteStudioDialog
                    studioId={studio._id}
                    studioTitle={studio.title}
                    redirectTo="/my-listings"
                    triggerClassName="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/5 px-4 text-[12px] font-medium text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-muted-foreground sm:text-[15px]">
              <span>{locationLabel}</span>
              <span aria-hidden>•</span>
              <span>{studio.capacity}</span>
              <span aria-hidden>•</span>
              <span className="inline-flex items-center gap-1 text-foreground">
                <Star className="size-3.5 fill-current text-yellow-400" />
                {studio.rating.toFixed(1)} rating
              </span>
            </div>

            <p className="mt-4 max-w-[64ch] text-[15px] leading-7 text-muted-foreground">
              {studio.description}
            </p>

            <section className="mt-7">
              <h2 className="text-[15px] font-semibold text-foreground">Amenities</h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {studio.amenities.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-muted px-2.5 py-1.5 text-[12px] text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <aside className="w-full self-start md:sticky md:top-6">
            <div className="rounded-[20px] border border-border bg-card p-5 shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[28px] leading-none font-bold tracking-[-0.04em] text-foreground">
                  ${studio.hourlyRate}
                  <span className="ml-1 text-[13px] font-medium tracking-normal text-muted-foreground">
                    / hr
                  </span>
                </p>

                <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                  Deposit ${studio.securityDeposit}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-date" className="text-[12px] text-muted-foreground">
                    Date
                  </Label>

                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger id="booking-date" className={FIELD_TRIGGER_CLASS}>
                      <span>{formatDateLabel(booking.date)}</span>

                      <ChevronDown
                        className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                          dateOpen ? "rotate-180" : ""
                        }`}
                      />
                    </PopoverTrigger>

                    <PopoverContent
                      align="start"
                      className="w-auto border border-border bg-popover p-0 shadow-2xl"
                    >
                      <Calendar
                        mode="single"
                        selected={parseISO(booking.date)}
                        onSelect={(date) => {
                          if (!date) return;

                          setBooking((prev) => ({
                            ...prev,
                            date: format(date, "yyyy-MM-dd"),
                          }));

                          setDateOpen(false);
                        }}
                        disabled={{ before: startOfToday() }}
                        className="text-foreground"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="booking-hours" className="text-[12px] text-muted-foreground">
                    Hours
                  </Label>

                  <Popover open={hoursOpen} onOpenChange={setHoursOpen}>
                    <PopoverTrigger id="booking-hours" className={FIELD_TRIGGER_CLASS}>
                      <span>
                        {booking.start} to {booking.end}
                      </span>

                      <ChevronDown
                        className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                          hoursOpen ? "rotate-180" : ""
                        }`}
                      />
                    </PopoverTrigger>

                    <PopoverContent
                      align="start"
                      className="w-[280px] border border-border bg-popover p-3 shadow-2xl"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="booking-start"
                            className="text-[11px] font-normal text-muted-foreground"
                          >
                            Start
                          </Label>

                          <Input
                            id="booking-start"
                            type="time"
                            value={booking.start}
                            onChange={(e) =>
                              setBooking((prev) => ({
                                ...prev,
                                start: e.target.value,
                              }))
                            }
                            className="h-10 rounded-lg border-border bg-background px-2.5 text-[13px] text-foreground"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor="booking-end"
                            className="text-[11px] font-normal text-muted-foreground"
                          >
                            End
                          </Label>

                          <Input
                            id="booking-end"
                            type="time"
                            value={booking.end}
                            onChange={(e) =>
                              setBooking((prev) => ({
                                ...prev,
                                end: e.target.value,
                              }))
                            }
                            className="h-10 rounded-lg border-border bg-background px-2.5 text-[13px] text-foreground"
                          />
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground">
                          {hours > 0
                            ? `${formatHoursLabel(hours)} ${hours === 1 ? "hr" : "hrs"} selected`
                            : "Pick a time range"}
                        </span>

                        <Button
                          type="button"
                          onClick={() => setHoursOpen(false)}
                          className="h-7 rounded-full bg-primary px-3 text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          Done
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {formatHoursLabel(hours)} {hours === 1 ? "hr" : "hrs"} × ${studio.hourlyRate}
                  </span>

                  <span className="text-[15px] font-semibold text-foreground">
                    ${total}
                  </span>
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
                  className={`mt-3 rounded-lg border px-3 py-2 text-[13px] ${
                    message.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  {message.text}
                </p>
              )}

              <Button
                type="button"
                className="mt-4 h-11 w-full rounded-full bg-primary text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={!!error || submitting || hours <= 0}
                onClick={handleBook}
              >
                {submitting ? "Sending…" : "Book Workspace Now"}
              </Button>

              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Status starts as Pending until the host confirms.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


export function StudioDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
