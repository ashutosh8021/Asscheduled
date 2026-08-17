import Image from "next/image";
import type { ImageSlot } from "@/lib/trips";

/* Every image in the build spec goes through here.

   Until real approved photography exists, a slot renders a labelled
   placeholder instead of stock imagery (brand rule: no fake history).
   Dropping a real `src` into lib/trips.ts swaps it in with no layout
   change — the aspect box and object-fit are identical either way. */
export default function Frame({
  slot,
  ratio = "4 / 5",
  priority,
  className,
  sizes = "(max-width: 760px) 100vw, 40vw",
}: {
  slot: ImageSlot;
  ratio?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <div
      className={`frame${className ? " " + className : ""}`}
      style={{ aspectRatio: ratio }}
    >
      {slot.src ? (
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="frame-img"
        />
      ) : (
        <span className="frame-ph" aria-hidden="true">
          <span className="frame-ph-l">{slot.label}</span>
          <span className="frame-ph-n">AWAITING SEASON 01 FILM</span>
        </span>
      )}
    </div>
  );
}
