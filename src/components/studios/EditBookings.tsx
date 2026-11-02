"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Booking = {
  _id: string;
  studioId: string;
  date: string;
  start: string;
  end: string;
  hours: number;
  total: number;
  status: "pending" | "confirmed" | "declined";
};

export type Studio = {
  _id: string;
  title?: string;
  imageUrl?: string;
};

type FormState = {
  date: string;
  start: string;
  end: string;
};

const DEFAULT_TRIGGER =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[12px] text-foreground transition-colors hover:bg-accent";

const inputClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring";

function toForm(booking: Booking): FormState {
  return {
    date: booking.date ?? "",
    start: booking.start ?? "",
    end: booking.end ?? "",
  };
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

type EditBookingProps = {
  booking: Booking;
  studioTitle?: string;
  triggerClassName?: string;
  label?: string;
  onUpdated: (updated: Booking) => void;
};

export default function EditBooking({
  booking,
  studioTitle,
  triggerClassName = DEFAULT_TRIGGER,
  label = "Edit",
  onUpdated,
}: EditBookingProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => toForm(booking));
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const hours = form.start && form.end ? (toMinutes(form.end) - toMinutes(form.start)) / 60 : 0;
  const validRange = hours > 0;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setForm(toForm(booking));
  }

  function update(field: keyof FormState, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.date) {
      toast.add({ title: "Choose a date", type: "error" });
      return;
    }

    if (!validRange) {
      toast.add({ title: "End time must be after start time", type: "error" });
      return;
    }

    setSaving(true);

    try {
      const token = await getTokenFromClient();
      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(`${API_URL}/my-bookings/${booking._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: form.date,
          start: form.start,
          end: form.end,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? `Request failed (${response.status})`);
      }

      setOpen(false);
      router.refresh();
      toast.add({
        title: "Booking updated",
        description: studioTitle
          ? `Your booking for ${studioTitle} has been saved.`
          : "Your changes have been saved.",
        type: "success",
      });

      onUpdated(data);
    } catch (error) {
      toast.add({
        title: "Couldn't save booking",
        description: error instanceof Error ? error.message : "Please try again.",
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

      <DialogContent className="border border-border bg-popover text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-foreground">Edit booking</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">
            {studioTitle
              ? `Change the date or time for ${studioTitle}.`
              : "Change the date or time of your booking."}{" "}
            Only pending bookings can be edited.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Date">
            <input
              type="date"
              className={inputClass}
              value={form.date}
              onChange={(event) => update("date", event.target.value)}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Start time">
              <input
                type="time"
                className={inputClass}
                value={form.start}
                onChange={(event) => update("start", event.target.value)}
              />
            </Field>

            <Field label="End time">
              <input
                type="time"
                className={inputClass}
                value={form.end}
                onChange={(event) => update("end", event.target.value)}
              />
            </Field>
          </div>

          <p className={`text-[12px] ${validRange ? "text-muted-foreground" : "text-red-400"}`}>
            {validRange ? `${hours} hrs` : "End time must be after start time."}
          </p>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={saving || !validRange}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
