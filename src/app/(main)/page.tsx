import { FeaturedRental } from "@/components/FeaturedRental";
import { PROPERTY_TYPES } from "@/lib/addis";
import { getListingImageUrls } from "@/lib/listings";
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
    <div className="villa-home">
      <HomeHero lang={lang} />
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
            typeLabel:
              PROPERTY_TYPES.find((p) => p.value === l.propertyType)?.label ??
              l.propertyType,
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
            <p className="villa-kicker">| PROPERTIES</p>
            <h2 className="villa-section-title">
              {lang === "en"
                ? "Find a place you’ll love."
                : t(lang, "home.available")}
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
        <BannerAd lang={lang} />
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
            <p className="villa-kicker">| HOW IT WORKS</p>
            <h2>
              A simpler way
              <br />
              to find your rental.
            </h2>
          </div>
          <div className="villa-steps">
            <article>
              <span>01</span>
              <h3>Find your neighborhood</h3>
              <p>
                Explore Addis Ababa’s sub-cities and nearby towns. Narrow your
                search by monthly budget and the amenities you need.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Get to know the property</h3>
              <p>
                Compare photos, rental details, and the owner’s profile. Map
                pins show the approximate area unless exact coordinates are
                provided.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Make a connection</h3>
              <p>
                Create your account, complete verification, and message the
                landlord or agent directly.
              </p>
              <Link href={`/signup${qs}`}>Create your account →</Link>
            </article>
          </div>
          <div className="villa-faq">
            <div>
              <p className="villa-kicker">| GOOD TO KNOW</p>
              <h3>
                Before you
                <br />
                start your search.
              </h3>
            </div>
            <div className="villa-accordion">
              <details name="rental-faq" open>
                <summary>Can I browse without an account?</summary>
                <p>
                  Yes. Browse rental listings, use filters, and explore the map
                  without signing in. An account and completed verification are
                  required to contact a landlord or agent and arrange a viewing.
                </p>
              </details>
              <details name="rental-faq">
                <summary>How does account verification work?</summary>
                <p>
                  Verify your email or Ethiopian phone number, complete your
                  profile and address, then submit your identity document and
                  photo for administrator review. Google sign-in is also
                  available.
                </p>
              </details>
              <details name="rental-faq">
                <summary>Does the map show the exact property?</summary>
                <p>
                  Map pins show approximate neighborhood or area locations
                  unless the property has exact coordinates. Confirm the address
                  with the landlord or agent before your visit.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
