const CDN_SUFFIX = "?auto=format&fit=crop&w=800&q=80";

export function isImageSource(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const src = value.trim();

 
  if (src.startsWith("//")) return false;

  return (
    src.startsWith("data:image/") ||
    src.startsWith("blob:") ||
    src.startsWith("/") ||
    /^https?:\/\//i.test(src)
  );
}

export function toDisplayImage(imageUrl?: string | null): string {
  if (typeof imageUrl !== "string") return "";

  const src = imageUrl.trim();
  if (!isImageSource(src)) return "";

  if (!/^https?:\/\//i.test(src)) return src;

  return src.includes("?") ? src : `${src}${CDN_SUFFIX}`;
}
