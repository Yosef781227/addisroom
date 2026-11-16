import { AmenityBadges } from "@/components/AmenityBadges";
import { offeredAmenities } from "@/lib/amenities";
import Link from "next/link";
import { formatAvailableFrom } from "@/lib/dates";
import { ImageCarousel } from "@/components/ImageCarousel";
import { SaveListingButton } from "@/components/SaveListingButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getListingImageUrls, isVerifiedBroker } from "@/lib/listings";
import { type Lang, t, propertyLabel, bedroomLabel } from "@/lib/i18n";

type ListingWithRelations = {
  id: string;
  title: string;
  description: string;
  neighborhood: string;
  area?: string | null;
  roadName?: string | null;
  roomType: string;
  propertyType?: string;
  dealType?: string;
  areaSqm?: number | null;
  bedrooms?: string;
  furnished: boolean;
  parking?: boolean | null;
  elevator?: boolean | null;
  balcony?: boolean | null;
  wifi?: boolean | null;
  billsIncluded?: boolean | null;
  priceBirr: number;
  availableFrom: Date;
  images?: { url: string; sortOrder: number }[];
  postedBy: {
    id: string;
    name: string;
    role: string;
    verified: boolean;
    brokerVerified?: boolean;
    profileComplete?: boolean;
    photoUrl?: string | null;
  };
};

export function ListingCard({
  listing,
  lang,
  href,
  saved = false,
  showSave = false,
}: {
  listing: ListingWithRelations;
  lang: Lang;
  href: string;
  saved?: boolean;
  showSave?: boolean;
}) {
  const images = getListingImageUrls(listing);
  const verified = isVerifiedBroker(listing.postedBy);
  const langQs = lang !== "en" ? `?lang=${lang}` : "";
  const profileHref = listing.postedBy.profileComplete
    ? `/profiles/${listing.postedBy.id}${langQs}`
    : null;

  return (
    <article className="listing-card group">
      {showSave ? (
        <SaveListingButton listingId={listing.id} saved={saved} />
      ) : null}

      <Link href={href} className="block flex-1">
        <div className="relative">
          <ImageCarousel
            images={images}
            alt={listing.title}
            variant="compact"
          />
        </div>
        <div className="villa-card-content">
          <div className="villa-card-topline">
            <span className="villa-property-category">
              {propertyLabel(lang, listing.propertyType)}
            </span>
            <span className="villa-card-price">
              {listing.priceBirr.toLocaleString()}{" "}
              <small>
                {t(lang, "common.birr")} {t(lang, "search.perMonth")}
              </small>
            </span>
          </div>
          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--brand-700)]">
            {listing.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 shrink-0 text-[var(--brand-500)]"
              aria-hidden
            >
              <path
                d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
                stroke="currentColor"
                strokeWidth="1.75"
              />
              <circle
                cx="12"
                cy="10"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.75"
              />
            </svg>
            <span className="truncate">
              {listing.area ? `${listing.area} · ` : ""}
              {listing.neighborhood}
              {listing.roadName ? `, ${listing.roadName}` : ""}
            </span>
          </p>
          <p className="villa-card-description mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {listing.description}
          </p>
          <div className="villa-card-facts mt-4 flex flex-wrap gap-2 text-xs font-medium text-[var(--brand-900)]">
            {listing.bedrooms && listing.propertyType !== "SHOP" ? (
              <span className="rounded-full bg-[var(--brand-50)] px-2.5 py-1">
                {bedroomLabel(lang, listing.bedrooms)}
              </span>
            ) : null}
            {listing.areaSqm ? (
              <span className="rounded-full bg-[var(--brand-50)] px-2.5 py-1">
                {listing.areaSqm} m²
              </span>
            ) : null}

            <span className="rounded-full bg-[var(--brand-50)] px-2.5 py-1">
              {t(lang, "listing.availableFrom")}:{" "}
              {formatAvailableFrom(listing.availableFrom, lang)}
            </span>
          </div>
          <div className="mt-3">
            <AmenityBadges values={offeredAmenities(listing)} lang={lang} />
          </div>
        </div>
      </Link>

      <div className="villa-card-owner flex items-center justify-between gap-2 border-t border-[var(--border)] px-5 py-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-[var(--muted)]">
          <ProfileAvatar
            name={listing.postedBy.name}
            photoUrl={listing.postedBy.photoUrl}
            size="sm"
          />
          <span className="truncate">
            <span className="block font-semibold text-[var(--foreground)]">
              {listing.postedBy.name}
            </span>
            <span className="capitalize">
              {listing.postedBy.role.toLowerCase()}
            </span>
          </span>
          {verified ? <VerifiedBadge lang={lang} /> : null}
          {listing.postedBy.role === "AGENT" &&
            listing.postedBy.brokerVerified && (
              <span className="status-pill">Agent approved</span>
            )}
        </div>
        {profileHref ? (
          <Link
            href={profileHref}
            className="shrink-0 text-xs font-semibold text-[var(--brand-700)] hover:underline"
          >
            {t(lang, "listing.viewLandlord")}
          </Link>
        ) : null}
      </div>
      <Link href={href} className="villa-card-button">
        {t(lang, "common.viewRental")}
      </Link>
    </article>
  );
}
