/* Shrink a photo in the browser before it is uploaded.
 *
 * The reason this exists is a hard limit we do not control: Vercel
 * refuses any request body over 4.5MB before our route runs. So a
 * form that accepts 10MB and posts it straight through would fail at
 * the platform with an error nobody can read, after telling somebody
 * their file was fine.
 *
 * Rather than cap what people may choose, we shrink what we send. A
 * modern phone photographs an Aadhaar card at 8-12MB; at 2000px on
 * the long edge it is a few hundred KB and MORE legible than the
 * original, because nothing downstream is resizing it badly.
 *
 * So the form can honestly accept 10MB: what leaves the browser is
 * always small, and what reaches Supabase is a clean JPEG.
 *
 * Client-only — it uses canvas. Anything it cannot handle (a PDF, an
 * unreadable file, a browser without canvas) comes back untouched, and
 * the size check downstream still applies.
 */

/** What we aim to send. Comfortably inside Vercel's 4.5MB body cap
 *  with room for the multipart envelope and the token. */
export const TARGET_BYTES = 1_600_000;

/** Longest edge after resizing. An ID card at 2000px is readable well
 *  past the point where a human needs to zoom. */
const MAX_EDGE = 2000;

/** Tried in order until one lands under TARGET_BYTES. Stops at 0.6 —
 *  below that an ID number starts to break up, and an unreadable
 *  document is worse than a large one. */
const QUALITIES = [0.85, 0.75, 0.65, 0.6];

function isShrinkable(file: File): boolean {
  return /^image\/(jpeg|png|webp)$/.test(file.type);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("could not decode"));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Return a smaller version of `file`, or the original if it cannot be
 * or need not be shrunk.
 *
 * Never throws and never returns something bigger than what it was
 * given: if every attempt comes out larger — which happens with an
 * already-optimised small JPEG — the original is kept.
 */
export async function shrinkImage(file: File): Promise<File> {
  if (!isShrinkable(file)) return file;
  if (file.size <= TARGET_BYTES) return file;

  try {
    const img = await loadImage(file);

    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    /* White underneath, because a PNG with transparency becomes black
       where it was clear once it is a JPEG — which on a scan of a
       document looks like the page has been redacted. */
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    for (const quality of QUALITIES) {
      const blob = await toBlob(canvas, quality);
      if (!blob) continue;
      if (blob.size <= TARGET_BYTES || quality === QUALITIES[QUALITIES.length - 1]) {
        /* Only if we actually helped. */
        if (blob.size >= file.size) return file;
        return new File([blob], renameToJpg(file.name), {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }
    }

    return file;
  } catch {
    /* A file we cannot decode is not a failure here — it is handed on
       untouched and judged by the same size rules as everything else. */
    return file;
  }
}

function renameToJpg(name: string): string {
  return `${name.replace(/\.[^.]+$/, "") || "upload"}.jpg`;
}
