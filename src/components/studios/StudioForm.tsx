"use client";

/* eslint-disable @next/next/no-img-element -- previews show user-typed URLs from any host, so next/image cannot optimize them. */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { isImageSource } from "@/lib/images";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CATEGORIES = ["Photo Studio", "Film Stage", "Podcast Lounge", "Music Suite", "Workshop"];

const AMENITIES = [
  "Professional lighting",
  "Backdrop system",
  "Soundproofing",
  "Parking",
  "Green room",
  "Air conditioning",
  "Lighting kit",
  "Makeup station",
  "Changing room",
  "Kitchenette",
  "Restroom",
];


type FormState = {
  title: string;
  category: string;
  hourlyRate: string;
  securityDeposit: string;
  maxCapacity: string;
  address: string;
  imageUrl: string;
  amenities: string[];
  overview: string;
  hostName: string | null;
  hostEmail: string | null;
};

const INITIAL_FORM: FormState = {
  title: "",
  category: "Photo Studio",
  hourlyRate: "45",
  securityDeposit: "100",
  maxCapacity: "8",
  address: "",
  imageUrl: "",
  amenities: ["Professional lighting", "Soundproofing", "Air conditioning", "Makeup station"],
  overview: "",
  hostName: null,
  hostEmail: null,
};


const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[14px] text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-white/30";


function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-neutral-300">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-neutral-500">{hint}</span>}
    </label>
  );
}


