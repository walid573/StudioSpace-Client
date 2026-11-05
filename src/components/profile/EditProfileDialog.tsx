"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import ImageUploadField from "@/components/images/ImageUploadField";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

type EditProfileDialogProps = {
  name: string;
  image?: string | null;
  triggerClassName: string;
};

type FormState = {
  name: string;
  image: string;
};

export default function EditProfileDialog({
  name,
  image,
  triggerClassName,
}: EditProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ name, image: image ?? "" });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setForm({ name, image: image ?? "" });
    }
  }

  function update(field: keyof FormState, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploadingPhoto) return;

    const nextName = form.name.trim();
    if (!nextName) {
      toast.add({ title: "Name is required", type: "error" });
      return;
    }

    setSaving(true);

    try {
      const { error } = await authClient.updateUser({
        name: nextName,
        image: form.image.trim() || null,
      });

      if (error) {
        throw new Error(error.message ?? "Couldn't update profile");
      }

      setOpen(false);
      router.refresh();
      toast.add({
        title: "Profile updated",
        description: "Your changes have been saved.",
        type: "success",
      });
    } catch (error) {
      toast.add({
        title: "Couldn't update profile",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={triggerClassName}>Edit profile</DialogTrigger>

      <DialogContent className="border border-border bg-popover text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-foreground">Edit profile</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">
            Update the name and photo shown on your StudioSpace profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name" className="text-[12px] text-muted-foreground">
              Name
            </Label>
            <Input
              id="profile-name"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <ImageUploadField
              value={form.image}
              onChange={(url) => update("image", url)}
              onUploadingChange={setUploadingPhoto}
              fallback={form.name}
              label="Profile photo"
              hint="JPG or PNG, up to 5 MB. Leave blank to use your initials."
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={saving || uploadingPhoto}>
              {saving ? "Saving." : uploadingPhoto ? "Uploading." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
