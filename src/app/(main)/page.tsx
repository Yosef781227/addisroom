import { ListingsMap } from "@/components/ListingsMap";
import { listingCoords } from "@/lib/geo";
import { shortPrice } from "@/lib/search-shared";
import Link from "next/link";
import { fetchHomeListings } from "@/lib/fetch-listings";
import { getSavedListingIds } from "@/lib/auth-actions";
import { getSessionProfileId } from "@/lib/auth";
import { parseLang, t } from "@/lib/i18n";
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
    <div className="space-y-9">
      <HomeHero lang={lang} />
      <section id="rentals-map" className="scroll-mt-24">
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
      <section id="results" className="scroll-mt-24">
        <div className="flex flex-wrap gap-3 items-end justify-between border-b border-[var(--border)] pb-4 mb-5">
          <div>
            <h2 className="text-xl font-bold">{t(lang, "home.available")}</h2>
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
        <BannerAd lang={lang} />
        {usedFallback && (
          <p className="text-sm text-amber-900 my-4" role="status">
            Listings are temporarily unavailable. Please try again.
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2 mt-5">
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
    </div>
  );
}
