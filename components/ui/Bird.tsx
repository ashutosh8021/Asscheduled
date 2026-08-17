/* Canonical bird glyph — path from SPEC §2. */
export const BIRD_PATH =
  "M4 18 C14 6 30 4 44 10 C36 11 30 14 27 19 C36 16 46 18 52 25 C43 22 35 24 30 30 C27 23 18 20 4 18 Z";

export function Bird({
  className,
  fill = "#FFAD84",
  stroke,
  strokeWidth,
}: {
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <svg className={className} viewBox="0 0 56 34" aria-hidden="true">
      <path d={BIRD_PATH} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function Monogram({ large }: { large?: boolean }) {
  return (
    <span className={`mgm${large ? " mgm-lg" : ""}`} aria-hidden="true">
      <span>AS</span>
    </span>
  );
}
