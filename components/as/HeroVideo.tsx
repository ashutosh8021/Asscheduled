"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HOME } from "@/lib/copy";
import { useModal } from "./ModalProvider";

/* The homepage hero.

   Depth comes from two planes moving at different rates against a fixed
   perspective: the footage pushes back and scales while the headline
   rides forward and fades. Both are transform-only, so they composite
   on the GPU and never trigger layout.

   Safari notes: muted + playsInline are both required for inline
   autoplay, and the poster carries the frame until the video decodes,
   so the hero is never blank. Reduced motion drops to the still frame
   and no transform runs at all — motion must never gate the content. */

/* Re-encoded from the master in /asset: audio stripped, CRF 24, index
   moved to the front so playback starts before the file finishes. The
   14MB master would stall the hero on anything but fast wifi. */
const VIDEO = "/video/hero-as01-v2.mp4";
const POSTER = "/video/hero-as01-v2.jpg";

export default function HeroVideo() {
  const { openApply } = useModal();
  const media = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotion(!mq.matches);

    const onChange = () => setMotion(!mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!motion) {
      /* Clear anything a previous pass left behind. */
      for (const el of [media.current, content.current]) {
        if (el) el.style.transform = "";
      }
      return;
    }

    let ticking = false;

    function frame() {
      const h = window.innerHeight;
      /* 0 at the top of the hero, 1 once it is fully scrolled past. */
      const p = Math.min(1, Math.max(0, window.scrollY / h));

      if (media.current) {
        media.current.style.transform = `translate3d(0, ${p * 14}vh, 0) scale(${1 + p * 0.12})`;
      }
      if (content.current) {
        content.current.style.transform = `translate3d(0, ${p * -9}vh, 0)`;
        content.current.style.opacity = String(Math.max(0, 1 - p * 1.5));
      }
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }

    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [motion]);

  return (
    <section className="s-hero s-stage">
      <div className="s-hero-media" ref={media}>
        {motion ? (
          <video
            src={VIDEO}
            poster={POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : (
          <Image
            src={POSTER}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        )}
        <div className="s-hero-scrim" />
      </div>

      <div className="s-hero-inner s-wrap-wide" ref={content}>
        <h1 className="s-hero-h1">
          {HOME.heroTitle} <em>{HOME.heroTitleItalic}</em>
        </h1>

        <p className="s-hero-sub">{HOME.heroSub}</p>

        <div className="s-hero-cta">
          <button type="button" className="s-btn s-btn-butter" onClick={() => openApply()}>
            {HOME.heroCta}
          </button>
        </div>
      </div>

    </section>
  );
}
