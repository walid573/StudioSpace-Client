"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

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
};

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-white/30";

function toForm(studio: EditableStudio): FormState {
  const capacity =
    studio.maxCapacity ?? studio.capacity?.replace(/[^0-9]/g, "") ?? "";

  return {
    title: studio.title ?? "",
    category: studio.category ?? CATEGORIES[0],
    hourlyRate: String(studio.hourlyRate ?? ""),
    securityDeposit: String(studio.securityDeposit ?? ""),
    maxCapacity: String(capacity),
    address: studio.address ?? studio.location?.address ?? "",
    imageUrl: studio.imageUrl ?? studio.gallery?.[0] ?? "",
    amenities: studio.amenities ?? [],
    overview: studio.overview ?? studio.description ?? "",
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-neutral-400">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

type EditStudioDialogProps = {
  studio: EditableStudio;
  triggerClassName?: string;
  label?: string;
  onUpdated?: () => void;
};

export default function EditStudioDialog({
  studio,
  triggerClassName,
  label = "Edit",
  onUpdated,
}: EditStudioDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => toForm(studio));
  const [saving, setSaving] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setForm(toForm(studio));
  }

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) {
      toast.add({ title: "Enter a studio title", type: "error" });
      return;
    }

    const parts = form.address
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    const imageUrl = form.imageUrl.trim();

    setSaving(true);
    const token = await getTokenFromClient()
    try {
      
      const response = await fetch(`${API_URL}/studios/${studio._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json",
          authorization: `Bearer ${token}`
         },
        body: JSON.stringify({
          title,
          category: form.category,
          hourlyRate: Number(form.hourlyRate) || 0,
          securityDeposit: Number(form.securityDeposit) || 0,
          maxCapacity: Number(form.maxCapacity) || 1,
          address: form.address.trim(),
          amenities: form.amenities,
          overview: form.overview,
          description: form.overview,
          location: {
            city: parts.length > 1 ? parts[parts.length - 1] : "",
            area: parts.length > 1 ? parts[parts.length - 2] : (parts[0] ?? ""),
            address: form.address.trim(),
          },
          ...(imageUrl ? { imageUrl, gallery: [imageUrl] } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      setOpen(false);
      toast.add({
        title: "Studio updated",
        description: `${title} has been saved.`,
        type: "success",
      });

      router.refresh();
      onUpdated?.();
    } catch {
      toast.add({
        title: "Couldn't save studio",
        description: "Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={triggerClassName}>
        <Pencil className="size-3.5" aria-hidden="true" />
        {label}
      </DialogTrigger>

      <DialogContent className="dark max-h-[85vh] overflow-y-auto border border-white/10 bg-card text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-white">Edit studio</DialogTitle>
          <DialogDescription className="text-[12px] text-neutral-400">
            Update the details guests see. Changes go live immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Studio title">
              <input
                className={inputClass}
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="e.g. Urban Portrait Studio"
              />
            </Field>

            <Field label="Category">
              <select
                className={`${inputClass} cursor-pointer [color-scheme:dark] [&>option]:bg-popover [&>option]:text-white`}
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

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Hourly rate">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.hourlyRate}
                onChange={(event) => update("hourlyRate", event.target.value)}
              />
            </Field>

            <Field label="Deposit">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.securityDeposit}
                onChange={(event) => update("securityDeposit", event.target.value)}
              />
            </Field>

            <Field label="Max capacity">
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.maxCapacity}
                onChange={(event) => update("maxCapacity", event.target.value)}
              />
            </Field>
          </div>

          <Field label="Address">
            <input
              className={inputClass}
              value={form.address}
              onChange={(event) => update("address", event.target.value)}
              placeholder="Area, city"
            />
          </Field>

          <Field label="Image URL">
            <input
              className={inputClass}
              value={form.imageUrl}
              onChange={(event) => update("imageUrl", event.target.value)}
              placeholder="https://.../your-image.jpg"
            />
          </Field>

          <div>
            <span className="text-[11px] font-medium text-neutral-400">Amenities</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => {
                const selected = form.amenities.includes(amenity);

                return (
                  <button
                    key={amenity}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleAmenity(amenity)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      selected
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/10 text-neutral-400 hover:border-white/25 hover:text-neutral-200"
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Overview">
            <textarea
              rows={3}
              maxLength={600}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] p-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-white/30"
              value={form.overview}
              onChange={(event) => update("overview", event.target.value)}
              placeholder="Describe the space, the light, and what a guest books."
            />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
