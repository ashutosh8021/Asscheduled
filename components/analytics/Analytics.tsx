"use client";

/* GA4 loader + delegated click tracking.

   Renders nothing at all when NEXT_PUBLIC_GA_ID is unset, so there is no
   third-party request, no cookie and no consent question until an account
   actually exists.

   Click tracking is delegated from document rather than wired into every
   button: one listener, and any element can opt in with data-track="name". */

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_ID, EVENTS, track, pageview } from "@/lib/analytics";

function ClickTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const tagged = target.closest<HTMLElement>("[data-track]");
      if (tagged?.dataset.track) {
        track(tagged.dataset.track, tagged.dataset.trackLabel ? { label: tagged.dataset.trackLabel } : {});
        return;
      }

      /* Contact intents are worth counting even where nobody remembered to
         tag the link. */
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("mailto:")) track(EVENTS.contactClick, { method: "email" });
      else if (href.includes("wa.me") || href.includes("whatsapp.com")) {
        track(EVENTS.whatsappClick, { method: "whatsapp" });
      } else if (href.startsWith("tel:")) track(EVENTS.contactClick, { method: "phone" });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

function PageViews() {
  const pathname = usePathname();
  const search = useSearchParams();

  /* The App Router does not emit a page_view on client navigation — GA4's
     enhanced measurement misses every soft route change without this. */
  useEffect(() => {
    const qs = search.toString();
    pageview(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, search]);

  return null;
}

export default function Analytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: true });`}
      </Script>
      <ClickTracking />
      <PageViews />
    </>
  );
}
