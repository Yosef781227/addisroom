"use client";

import { useEffect, useState } from "react";
import {
  PromotionBanner,
  type PromotionData,
} from "@/components/PromotionBanner";
import { type Lang, t } from "@/lib/i18n";

export function PromotionCarousel({
  promotions,
  lang,
  compact = false,
}: {
  promotions: (PromotionData & { id: string })[];
  lang: Lang;
  compact?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || hovered || focused || reduced || promotions.length < 2)
      return;
    const timer = window.setInterval(() => {
      if (!document.hidden)
        setIndex((value) => (value + 1) % promotions.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, reduced, promotions.length]);
  const current = index % promotions.length;
  return (
    <section
      className="promotion-carousel"
      aria-label={t(lang, "ads.label")}
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="promotion-carousel-stage" aria-live="off">
        {promotions.map((promotion, position) => (
          <div
            key={promotion.id}
            className="promotion-slide"
            data-current={position === current}
            aria-hidden={position !== current}
            inert={position !== current}
            role="group"
            aria-roledescription="slide"
            aria-label={`${position + 1} / ${promotions.length}`}
          >
            <PromotionBanner
              promotion={promotion}
              lang={lang}
              compact={compact}
            />
          </div>
        ))}
      </div>
      <div className="promotion-carousel-controls">
        <span className="promotion-carousel-count" aria-live="polite">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(promotions.length).padStart(2, "0")}
        </span>
        <div className="promotion-carousel-dots">
          {promotions.map((promotion, position) => (
            <button
              key={promotion.id}
              type="button"
              aria-label={promotion.headline}
              aria-current={position === current ? "true" : undefined}
              onClick={() => {
                setIndex(position);
                setPaused(true);
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "Play advertisements" : "Pause advertisements"}
        >
          {paused ? "▷" : "Ⅱ"}
        </button>
        <button
          type="button"
          aria-label="Previous advertisement"
          onClick={() => {
            setIndex((current + promotions.length - 1) % promotions.length);
            setPaused(true);
          }}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next advertisement"
          onClick={() => {
            setIndex((current + 1) % promotions.length);
            setPaused(true);
          }}
        >
          ›
        </button>
      </div>
    </section>
  );
}
