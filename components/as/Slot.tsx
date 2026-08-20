import Image from "next/image";
import type { Slot as SlotData } from "@/lib/departures";

/* An image slot.

   No approved photography exists for most of the site yet (CLAUDE.md,
   "Assets — the current hard blocker"), so a slot with `src: null`
   renders a labelled, brand-styled placeholder with exactly the same
   geometry as the real image. Dropping a real file in swaps it with
   zero layout shift and no code change beyond the data. Never fill a
   slot with stock travel imagery. */

interface Props {
  slot: SlotData;
  /** Passed to next/image. Required for correct responsive sizing. */
  sizes?: string;
  /** Above-the-fold slots opt out of lazy loading. */
  priority?: boolean;
  className?: string;
  /** Placeholder ink for slots that sit on the navy sections. */
  dark?: boolean;
  /** Extra caption line inside the placeholder. */
  hint?: string;
  /**
   * `cover` (default) fills the box and crops the overflow — right for
   * thumbnails and cards. `contain` shows the whole frame, for the
   * full-screen hero where a portrait photo would otherwise lose two
   * thirds of itself to the crop.
   */
  fit?: "cover" | "contain";
  /**
   * next/image encode quality. The default of 75 is right for cards,
   * but the full-bleed hero is already upscaling soft source
   * photography — re-encoding that at 75 compounds the loss.
   */
  quality?: number;
}

export default function Slot({
  slot,
  sizes = "(max-width: 900px) 100vw, 50vw",
  priority = false,
  className = "",
  dark = false,
  hint,
  fit = "cover",
  quality,
}: Props) {
  return (
    <div className={`s-slot ${className}`.trim()}>
      {slot.src ? (
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          style={fit === "contain" ? { objectFit: "contain" } : undefined}
        />
      ) : (
        <div className={`s-ph${dark ? " s-ph-dark" : ""}`} role="img" aria-label={slot.alt}>
          <b>{slot.label}</b>
          <i>{hint ?? "AWAITING PHOTOGRAPHY"}</i>
        </div>
      )}
    </div>
  );
}
