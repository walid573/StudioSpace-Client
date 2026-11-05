
"use client";

import { useState } from "react";
import { CalendarX } from "lucide-react";
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
import { getTokenFromClient } from "@/lib/getTokenFromClient";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

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
  label = "Cancel Booking",
  onDeleted,
}: DeleteBookingProps) {
  const { data: session } = authClient.useSession();

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  async function handleDelete() {
    if (!session?.user?.email) {
      toast.add({
        title: "Please log in again",
        description: "We couldn't find your account.",
        type: "error",
      });
      return;
    }

    setDeleting(true);

    try {
     
      const token = await getTokenFromClient();

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      
      const response = await fetch(
        `${API_URL}/my-bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.msg ||
            `Request failed (${response.status})`
        );
      }

     
      setOpen(false);

    
      toast.add({
        title: "Booking cancelled",
        description: studioTitle
          ? `Your reservation for ${studioTitle} has been cancelled.`
          : "Your booking has been cancelled.",
        type: "success",
      });

  
      onDeleted(bookingId);
      router.refresh();
    } catch (error) {
      console.error("Cancel booking error:", error);

      toast.add({
        title: "Couldn't cancel booking",
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className={triggerClassName}
        disabled={deleting}
      >
        <CalendarX className="size-3.5" aria-hidden="true" />
        {label}
      </AlertDialogTrigger>

      <AlertDialogContent className="dark border border-white/10 bg-card text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Cancel this booking?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-neutral-400">
            {studioTitle
              ? `Your reservation for "${studioTitle}" will be withdrawn.`
              : "This reservation will be withdrawn."}{" "}
            This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            Keep booking
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
            disabled={deleting}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {deleting ? "Cancelling…" : "Cancel booking"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
