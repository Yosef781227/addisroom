import { SearchBar } from "@/components/SearchBar";
import { type Lang, t } from "@/lib/i18n";
export function HomeHero({ lang }: { lang: Lang }) {
  return (
    <section className="rental-hero">
      <div className="rental-hero-copy">
        <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--brand-700)]">
          {t(lang, "home.eyebrow")}
        </span>
        <h1>
          {lang === "en"
            ? "Find your next rental in Addis Ababa."
            : t(lang, "home.referenceTitle")}
        </h1>
        <p>{t(lang, "home.referenceSubtitle")}</p>
        <a
          className="inline-block mt-3 text-sm font-semibold text-[var(--brand-700)] underline underline-offset-4"
          href="#rentals-map"
        >
          ⌖ {t(lang, "search.seeOnMap")}
        </a>
      </div>
      <SearchBar lang={lang} variant="hero" />
    </section>
  );
}
