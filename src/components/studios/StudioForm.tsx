"use client";

/* eslint-disable @next/next/no-img-element -- previews show user-typed URLs from any host, so next/image cannot optimize them. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { isImageSource } from "@/lib/images";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import {
  uploadToImgBB,
  isAcceptedImage,
  IMGBB_ACCEPTED_TYPES,
  IMGBB_MAX_BYTES,
} from "@/lib/imgbb-upload";
import { toast } from "../ui/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

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

type TextField = Exclude<keyof FormState, "amenities">;

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
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "studio";

/* ---------- tiny UI helpers ---------- */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-[12px] text-muted-foreground">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MoneyInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] text-muted-foreground">
        $
      </span>
      <input type="number" min={0} className={`${inputClass} pl-7`} {...props} />
    </div>
  );
}

/* ---------- upload logic, kept out of the component ---------- */

type UploadState = {
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  url: string;
  error: string | null;
};

const IDLE: UploadState = { status: "idle", progress: 0, url: "", error: null };

function usePhotoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>(IDLE);
  const [localUrl, setLocalUrl] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const pendingRef = useRef<Promise<string> | null>(null);

 
  useEffect(() => {
    if (!file) {
      setLocalUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => abortRef.current?.abort(), []);

  
  function start(next: File): Promise<string> {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setFile(next);
    setState({ ...IDLE, status: "uploading" });

    const run = uploadToImgBB(
      next,
      IMGBB_API_KEY ?? "",
      (progress) => setState((s) => ({ ...s, progress })),
      ctrl.signal,
    )
      .then(({ url }) => {
        if (ctrl.signal.aborted) return "";
        setState({ status: "success", progress: 100, url, error: null });
        return url;
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return "";
        const message = err instanceof Error ? err.message : "Could not upload the image.";
        setState({ ...IDLE, status: "error", error: message });
        toast.add({ title: "Upload failed", description: message, type: "error", timeout: 6000 });
        return "";
      });

    pendingRef.current = run;
    return run;
  }

  function pick(next: File) {
    const problem = !isAcceptedImage(next)
      ? "Choose a JPG, PNG, WebP or GIF image."
      : next.size > IMGBB_MAX_BYTES
        ? "That image is larger than 5 MB. Pick a smaller file."
        : null;

    if (problem) {
      toast.add({ title: "Can't use that file", description: problem, type: "error", timeout: 5000 });
      return;
    }
    void start(next);
  }

  function reset() {
    abortRef.current?.abort();
    pendingRef.current = null;
    setFile(null);
    setState(IDLE);
  }

  return { file, localUrl, ...state, pick, start, reset, pending: () => pendingRef.current };
}

/* ---------- the form ---------- */

const StudioForm = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [brokenPreview, setBrokenPreview] = useState("");
  const upload = usePhotoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hostName = form.hostName ?? session?.user?.name ?? "";
  const hostEmail = form.hostEmail ?? session?.user?.email ?? "";

 
  const preview = upload.localUrl || form.imageUrl.trim();
  const previewSrc = preview !== brokenPreview ? preview : "";

  function update(field: TextField, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  const bind = (field: TextField, value: string = form[field] ?? "") => ({
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      update(field, e.target.value),
  });

  function toggleAmenity(amenity: string) {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(amenity)
        ? p.amenities.filter((a) => a !== amenity)
        : [...p.amenities, amenity],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const title = form.title.trim();
    if (!title) {
      setError("Enter a studio title.");
      return;
    }
    setError(null);
    setSubmitting(true);

   
    let uploadedUrl = upload.url;
    if (upload.file && !uploadedUrl) {
      uploadedUrl = (await upload.pending()) || (await upload.start(upload.file));
      if (!uploadedUrl) {
       
        setSubmitting(false);
        return;
      }
    }

    const coverImage = uploadedUrl || (isImageSource(form.imageUrl) ? form.imageUrl.trim() : "");

    const parts = form.address.split(",").map((p) => p.trim()).filter(Boolean);
    const body = {
      ...form,
      title,
      hostName: hostName.trim() || null,
      hostEmail: hostEmail.trim().toLowerCase() || null,
      imageUrl: coverImage,
      hourlyRate: Number(form.hourlyRate),
      securityDeposit: Number(form.securityDeposit),
      maxCapacity: Number(form.maxCapacity),
      gallery: coverImage ? [coverImage] : [],
      slug: slugify(title),
      location: {
        city: parts.length > 1 ? parts[parts.length - 1] : "",
        area: parts.length > 1 ? parts[parts.length - 2] : (parts[0] ?? ""),
        address: form.address.trim(),
      },
      description: form.overview,
    };

    const toastId = toast.add({
      title: "Publishing studio...",
      description: "Please wait while we save your listing.",
      type: "loading",
      timeout: 0,
    });
    const finish = (type: "success" | "error", title: string, description: string) =>
      toast.update(toastId, { title, description, type, timeout: 5000 });

    try {
      const token = await getTokenFromClient();
      const res = await fetch(`${API_URL}/studios`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        return finish("error", "Couldn't add studio", `Could not save the studio (error ${res.status}). Please try again.`);
      }

      finish("success", "Studio added", `${title} is now listed.`);
      router.push("/my-listings");
      router.refresh();
    } catch {
      finish("error", "Couldn't add studio", "Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <header>
        <p className="text-[11px] text-muted-foreground">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <span className="mx-1.5">/</span>
          Add New Studio
        </p>
        <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] sm:text-[30px]">Add a new studio</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
          List your space and start getting bookings. You can edit everything later from My Studio Listings.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <SectionCard title="Basics" subtitle="What are you listing?">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Studio title">
                <input className={inputClass} placeholder="e.g. Cyclorama White Loft" {...bind("title")} />
              </Field>
              <Field label="Category">
                <select className={`${inputClass} cursor-pointer`} {...bind("category")}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Pricing and capacity" subtitle="Set your hourly rate and how many people fit.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Hourly rate" hint="Rounded per hour">
                <MoneyInput {...bind("hourlyRate")} />
              </Field>
              <Field label="Security deposit" hint="Refundable if nothing is damaged">
                <MoneyInput {...bind("securityDeposit")} />
              </Field>
              <Field label="Max capacity" hint="People allowed at once">
                <input type="number" min={1} className={inputClass} {...bind("maxCapacity")} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Location" subtitle="Guests use the area and address when they book.">
            <Field label="Address">
              <input className={inputClass} placeholder="House, road, area, city" {...bind("address")} />
            </Field>
          </SectionCard>

          <SectionCard title="Photos" subtitle="Add a cover photo for your studio listing.">
            <Field label="Image URL" hint="A direct link to a .jpg, .png or .webp file">
              <input
                className={inputClass}
                placeholder="https://.../your-image.jpg"
                {...bind("imageUrl")}
                onChange={(e) => {
                  update("imageUrl", e.target.value);
                  if (upload.file) upload.reset(); 
                }}
              />
            </Field>

            <div className="mt-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-medium text-foreground">OR Upload from Device</span>
                {upload.file && (
                  <span className="text-[11px] text-muted-foreground">
                    • {upload.file.name} ({Math.max(1, Math.round(upload.file.size / 1024))} KB)
                  </span>
                )}
              </div>

              <div
                className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  upload.file ? "border-primary bg-primary/5" : "border-border bg-muted/10 hover:border-border/80"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) upload.pick(dropped);
                }}
              >
                <div className="space-y-3">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted/50">
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-[13px] font-medium text-foreground">Drop an image here or upload</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      JPG, PNG, WebP or GIF, up to 5 MB. Uploads automatically to imgbb.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {upload.file ? "Choose another file" : "Choose file"}
                    </button>

                    {upload.status === "error" && upload.file && (
                      <button
                        type="button"
                        onClick={() => void upload.start(upload.file!)}
                        className="h-8 rounded-full border border-border px-4 text-[12px] font-medium text-foreground transition-colors hover:border-border/80 hover:bg-muted/40"
                      >
                        Retry upload
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept={IMGBB_ACCEPTED_TYPES.join(",")}
                    className="hidden"
                    onChange={(e) => {
                      const picked = e.target.files?.[0];
                      if (picked) upload.pick(picked);
                      e.target.value = ""; 
                    }}
                  />

                  {upload.status === "uploading" && (
                    <div className="mx-auto max-w-xs space-y-1.5">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Uploading to ImgBB… {upload.progress}%</p>
                    </div>
                  )}

                  {upload.status === "success" && (
                    <div className="flex items-center justify-center gap-1.5 text-emerald-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-[11px] font-medium">Uploaded to ImgBB</span>
                    </div>
                  )}

                  {upload.status === "error" && <p className="text-[11px] text-red-500">{upload.error}</p>}
                </div>
              </div>
            </div>

            <div className="mt-4 h-52 overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="Studio photo preview"
                  className="h-full w-full object-cover"
                  onError={() => setBrokenPreview(preview)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
                  {form.imageUrl ? "Paste a valid image URL to preview it" : "Your photo preview will appear here"}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Amenities" subtitle="Select everything that is included in the hourly rate.">
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => {
                const selected = form.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleAmenity(amenity)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Detailed overview" subtitle="Describe the space, the vibe, and what a guest books.">
            <textarea
              rows={5}
              maxLength={600}
              className="w-full resize-none rounded-lg border border-border bg-background p-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
              placeholder="A minimalist white cyclorama wall with a full studio set, ideal for portraits, fashion and product shoots."
              {...bind("overview")}
            />
            <p className="mt-2 text-right text-[11px] text-muted-foreground">
              {form.overview.length} / 600 characters
            </p>
          </SectionCard>

          <SectionCard title="Host details" subtitle="Guests see this after they book, and cannot change it later.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Host name">
                <input className={inputClass} {...bind("hostName", hostName)} />
              </Field>
              <Field label="Host email">
                <input type="email" className={inputClass} {...bind("hostEmail", hostEmail)} />
              </Field>
            </div>
          </SectionCard>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-10 rounded-full px-5 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-full bg-primary px-5 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Publishing..." : "Publish studio"}
            </button>
          </div>
        </form>

        <aside className="hidden space-y-4 lg:sticky lg:top-6 lg:block lg:self-start">
          <div className="rounded-xl border border-border bg-card p-3">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt="Studio photo preview"
                className="aspect-[16/10] w-full rounded-lg object-cover"
                onError={() => setBrokenPreview(preview)}
              />
            ) : (
              <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-blue-600/50 via-muted to-background" />
            )}

            <div className="px-1 pt-3">
              <span className="text-[11px] text-muted-foreground">{form.category}</span>
              <h3 className="mt-1 text-[15px] font-semibold text-foreground">
                {form.title || "Your studio title"}
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[14px] font-semibold text-foreground">
                  ${form.hourlyRate || "0"}
                  <span className="ml-1 text-[11px] font-normal text-muted-foreground">/hr</span>
                </p>
                <span className="text-[11px] text-muted-foreground">Hourly</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-[13px] font-semibold text-foreground">Listing tips</h3>
            <ol className="mt-3 space-y-2 text-[11px] leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span>1.</span>
                <span>Lead with the space type and a location, like &quot;Sound Stage, Gulshan&quot;.</span>
              </li>
              <li className="flex gap-2">
                <span>2.</span>
                <span>Pick a deposit that covers equipment, not the full rate.</span>
              </li>
              <li className="flex gap-2">
                <span>3.</span>
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