/**
 * Proxy for ImgBB uploads. Keeps the ImgBB API key on the server — the
 * browser only ever talks to /api/upload.
 */
const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  const apiKey =
    process.env.IMGBB_API_KEY ?? process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        success: false,
        error: {
          message:
            "Image upload is not configured (IMGBB_API_KEY is missing on the server).",
        },
      },
      { status: 500 },
    );
  }

  let image: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("image");
    image = value instanceof File ? value : null;
  } catch {
    image = null;
  }

  if (!image) {
    return Response.json(
      { success: false, error: { message: "No image file was provided." } },
      { status: 400 },
    );
  }

  const typeOk =
    ACCEPTED_TYPES.includes(image.type) ||
    (!image.type && /\.(jpe?g|png|webp|gif)$/i.test(image.name));
  if (!typeOk) {
    return Response.json(
      {
        success: false,
        error: { message: "That file is not a JPG, PNG, WebP or GIF image." },
      },
      { status: 415 },
    );
  }

  if (image.size > MAX_BYTES) {
    return Response.json(
      { success: false, error: { message: "Image is larger than 5 MB." } },
      { status: 413 },
    );
  }

  const outbound = new FormData();
  outbound.append("key", apiKey);
  outbound.append("image", image, image.name || "image");

  try {
    const res = await fetch(IMGBB_ENDPOINT, {
      method: "POST",
      body: outbound,
      signal: AbortSignal.timeout(60_000),
    });
    const json: unknown = await res.json().catch(() => undefined);

    const parsed = json as
      | { success?: boolean; error?: { message?: string } }
      | undefined;

    if (!res.ok || !parsed?.success) {
      return Response.json(
        parsed ?? {
          success: false,
          error: { message: `ImgBB upload failed (HTTP ${res.status}).` },
        },
        { status: 502 },
      );
    }

    return Response.json(json);
  } catch {
    return Response.json(
      {
        success: false,
        error: { message: "Could not reach ImgBB. Try again in a moment." },
      },
      { status: 502 },
    );
  }
}
