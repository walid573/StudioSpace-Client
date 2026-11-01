"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const DEFAULT_TRIGGER =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-red-500/30 px-3 text-[12px] text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50";

type DeleteBookingProps = {
  bookingId: string;
  studioTitle?: string;
  triggerClassName?: string;
  label?: string;
  onDeleted: (id: string) => void;
};

export default function DeleteBooking({
  bookingId,
  studioTitle,
  triggerClassName = DEFAULT_TRIGGER,
  label = "Delete",
  onDeleted,
}: DeleteBookingProps) {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const email = session?.user?.email;
    if (!email) {
      toast.add({
        title: "Please log in again",
        description: "We couldn't find your account.",
        type: "error",
      });
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(
        `${API_URL}/my-bookings/${bookingId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? `Request failed (${response.status})`);
      }

      setOpen(false);
      toast.add({
        title: "Booking deleted",
        description: studioTitle
          ? `Your booking for ${studioTitle} has been removed.`
          : "Your booking has been removed.",
        type: "success",
        
      });
      router.refresh();
      onDeleted(bookingId);
    } catch {
      toast.add({
        title: "Couldn't delete booking",
        description: "Please try again.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className={triggerClassName} disabled={deleting}>
        <Trash2 className="size-3.5" aria-hidden="true" />
        {label}
      </AlertDialogTrigger>

      <AlertDialogContent className="dark border border-white/10 bg-[#111111] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete this booking?</AlertDialogTitle>
          <AlertDialogDescription className="text-neutral-400">
            {studioTitle ? (
              <>
                Your booking for &quot;{studioTitle}&quot; will be permanently removed.
              </>
            ) : (
              "This booking will be permanently removed."
            )}{" "}
            This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault(); // keep the dialog open until the request finishes
              handleDelete();
            }}
            disabled={deleting}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}