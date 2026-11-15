"use client";
import Image from "next/image";
import { useState } from "react";
import { type Lang, t } from "@/lib/i18n";
const slides = [
  {
    image: "banner-01.jpg",
    title: "A PLACE TO CALL YOUR OWN.",
    text: "Discover your next rental in Addis Ababa and nearby towns.",
  },
  {
    image: "banner-02.jpg",
    title: "YOUR NEXT CHAPTER STARTS HERE.",
    text: "From a first apartment to a family home. Find the space that fits.",
  },
  {
    image: "banner-03.jpg",
    title: "FIND THE SPACE. FEEL AT HOME.",
    text: "Choose your neighborhood, set your budget, and explore the possibilities.",
  },
];
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
        key={slide.image}
        src={`/images/villa/${slide.image}`}
        alt="Residential architecture inspiration"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="villa-hero-shade" />
      <div className="villa-hero-inner">
        <span className="villa-location">
          Addis Ababa, <em>{lang === "en" ? "Ethiopia" : "ኢትዮጵያ"}</em>
        </span>
        <div aria-live="polite">
          <h1>
            {lang === "en" ? slide.title : t(lang, "home.referenceTitle")}
          </h1>
          <p>
            {lang === "en" ? slide.text : t(lang, "home.referenceSubtitle")}
          </p>
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
            key={s.image}
            aria-label={`Featured image ${i + 1}`}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
