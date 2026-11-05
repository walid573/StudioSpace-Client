"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { IMGBB_MAX_BYTES, isAcceptedImage, uploadToImgBB } from "@/lib/imgbb-upload";

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
const CATEGORIES = ["Photo Studio", "Film Stage", "Podcast Lounge", "Music Suite", "Workshop"];
const AMENITIES = [
  "Professional lighting", "Backdrop system", "Soundproofing", "Parking", "Green room",
  "Air conditioning", "Lighting kit", "Makeup station", "Changing room", "Kitchenette", "Restroom",
];
const NUMBERS = [
  ["hourlyRate", "Hourly rate", 0],
  ["securityDeposit", "Deposit", 0],
  ["maxCapacity", "Max capacity", 1],
] as const;

export type EditableStudio = {
  _id: string;
  title?: string;
  category?: string;
  hourlyRate?: number;
  securityDeposit?: number;
  maxCapacity?: number | string;
  capacity?: string;
  address?: string;
  imageUrl?: string;
  gallery?: string[];
  amenities?: string[];
  overview?: string;
  description?: string;
  location?: { address?: string; city?: string; area?: string };
};

const toForm = (s: EditableStudio) => ({
  title: s.title ?? "",
  category: s.category ?? CATEGORIES[0],
  hourlyRate: String(s.hourlyRate ?? ""),
  securityDeposit: String(s.securityDeposit ?? ""),
  maxCapacity: String(s.maxCapacity ?? s.capacity?.replace(/\D/g, "") ?? ""),
  address: s.address ?? s.location?.address ?? "",
  imageUrl: s.imageUrl ?? s.gallery?.[0] ?? "",
  amenities: s.amenities ?? ([] as string[]),
  overview: s.overview ?? s.description ?? "",
});

const input =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50";
const cap = "text-[11px] font-medium text-neutral-400";

const isValidImageUrl = (u: string) => /^(https?:\/\/|data:image\/)/i.test(u);


function describeError(error: unknown) {
  if (error instanceof TypeError) {
    return "Network error — check your connection and try again.";
  }
  return error instanceof Error ? error.message : "Please try again.";
}

async function uploadImage(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error("Image upload is not configured.");
  }
  const uploaded = await uploadToImgBB(file, IMGBB_API_KEY);
  return uploaded.url;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className={cap}>{label}</span>
    <div className="mt-1.5">{children}</div>
  </label>
);

async function api(path: string, token: string, init: RequestInit = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...init.headers },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

const err = (title: string, description?: string) =>
  toast.add({ title, description, type: "error" });

type FormKey =
  | "title" | "category" | "hourlyRate" | "securityDeposit"
  | "maxCapacity" | "address" | "overview" | "imageUrl";

type Props = {
  studio: EditableStudio;
  hostName?: string;
  hostEmail?: string;
};

