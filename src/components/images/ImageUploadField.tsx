"use client";

/* eslint-disable @next/next/no-img-element -- arbitrary hosts, next/image can't optimize */

import { useEffect, useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IMGBB_ACCEPTED_TYPES, IMGBB_MAX_BYTES, isAcceptedImage, uploadToImgBB } from "@/lib/imgbb-upload";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  showUrlInput?: boolean;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
  fallback?: string;
  className?: string;
};

export default function ImageUploadField({
  value,
  onChange,
  label = "Profile photo",
  hint,
  showUrlInput = true,
  disabled = false,
  onUploadingChange,
  fallback,
  className,
}: Props) {
  const [typed, setTyped] = useState("");
  const [local, setLocal] = useState(""); 
  const [progress, setProgress] = useState<number | null>(null); 
  const [error, setError] = useState("");
  const ctrl = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const uploading = progress !== null;
  const locked = disabled || uploading;
  const preview = local || value;

  useEffect(() => onUploadingChange?.(uploading), [onUploadingChange, uploading]);
  useEffect(() => () => ctrl.current?.abort(), []);
  useEffect(() => () => { if (local) URL.revokeObjectURL(local); }, [local]);

  async function upload(file: File) {
    if (!isAcceptedImage(file)) return setError("Choose a JPG, PNG, WebP or GIF image.");
    if (file.size > IMGBB_MAX_BYTES) return setError("That image is larger than 5 MB.");

    ctrl.current?.abort();
    const c = (ctrl.current = new AbortController());
    setLocal(URL.createObjectURL(file));
    setError("");
    setProgress(0);

    try {
      const { url } = await uploadToImgBB(file, setProgress, c.signal);
      if (c.signal.aborted) return;
      setTyped("");
      onChange(url);
    } catch (e) {
      if (c.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Could not upload the image.");
    } finally {
      if (!c.signal.aborted) {
        setProgress(null);
        setLocal("");
      }
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-xs font-medium">{label}</Label>}

      <div className="flex items-center gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border bg-muted">
          {preview ? (
            <img
              key={preview} 
              src={preview}
              alt=""
              className="size-full object-cover"
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
            />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
              {fallback?.trim().charAt(0).toUpperCase() || <ImageUp className="size-6" />}
            </span>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
        </div>

        <div
          className="min-w-0 flex-1 space-y-2 rounded-xl border-2 border-dashed px-3 py-3 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f && !locked) void upload(f);
          }}
        >
          <p className="text-xs text-muted-foreground">
            {hint ?? "Drop an image or upload. JPG, PNG, WebP or GIF, max 5 MB."}
          </p>
          <Button type="button" size="sm" variant="outline" disabled={locked} onClick={() => input.current?.click()}>
            {uploading ? `Uploading… ${progress}%` : value ? "Replace photo" : "Choose file"}
          </Button>
          <input
            ref={input}
            type="file"
            hidden
            accept={IMGBB_ACCEPTED_TYPES.join(",")}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = ""; 
            }}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      {showUrlInput && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Or paste an image link
            <Input
              type="url"
              inputMode="url"
              placeholder="https://i.ibb.co/your-photo.jpg"
              value={typed}
              disabled={locked}
              className="mt-1.5 h-9"
              onChange={(e) => {
                ctrl.current?.abort(); 
                setError("");
                setTyped(e.target.value);
                onChange(e.target.value.trim());
              }}
            />
          </Label>
        </div>
      )}
    </div>
  );
}