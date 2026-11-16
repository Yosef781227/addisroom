import { PromotionCarousel } from "@/components/PromotionCarousel";
import { PromotionBanner } from "@/components/PromotionBanner";
import { prisma } from "@/lib/prisma";
import { t, type Lang } from "@/lib/i18n";
export async function BannerAd({
  lang,
  placement = "standard",
}: {
  lang: Lang;
  placement?: "standard" | "homepage";
}) {
  const sponsors = await prisma.sponsorship.findMany({
    where: { activeSlot: { not: null } },
    orderBy: { activeSlot: "asc" },
    take: 3,
  });
  const sponsor = sponsors[0];
  if (!sponsor && placement !== "homepage") return null;
  if (!sponsor)
    return (
      <aside
        className="homepage-ad homepage-ad-empty"
        aria-label={t(lang, "ads.label")}
      >
        <div className="homepage-ad-symbol" aria-hidden="true">
          <svg
            viewBox="0 0 40 40"
            width="40"
            height="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <rect x="5" y="7" width="30" height="26" rx="4" />
            <path d="M5 23l8-8 9 9 5-4 8 8" />
            <circle cx="27" cy="14" r="3" />
          </svg>
        </div>
        <div>
          <p className="homepage-ad-label">{t(lang, "ads.label")}</p>
          <h2>{t(lang, "ads.emptyTitle")}</h2>
          <p className="homepage-ad-description">{t(lang, "ads.emptyBody")}</p>
        </div>
      </aside>
    );
  if (sponsors.length > 1)
    return (
      <PromotionCarousel
        promotions={sponsors}
        lang={lang}
        compact={placement !== "homepage"}
      />
    );
  return (
    <PromotionBanner
      promotion={sponsor}
      lang={lang}
      compact={placement !== "homepage"}
    />
  );
}
