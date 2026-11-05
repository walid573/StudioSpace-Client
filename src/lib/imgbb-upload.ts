export type ImgBBUploadResult = {
  url: string;
  displayUrl: string;
  deleteUrl: string;
  thumbUrl: string;
};

type ImgBBResponse = {
  success: boolean;
  error?: { message?: string };
  data?: {
    url: string;
    display_url?: string;
    delete_url?: string;
    thumb?: { url?: string };
  };
};

const ENDPOINT = "https://api.imgbb.com/1/upload";
export const IMGBB_MAX_BYTES = 5 * 1024 * 1024;
export const IMGBB_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function isAcceptedImage(file: File): boolean {
  return (
    IMGBB_ACCEPTED_TYPES.includes(file.type) ||
    (!file.type && /\.(jpe?g|png|webp|gif)$/i.test(file.name))
  );
}

export async function uploadToImgBB(
  file: File,
  apiKey: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<ImgBBUploadResult> {
  if (!apiKey) throw new Error("ImgBB API key is missing.");
  if (!isAcceptedImage(file)) throw new Error("That file is not a JPG, PNG, WebP or GIF image.");
  if (file.size > IMGBB_MAX_BYTES) throw new Error("Image is larger than 5 MB.");

  const body = new FormData();
  body.append("key", apiKey);
  body.append("image", file);

  return new Promise((resolve, reject) => {
    const fail = (message: string) => reject(new Error(message));
    const xhr = new XMLHttpRequest();

    xhr.open("POST", ENDPOINT);
    xhr.timeout = 60_000;
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let res: ImgBBResponse | undefined;
      try {
        res = JSON.parse(xhr.responseText);
      } catch {
        /* fall through to the generic error */
      }

      const d = res?.data;
      if (!res?.success || !d) {
        return fail(res?.error?.message ?? `ImgBB upload failed (HTTP ${xhr.status}).`);
      }

      onProgress?.(100);
      resolve({
        url: d.url,
        displayUrl: d.display_url ?? d.url,
        deleteUrl: d.delete_url ?? "",
        thumbUrl: d.thumb?.url ?? d.url,
      });
    };

    xhr.onerror = () => fail("Could not reach ImgBB. Check your connection and try again.");
    xhr.ontimeout = () => fail("The upload to ImgBB timed out. Try a smaller image.");
    xhr.onabort = () => fail("Upload cancelled.");

    xhr.send(body);
  });
}