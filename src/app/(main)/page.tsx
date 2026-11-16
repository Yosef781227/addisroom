import { FeaturedRental } from "@/components/FeaturedRental";
import { getListingImageUrls } from "@/lib/listings";
import { ListingsMap } from "@/components/ListingsMap";
import { listingCoords } from "@/lib/geo";
import { shortPrice } from "@/lib/search-shared";
import Link from "next/link";
import { fetchHomeListings } from "@/lib/fetch-listings";
import { getSavedListingIds } from "@/lib/auth-actions";
import { getSessionProfileId } from "@/lib/auth";
import { parseLang, t, propertyLabel } from "@/lib/i18n";
import { ListingCard } from "@/components/ListingCard";
import { BannerAd } from "@/components/BannerAd";
import { HomeHero } from "@/components/HomeHero";
export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const lang = parseLang((await searchParams)?.lang),
    qs = lang !== "en" ? `?lang=${lang}` : "";
  const profileId = await getSessionProfileId();
  const [savedIds, { listings, usedFallback }] = await Promise.all([
    getSavedListingIds(profileId),
    fetchHomeListings({}),
  ]);
  return (
    <div className="villa-home">
      <HomeHero lang={lang} />
      <section className="home-ad-region">
        <BannerAd lang={lang} placement="homepage" />
      </section>
      <FeaturedRental
        lang={lang}
        homes={listings
          .filter(
            (l, i, all) =>
              all.findIndex(
                (other) => other.propertyType === l.propertyType,
              ) === i,
          )
          .slice(0, 3)
          .map((l) => ({
            id: l.id,
            title: l.title,
            type: l.propertyType,
            typeLabel: propertyLabel(lang, l.propertyType),
            image: getListingImageUrls(l)[0],
            price: l.priceBirr,
            area: l.areaSqm,
            rooms:
              l.propertyType === "SHOP"
                ? null
                : l.bedrooms === "ONE"
                  ? "1"
                  : l.bedrooms === "TWO"
                    ? "2"
                    : "3+",
            furnished: l.furnished,
            neighborhood: l.neighborhood,
            description: l.description,
          }))}
      />
      <section id="results" className="scroll-mt-24">
        <div className="flex flex-wrap gap-3 items-end justify-between border-b border-[var(--border)] pb-4 mb-5">
          <div>
            <p className="villa-kicker">| {t(lang, "search.properties")}</p>
            <h2 className="villa-section-title">
              {t(lang, "home.propertiesHeading")}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-2">
              {listings.length} {t(lang, "home.listingsFound")}
            </p>
          </div>
          <Link
            className="text-sm font-semibold text-[var(--brand-700)]"
            href={`/search${qs}`}
          >
            {t(lang, "home.seeAll")} →
          </Link>
        </div>
        {usedFallback && (
          <p className="text-sm text-amber-900 my-4" role="status">
            Listings are temporarily unavailable. Please try again.
          </p>
        )}
        <div className="villa-property-grid grid gap-7 sm:grid-cols-2 lg:grid-cols-3 mt-5">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              lang={lang}
              href={`/listings/${l.id}${qs}`}
              saved={savedIds.has(l.id)}
              showSave={!!profileId}
            />
          ))}
        </div>
        {!listings.length && !usedFallback && (
          <div className="card p-8 mt-5 text-center text-[var(--muted)]">
            {t(lang, "home.empty")}
          </div>
        )}
      </section>
      <section id="rentals-map" className="villa-map-section scroll-mt-24">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-xl font-bold">{t(lang, "search.seeOnMap")}</h2>
          <Link
            className="text-sm font-semibold text-[var(--brand-700)]"
            href={`/search?view=map${lang !== "en" ? `&lang=${lang}` : ""}`}
          >
            {t(lang, "home.seeAll")} →
          </Link>
        </div>
        <p className="text-xs text-[var(--muted)] mb-3">
          {t(lang, "location.approximateMap")}
        </p>
        <div className="home-map-shell">
          <ListingsMap
            className="h-full"
            points={listings.flatMap((l) => {
              const coords = listingCoords(l);
              return coords
                ? [
                    {
                      id: l.id,
                      ...coords,
                      label: shortPrice(l.priceBirr),
                      title: l.title,
                      sub: `${l.priceBirr.toLocaleString()} birr ${t(lang, "search.perMonth")}`,
                      href: `/listings/${l.id}${qs}`,
                      image: l.images[0]?.url,
                    },
                  ]
                : [];
            })}
          />
        </div>
      </section>
      <section className="villa-how full-bleed">
        <div className="mx-auto max-w-6xl px-4">
          <div className="villa-section-heading">
            <p className="villa-kicker">| {t(lang, "home.howKicker")}</p>
            <h2>{t(lang, "home.howHeading")}</h2>
          </div>
          <div className="villa-steps">
            {([1, 2, 3] as const).map((n) => (
              <article key={n}>
                <span>0{n}</span>
                <h3>{t(lang, `home.step${n}.title`)}</h3>
                <p>{t(lang, `home.step${n}.body`)}</p>
                {n === 3 && (
                  <Link href={`/signup${qs}`}>
                    {t(lang, "footer.signup")} →
                  </Link>
                )}
              </article>
            ))}
          </div>
          <div className="villa-faq">
            <div>
              <p className="villa-kicker">| {t(lang, "home.faqKicker")}</p>
              <h3>{t(lang, "home.faqHeading")}</h3>
            </div>
            <div className="villa-accordion">
              {([1, 2, 3] as const).map((n) => (
                <details name="rental-faq" open={n === 1} key={n}>
                  <summary>{t(lang, `home.faq${n}.title`)}</summary>
                  <p>{t(lang, `home.faq${n}.body`)}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
