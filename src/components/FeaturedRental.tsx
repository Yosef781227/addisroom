"use client";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { type Lang, t } from "@/lib/i18n";
export type FeaturedHome = {
  id: string;
  title: string;
  type: string;
  typeLabel: string;
  image: string;
  price: number;
  area: number | null;
  rooms: string | null;
  furnished: boolean;
  neighborhood: string;
  description: string;
};
export function FeaturedRental({
  homes,
  lang,
}: {
  homes: FeaturedHome[];
  lang: Lang;
}) {
  const [selected, setSelected] = useState(0),
    id = useId();
  if (!homes.length) return null;
  const home = homes[selected],
    qs = lang === "en" ? "" : `?lang=${lang}`;
  return (
    <section className="villa-featured full-bleed">
      <div className="mx-auto max-w-6xl px-4">
        <div className="villa-featured-heading">
          <div>
            <p className="villa-kicker">| {t(lang, "home.latest")}</p>
            <h2 className="villa-section-title">
              {t(lang, "home.featuredHeading")}
            </h2>
          </div>
          <div
            className="villa-property-tabs"
            role="tablist"
            aria-label={t(lang, "home.types.title")}
          >
            {homes.map((h, i) => (
              <button
                key={h.id}
                id={`${id}-tab-${i}`}
                role="tab"
                aria-selected={i === selected}
                aria-controls={`${id}-panel`}
                tabIndex={i === selected ? 0 : -1}
                onClick={() => setSelected(i)}
                onKeyDown={(e) => {
                  if (
                    ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)
                  ) {
                    e.preventDefault();
                    const next =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? homes.length - 1
                          : (selected +
                              (e.key === "ArrowRight" ? 1 : -1) +
                              homes.length) %
                            homes.length;
                    setSelected(next);
                    document.getElementById(`${id}-tab-${next}`)?.focus();
                  }
                }}
              >
                {h.typeLabel}
              </button>
            ))}
          </div>
        </div>
        <div
          className="villa-featured-grid"
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${selected}`}
          tabIndex={0}
        >
          <dl className="villa-info-table">
            {[
              [
                t(lang, "detail.monthly"),
                `${home.price.toLocaleString()} ${t(lang, "common.birr")}`,
              ],
              [t(lang, "detail.area"), home.area ? `${home.area} m²` : "—"],
              [t(lang, "detail.rooms"), home.rooms ?? "—"],
              [
                t(lang, "detail.furnished"),
                t(lang, home.furnished ? "detail.yes" : "detail.no"),
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={`/listings/${home.id}${qs}`}
            className="villa-featured-photo"
          >
            <Image
              key={home.id}
              src={home.image}
              alt={home.title}
              fill
              sizes="(max-width:767px) 100vw, 40vw"
              className="object-cover"
            />
          </Link>
          <div className="villa-featured-copy">
            <p className="villa-featured-place">{home.neighborhood}</p>
            <h3>{home.title}</h3>
            <p className="line-clamp-5">{home.description}</p>
            <Link
              href={`/listings/${home.id}${qs}`}
              className="villa-card-button"
            >
              {lang === "en" ? "View rental" : t(lang, "common.viewRental")} ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