function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-[15px] font-semibold text-white">{title}</h2>
      <p className="mt-1 text-[12px] text-neutral-400">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const StudioForm = () => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState("");
  const { data: session } = authClient.useSession();

  const hostName = form.hostName ?? session?.user?.name ?? "";
  const hostEmail = form.hostEmail ?? session?.user?.email ?? "";

  function update(field: keyof FormState, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleAmenity(amenity: string) {
    setForm((previous) => ({
      ...previous,
      amenities: previous.amenities.includes(amenity)
        ? previous.amenities.filter((item) => item !== amenity)
        : [...previous.amenities, amenity],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Enter a studio title.");
      return;
    }
    const parts = form.address
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    const location = {
      city: parts.length > 1 ? parts[parts.length - 1] : "",
      area: parts.length > 1 ? parts[parts.length - 2] : parts[0] ?? "",
      address: form.address.trim(),
    };

    // Only store something the browser can actually render as an image. A typo in
    // this field used to be saved verbatim and then crashed `next/image` later.
    const coverImage = isImageSource(form.imageUrl) ? form.imageUrl.trim() : "";

    const result = {
      ...form,
      hostName: hostName.trim() || null,
      hostEmail: hostEmail.trim().toLowerCase() || null,
      imageUrl: coverImage,
      hourlyRate: Number(form.hourlyRate),
      securityDeposit: Number(form.securityDeposit),
      maxCapacity: Number(form.maxCapacity),
      gallery: coverImage ? [coverImage] : [],
      slug:
        form.title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "studio",
      location,
      description: form.overview || "",
    };

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/studios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        setError(`Could not save the studio (error ${response.status}). Please try again.`);
        return;
      }

      router.push("/studios");
      router.refresh();
    } catch {
      setError("Could not reach the server. Is it running on port 8000?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white sm:px-6 lg:px-8">
      <header>
        <p className="text-[11px] text-neutral-500">
          <Link href="/dashboard" className="transition-colors hover:text-neutral-300">
            Dashboard
          </Link>
          <span className="mx-1.5">/</span>
          Add New Studio
        </p>
        <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] sm:text-[30px]">
          Add a new studio
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-neutral-400">
          List your space and start getting bookings. You can edit everything later from My Studio
          Listings.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">

        <form onSubmit={handleSubmit} className="space-y-4">
          <SectionCard title="Basics" subtitle="What are you listing?">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Studio title">
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="e.g. Cyclorama White Loft"
                />
              </Field>

              <Field label="Category">
                <select
                  className={`${inputClass} cursor-pointer [color-scheme:dark] [&>option]:bg-[#141414] [&>option]:text-white`}
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="Pricing and capacity"
            subtitle="Set your hourly rate and how many people fit."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Hourly rate" hint="Rounded per hour">
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] text-neutral-500">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    className={`${inputClass} pl-7`}
                    value={form.hourlyRate}
                    onChange={(event) => update("hourlyRate", event.target.value)}
                  />
                </div>
              </Field>

              <Field label="Security deposit" hint="Refundable if nothing is damaged">
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] text-neutral-500">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    className={`${inputClass} pl-7`}
                    value={form.securityDeposit}
                    onChange={(event) => update("securityDeposit", event.target.value)}
                  />
                </div>
              </Field>

              <Field label="Max capacity" hint="People allowed at once">
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.maxCapacity}
                  onChange={(event) => update("maxCapacity", event.target.value)}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Location" subtitle="Guests use the area and address when they book.">
            <Field label="Address">
              <input
                className={inputClass}
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
                placeholder="House, road, area, city"
              />
            </Field>
          </SectionCard>

          <SectionCard title="Photos" subtitle="Paste a link to the photo guests will see first.">
            <Field label="Image URL" hint="A direct link to a .jpg, .png or .webp file">
              <input
                className={inputClass}
                value={form.imageUrl}
                onChange={(event) => {
                  update("imageUrl", event.target.value);
                  setPreview(event.target.value);
                }}
                placeholder="https://.../your-image.jpg"
              />
            </Field>

            <div className="mt-4 h-52 overflow-hidden rounded-lg border border-dashed border-white/15 bg-white/[0.02]">
              {preview ? (
                <img
                  src={preview}
                  alt="Studio photo preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-neutral-500">
                  Paste an image URL to preview it
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Amenities"
            subtitle="Select everything that is included in the hourly rate."
          >
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => {
                const selected = form.amenities.includes(amenity);

                return (
                  <button
                    key={amenity}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleAmenity(amenity)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${selected
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/10 text-neutral-400 hover:border-white/25 hover:text-neutral-200"
                      }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Detailed overview"
            subtitle="Describe the space, the vibe, and what a guest books."
          >
            <textarea
              rows={5}
              maxLength={600}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] p-3 text-[14px] text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-white/30"
              value={form.overview}
              onChange={(event) => update("overview", event.target.value)}
              placeholder="A minimalist white cyclorama wall with a full studio set, ideal for portraits, fashion and product shoots."
            />
            <p className="mt-2 text-right text-[11px] text-neutral-500">
              {form.overview.length} / 600 characters
            </p>
          </SectionCard>

          <SectionCard
            title="Host details"
            subtitle="Guests see this after they book, and cannot change it later."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Host name">
                <input
                  className={inputClass}
                  value={hostName}
                  onChange={(event) => update("hostName", event.target.value)}
                />
              </Field>

              <Field label="Host email">
                <input
                  type="email"
                  className={inputClass}
                  value={hostEmail}
                  onChange={(event) => update("hostEmail", event.target.value)}
                />
              </Field>
            </div>
          </SectionCard>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-10 rounded-full px-5 text-[14px] text-neutral-300 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-full bg-white px-5 text-[14px] font-medium text-neutral-950 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Publishing..." : "Publish studio"}
            </button>
          </div>
        </form>


        <aside className="hidden space-y-4 lg:sticky lg:top-6 lg:block lg:self-start">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">

            {preview ? (
              <img
                src={preview}
                alt="Studio photo preview"
                className="aspect-[16/10] w-full rounded-lg object-cover"
              />
            ) : (
              <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-blue-600/50 via-neutral-800 to-black" />
            )}

            <div className="px-1 pt-3">
              <span className="text-[11px] text-neutral-400">{form.category}</span>
              <h3 className="mt-1 text-[15px] font-semibold text-white">
                {form.title || "Your studio title"}
              </h3>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-[14px] font-semibold text-white">
                  ${form.hourlyRate || "0"}
                  <span className="ml-1 text-[11px] font-normal text-neutral-400">/hr</span>
                </p>
                <span className="text-[11px] text-neutral-400">Hourly</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-[13px] font-semibold text-white">Listing tips</h3>
            <ol className="mt-3 space-y-2 text-[11px] leading-relaxed text-neutral-400">
              <li className="flex gap-2">
                <span className="text-neutral-500">1.</span>
                <span>Lead with the space type and a location, like &quot;Sound Stage, Gulshan&quot;.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-500">2.</span>
                <span>Pick a deposit that covers equipment, not the full rate.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-500">3.</span>
                <span>List every amenity; renters filter by them.</span>
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudioForm;
