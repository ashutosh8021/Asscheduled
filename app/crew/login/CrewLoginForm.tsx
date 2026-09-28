"use client";

import { useState } from "react";
import { CREW_IN } from "@/lib/copy";

/* Crew sign-in. Two fields, because that is all a Crew account has.
 *
 * On success the browser is sent to the panel with a full navigation
 * rather than a client-side push: the session cookie arrives on this
 * response, and the panel is a server component that has to read it. */

export default function CrewLoginForm() {
  const [phone, setPhone] = useState("");
  const [passcode, setPasscode] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  async function submit() {
    setFailed(null);

    /* Checked here too, so an obvious typo does not spend one of their
       attempts against the rate limit. */
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, "")) || passcode.trim().length < 6) {
      setFailed(CREW_IN.wrong);
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/somewhere/crew/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\s/g, ""), passcode: passcode.trim() }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };

      if (!json.ok) {
        setFailed(json.error ?? CREW_IN.wrong);
        return;
      }

      window.location.replace("/crew/dashboard");
    } catch {
      setFailed(CREW_IN.offline);
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      className="s-panel"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="s-eyebrow" style={{ color: "var(--s-rust)", marginBottom: 24 }}>
        {CREW_IN.submit}
      </p>

      <div className="s-form-grid">
        <div className="s-field s-field-full">
          <label htmlFor="crew-phone">
            {CREW_IN.phone.label} <span className="s-req">*</span>
          </label>
          <input
            id="crew-phone"
            className="s-input"
            inputMode="numeric"
            autoComplete="tel"
            placeholder={CREW_IN.phone.ph}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="s-field s-field-full">
          <label htmlFor="crew-pass">
            {CREW_IN.passcode.label} <span className="s-req">*</span>
          </label>
          <input
            id="crew-pass"
            className="s-input s-input-code"
            autoComplete="one-time-code"
            spellCheck={false}
            placeholder={CREW_IN.passcode.ph}
            value={passcode}
            /* Upper-cased as they type: the passcode is issued in
               capitals and the server upper-cases anyway, so this makes
               the field agree with what they were sent. */
            onChange={(e) => setPasscode(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {failed ? (
        <p className="s-err" role="alert" style={{ marginTop: 16 }}>
          {failed}
        </p>
      ) : null}

      <div style={{ marginTop: 22 }}>
        <button type="submit" className="s-btn s-btn-forest" disabled={sending}>
          {sending ? CREW_IN.sending : CREW_IN.submit}
        </button>
      </div>

      <p className="s-hint" style={{ marginTop: 18 }}>
        {CREW_IN.lost}
      </p>
    </form>
  );
}
