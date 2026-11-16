"use client";
import Image from "next/image";
import { useState } from "react";
import { type Lang, t } from "@/lib/i18n";
const slides = ["banner-01.jpg", "banner-02.jpg", "banner-03.jpg"];
export function VillaHero({ lang }: { lang: Lang }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const qs = lang === "en" ? "" : `?lang=${lang}`;
  return (
    <section
      className="villa-hero full-bleed"
      aria-roledescription="carousel"
      aria-label="Find a rental home"
    >
      <Image
        key={slide}
        src={`/images/villa/${slide}`}
        alt="Residential architecture inspiration"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="villa-hero-shade" />
      <div className="villa-hero-inner">
        <span className="villa-location">
          {t(lang, "common.addis")}, <em>{t(lang, "common.ethiopia")}</em>
        </span>
        <div aria-live="polite">
          <h1>{t(lang, `hero.title${(index + 1) as 1 | 2 | 3}`)}</h1>
          <p>{t(lang, `hero.body${(index + 1) as 1 | 2 | 3}`)}</p>
        </div>
        <a href="#rental-search" className="villa-hero-cta">
          {t(lang, "nav.rent")} <span aria-hidden="true">↗</span>
        </a>
        <a
          href={`/search${qs}${qs ? "&" : "?"}view=map`}
          className="villa-hero-map"
        >
          {t(lang, "search.seeOnMap")}
        </a>
      </div>
      <button
        className="villa-slide-arrow villa-slide-prev"
        aria-label="Previous featured image"
        onClick={() => setIndex((index + slides.length - 1) % slides.length)}
      >
        ‹
      </button>
      <button
        className="villa-slide-arrow villa-slide-next"
        aria-label="Next featured image"
        onClick={() => setIndex((index + 1) % slides.length)}
      >
        ›
      </button>
      <div className="villa-slide-dots">
        {slides.map((s, i) => (
          <button
            key={s}
            aria-label={`Featured image ${i + 1}`}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
