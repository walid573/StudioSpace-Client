const CDN_SUFFIX = "?auto=format&fit=crop&w=800&q=80";

/**
 * Image URLs come straight from the database, so they can be empty, base64
 * uploads, root-relative paths, or plain junk someone typed into a form.
 *
 * `next/image` throws for anything that is not an absolute URL, a `data:`/`blob:`
 * URL or a root-relative path, so callers must check before rendering.
 */
export function isImageSource(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const src = value.trim();

  // `//host/path` is rejected by next/image (it needs an explicit protocol).
  if (src.startsWith("//")) return false;

  return (
    src.startsWith("data:image/") ||
    src.startsWith("blob:") ||
    src.startsWith("/") ||
    /^https?:\/\//i.test(src)
  );
}

/**
 * Returns a src that is safe to render, or "" when there is nothing usable.
 * Only plain http(s) URLs get the CDN resize params — appending them to a base64
 * `data:` URL corrupts the payload.
 */
export function toDisplayImage(imageUrl?: string | null): string {
  if (typeof imageUrl !== "string") return "";

  const src = imageUrl.trim();
  if (!isImageSource(src)) return "";

  if (!/^https?:\/\//i.test(src)) return src;

  return src.includes("?") ? src : `${src}${CDN_SUFFIX}`;
}
