"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };

      if (json.ok) {
        /* refresh() re-runs the server component, which now sees the
           session cookie; push alone could serve a cached shell. */
        router.replace("/admin");
        router.refresh();
      } else {
        setError(json.error ?? "That did not work.");
        setBusy(false);
      }
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="a-field">
        {/* Labels are visually hidden rather than absent — the design
            uses placeholders, but a placeholder is not an accessible
            name and disappears as soon as you type. */}
        <label htmlFor="ad-email" className="s-sr">
          Email
        </label>
        <input
          id="ad-email"
          type="email"
          className="a-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          autoFocus
        />
      </div>

      <div className="a-field">
        <label htmlFor="ad-pass" className="s-sr">
          Password
        </label>
        <input
          id="ad-pass"
          type="password"
          className="a-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <button type="submit" className="a-login-btn" disabled={busy}>
        {busy ? "SIGNING IN…" : "LOGIN"}
      </button>

      {error ? (
        <p className="a-err" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
