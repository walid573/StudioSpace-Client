"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

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
import { getTokenFromClient } from "@/lib/getTokenFromClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

type DeleteStudioDialogProps = {
  studioId: string;
  studioTitle: string;
  triggerClassName?: string;
  label?: string;
  
  redirectTo?: string;
  onDeleted?: () => void;
};

export default function DeleteStudioDialog({
  studioId,
  studioTitle,
  triggerClassName,
  label = "Delete",
  redirectTo,
  onDeleted,
}: DeleteStudioDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);

    try {
      const token = await getTokenFromClient()
      const response = await fetch(`${API_URL}/studios/${studioId}`, {
        method: "DELETE",
        headers:{
          authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      setOpen(false);
      toast.add({
        title: "Studio deleted",
        description: `${studioTitle} has been removed.`,
        type: "success",
      });

      onDeleted?.();

      if (redirectTo) {
        router.push('/studios');
        router.refresh()
      }

      router.refresh();
    } catch {
      toast.add({
        title: "Couldn't delete studio",
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

      <AlertDialogContent className="border border-border bg-popover text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Delete this studio?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            &quot;{studioTitle}&quot; will be permanently removed. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
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
