import { SearchBar } from "@/components/SearchBar";
import { VillaHero } from "@/components/VillaHero";
import { type Lang, t } from "@/lib/i18n";
export function HomeHero({ lang }: { lang: Lang }) {
  return (
    <>
      <VillaHero lang={lang} />
      <section id="rental-search" className="villa-search-section scroll-mt-28">
        <div className="villa-section-heading">
          <p className="villa-kicker">
            | {lang === "en" ? "FIND YOUR HOME" : t(lang, "home.filtersTitle")}
          </p>
          <h2>
            {lang === "en"
              ? "The right neighborhood.\nThe right home."
              : t(lang, "home.referenceTitle")}
          </h2>
        </div>
        <SearchBar lang={lang} variant="hero" />
      </section>
    </>
  );
}
