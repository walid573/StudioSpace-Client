"use client";

import { Pencil } from "lucide-react";

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


const GHOST_BUTTON =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-3 text-[12px] text-neutral-200 transition-colors hover:bg-white/[0.06]";

type Props = {
  booking: Booking;
  onUpdated: (updated: Booking) => void;
};

export default function EditBooking({ booking, onUpdated }: Props) {
  // TODO: add state for the edit form / modal, send changes to your Express route,
  // then call onUpdated({ ...booking, ...changes }) after the server says OK.
  return (
    <button type="button" className={GHOST_BUTTON}>
      <Pencil className="size-3.5" aria-hidden="true" />
      Edit
    </button>
  );
}