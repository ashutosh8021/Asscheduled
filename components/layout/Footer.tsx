"use client";

import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Bird } from "@/components/ui/Bird";
import type { LegalPane } from "@/components/legal/LegalContent";
import {
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  WHATSAPP_URL,
  CONTACT_EMAIL,
  HAS_ANY_CONTACT,
} from "@/lib/contact";

const LegalSheet = dynamic(() => import("@/components/legal/LegalSheet"));

export default function Footer() {
  const [pane, setPane] = useState<LegalPane | null>(null);

  return (
    <>
      <footer className="foot">
        <div className="foot-top">
          <div>
            <Bird className="foot-bird" />
            <p className="foot-mark">
              AS
              <br />
              SCHEDULED
            </p>
            <p className="foot-line">Departure is the easy part.</p>
          </div>
          <div>
            <h2>Index</h2>
            <ul>
              <li>
                <Link href="/trips">Trips</Link>
              </li>
              <li>
                <Link href="/experiences">Experiences</Link>
              </li>
              <li>
                <Link href="/stories">Stories</Link>
              </li>
              <li>
                <Link href="/events">Events</Link>
              </li>
              <li>
                <Link href="/club">Club</Link>
              </li>
              <li>
                <Link href="/my-trip">My trip</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/apply">Apply — Form 7A</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>Elsewhere</h2>
            <ul>
              {/* Real channels only. Unconfirmed ones say so rather than
                  shipping a handle or number that belongs to someone else. */}
              {INSTAGRAM_URL && (
                <li>
                  <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                    Instagram — {INSTAGRAM_HANDLE}
                  </a>
                </li>
              )}
              {WHATSAPP_URL && (
                <li>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    WhatsApp updates
                  </a>
                </li>
              )}
              {CONTACT_EMAIL && (
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </li>
              )}
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              {!HAS_ANY_CONTACT && (
                <li className="foot-pending">Channels published before Season 02 departs.</li>
              )}
            </ul>
            <h2 style={{ marginTop: 26 }}>Paperwork</h2>
            <ul>
              {/* Real routes, not only modals: legal pages have to be
                  linkable and crawlable. The modal stays as a shortcut. */}
              <li>
                <Link href="/paperwork/cancellation-policy">Cancellation &amp; refunds</Link>
              </li>
              <li>
                <Link href="/paperwork/terms">Terms of travel</Link>
              </li>
              <li>
                <Link href="/paperwork/privacy">Privacy policy</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
            </ul>
            <p className="foot-quick">
              <button type="button" onClick={() => setPane("refund")}>
                Quick view
              </button>
            </p>
          </div>
        </div>
        <div className="foot-legal">
          <span>© 2026 ROITCOVE VENTURES LLP · LLPIN ACZ-2215 · India</span>
          <span>AS SCHEDULED® — Season 02</span>
        </div>
      </footer>
      {pane && <LegalSheet pane={pane} setPane={setPane} onClose={() => setPane(null)} />}
    </>
  );
}
