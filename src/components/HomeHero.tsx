import { SearchBar } from "@/components/SearchBar";
import { VillaHero } from "@/components/VillaHero";
import { type Lang, t } from "@/lib/i18n";
export function HomeHero({ lang }: { lang: Lang }) {
  return (
    <>
      <VillaHero lang={lang} />
      <section id="rental-search" className="villa-search-section scroll-mt-28">
        <div className="villa-section-heading">
          <p className="villa-kicker">| {t(lang, "home.findHeading")}</p>
          <h2>{t(lang, "home.searchHeading")}</h2>
        </div>
        <SearchBar lang={lang} variant="hero" />
      </section>
    </>
  );
}
