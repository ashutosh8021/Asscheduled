export const inr = (n: number): string => "₹" + n.toLocaleString("en-IN");

export interface CountdownParts {
  closed: boolean;
  d: number;
  h: number;
  m: number;
}

export function countdown(closeAt: string, now: number = Date.now()): CountdownParts {
  const t = new Date(closeAt).getTime() - now;
  if (t <= 0) return { closed: true, d: 0, h: 0, m: 0 };
  return {
    closed: false,
    d: Math.floor(t / 864e5),
    h: Math.floor((t % 864e5) / 36e5),
    m: Math.floor((t % 36e5) / 6e4),
  };
}
