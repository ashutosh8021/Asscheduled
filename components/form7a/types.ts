export interface FormAnswers {
  trip: string;
  name: string;
  age: string;
  city: string;
  phone: string;
  email: string;
  instagram: string;
  college: string;
  saturday: string;
  three_words: string;
  why: string;
  bad_at: string;
  plus_one: string;
  drains_you: string;
  remember: string;
  photo_name: string | null;
  photo_data: string | null;
}

export const EMPTY_ANSWERS: FormAnswers = {
  trip: "",
  name: "",
  age: "",
  city: "",
  phone: "",
  email: "",
  instagram: "",
  college: "",
  saturday: "",
  three_words: "",
  why: "",
  bad_at: "",
  plus_one: "",
  drains_you: "",
  remember: "",
  photo_name: null,
  photo_data: null,
};

export const TOTAL_SCREENS = 13;

export function stepLabel(i: number): string {
  if (i === 0) return "INTRO";
  if (i <= 2) return "SECTION A — PARTICULARS";
  if (i <= 9) return "SECTION B — QUESTIONS";
  if (i === 10) return "SECTION B — EXHIBIT A";
  if (i === 11) return "SECTION C — DOSSIER";
  return "SECTION D — FEE";
}

/* Per-screen validation — mirrors the reference V map. Returns the set of
   field keys in error; empty set = valid. */
export function validate(screen: number, a: FormAnswers): Set<keyof FormAnswers> {
  const bad = new Set<keyof FormAnswers>();
  switch (screen) {
    case 1: {
      if (!a.name.trim()) bad.add("name");
      const age = Number(a.age);
      if (!(age >= 18 && age <= 26)) bad.add("age");
      if (!a.city.trim()) bad.add("city");
      break;
    }
    case 2: {
      if (!/^\d{10}$/.test(a.phone.replace(/\D/g, ""))) bad.add("phone");
      if (!/.+@.+\..+/.test(a.email)) bad.add("email");
      if (!a.instagram.trim()) bad.add("instagram");
      if (!a.college.trim()) bad.add("college");
      break;
    }
    case 3:
      if (!a.saturday.trim()) bad.add("saturday");
      break;
    case 4: {
      const words = a.three_words.trim().split(/\s+/).filter(Boolean);
      if (words.length !== 3) bad.add("three_words");
      break;
    }
    case 5:
      if (!a.why.trim()) bad.add("why");
      break;
    case 6:
      if (!a.bad_at.trim()) bad.add("bad_at");
      break;
    case 7:
      if (!a.plus_one.trim()) bad.add("plus_one");
      break;
    case 8:
      if (!a.drains_you.trim()) bad.add("drains_you");
      break;
    case 9:
      if (!a.remember.trim()) bad.add("remember");
      break;
    /* 10: photo optional client-side; enforced server-side in Phase 2 */
  }
  return bad;
}

/* Exhibit A limits. The copy on screen 10 promises both — enforce them. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Every screen's rules at once. The API route runs this before touching
 * Razorpay or Postgres — client validation is a courtesy, not a gate.
 */
export function validateAll(a: FormAnswers): Set<keyof FormAnswers> {
  const bad = new Set<keyof FormAnswers>();
  for (let screen = 1; screen <= 9; screen++) {
    for (const key of validate(screen, a)) bad.add(key);
  }
  if (!a.trip.trim()) bad.add("trip");
  return bad;
}