export function StudioEditForm({ studio, hostName, hostEmail }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(() => toForm(studio));
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [brokenFor, setBrokenFor] = useState("");

  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : form.imageUrl.trim()),
    [file, form.imageUrl],
  );
  const broken = preview !== "" && brokenFor === preview;
  useEffect(() => () => { if (file) URL.revokeObjectURL(preview); }, [file, preview]);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const bind = (key: FormKey) => ({
    value: form[key],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => set({ [key]: e.target.value }),
  });

  function pickFile(f?: File) {
    if (!f) return;
    if (!isAcceptedImage(f)) return err("Pick a JPG, PNG, WebP or GIF image");
    if (f.size > IMGBB_MAX_BYTES) return err("Image must be under 5 MB");
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return err("Enter a studio title");

    const url = form.imageUrl.trim();
    if (!file && url && !isValidImageUrl(url)) {
      return err("Image URL must start with http(s):// or data:image/");
    }

    const address = form.address.trim();
    const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
    const multi = parts.length > 1;

    setSaving(true);
    try {
      const token = await getTokenFromClient();
      if (!token) throw new Error("You're signed out. Please log in again.");

      let imageUrl = url;
      let upload: File | null = file;

      if (!upload && imageUrl.startsWith("data:image/")) {
        const blob = await (await fetch(imageUrl)).blob();
        upload = new File([blob], "cover.jpg", { type: blob.type || "image/jpeg" });
      }

      if (upload) {
        if (upload.size > IMGBB_MAX_BYTES) throw new Error("Image must be under 5 MB");
        imageUrl = await uploadImage(upload);
      }

      await api(`/studios/${studio._id}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title,
          hourlyRate: Number(form.hourlyRate) || 0,
          securityDeposit: Number(form.securityDeposit) || 0,
          maxCapacity: Number(form.maxCapacity) || 1,
          address,
          description: form.overview,
          location: { city: multi ? parts.at(-1) : "", area: multi ? parts.at(-2) : parts[0] ?? "", address },
          imageUrl,
          gallery: imageUrl ? [imageUrl] : [],
        }),
      });

      toast.add({
        title: "Studio updated",
        description: `${title} has been saved.`,
        type: "success",
      });
      router.push("/my-listings");
      router.refresh();
    } catch (e) {
      toast.add({
        title: "Couldn't save studio",
        description: describeError(e),
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {hostName && hostEmail && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Host name">
            <input className={input} value={hostName} readOnly disabled />
          </Field>
          <Field label="Host email">
            <input className={input} value={hostEmail} readOnly disabled />
          </Field>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Studio title">
          <input className={input} placeholder="e.g. Urban Portrait Studio" {...bind("title")} />
        </Field>
        <Field label="Category">
          <select
            className={`${input} cursor-pointer [color-scheme:dark] [&>option]:bg-popover [&>option]:text-white`}
            {...bind("category")}
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {NUMBERS.map(([key, text, min]) => (
          <Field key={key} label={text}>
            <input type="number" min={min} className={input} {...bind(key)} />
          </Field>
        ))}
      </div>

      <Field label="Address">
        <input className={input} placeholder="Area, city" {...bind("address")} />
      </Field>

      <div>
        <span className={cap}>Cover image</span>
        <div className="mt-1.5 flex items-start gap-3">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files[0]); }}
            className="relative flex h-28 w-44 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/20 bg-white/[0.04] text-neutral-400 transition-colors hover:border-white/40"
          >
            {preview && !broken ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Studio cover"
                onError={() => setBrokenFor(preview)}
                className="size-full object-cover"
              />
            ) : (
              <span className="flex flex-col items-center gap-1 text-[11px]">
                <ImagePlus className="size-5" aria-hidden="true" />
                {broken ? "Can't load image" : "Drop or click"}
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }}
            />
          </label>

          <div className="min-w-0 flex-1 space-y-2">
            <input
              type="text"
              inputMode="url"
              className={`${input} truncate`}
              placeholder="…or paste an image URL (https://)"
              disabled={!!file}
              {...bind("imageUrl")}
            />
            <div className="space-y-1 text-[11px] text-neutral-400">
              <p>
                {file
                  ? `${file.name} — uploads to ImgBB when you save.`
                  : `JPG, PNG or WebP, up to 5 MB.`}
              </p>
              <div className="flex gap-3">
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="inline-flex items-center gap-1 text-neutral-300 hover:text-white"
                  >
                    <X className="size-3" aria-hidden="true" />
                    Discard new image
                  </button>
                )}
                {!file && form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => set({ imageUrl: "" })}
                    className="inline-flex items-center gap-1 text-neutral-300 hover:text-white"
                  >
                    <X className="size-3" aria-hidden="true" />
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <span className={cap}>Amenities</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const on = form.amenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  set({ amenities: on ? form.amenities.filter((x) => x !== a) : [...form.amenities, a] })
                }
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                  on
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-white/10 text-neutral-400 hover:border-white/25 hover:text-neutral-200"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Overview">
        <textarea
          rows={3}
          maxLength={600}
          className={`${input} h-auto resize-none p-3`}
          placeholder="Describe the space, the light, and what a guest books."
          {...bind("overview")}
        />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/my-listings")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (file ? "Uploading…" : "Saving…") : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
