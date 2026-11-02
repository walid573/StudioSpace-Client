"use client";

import { Share2 } from "lucide-react";

import { toast } from "@/components/ui/toast";

export default function ShareProfileButton() {
  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: "StudioSpace profile", url });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.add({
        title: "Profile link copied",
        description: "Share it with your network.",
        type: "success",
      });
    } catch {
      toast.add({
        title: "Couldn't share your profile",
        description: "Copy the address from your browser instead.",
        type: "error",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-[12px] font-medium text-foreground transition-colors hover:border-border/80 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Share2 className="size-3.5" aria-hidden="true" />
      Share profile
    </button>
  );
}
