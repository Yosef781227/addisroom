import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { t, type Lang } from "@/lib/i18n";
export async function BannerAd({
  lang,
  placement = "standard",
}: {
  lang: Lang;
  placement?: "standard" | "homepage";
}) {
  const sponsor = await prisma.sponsorship.findUnique({
    where: { activeSlot: 1 },
  });
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
  const content = (
    <>
      <p
        className={
          placement === "homepage"
            ? "homepage-ad-label"
            : "text-[10px] font-semibold uppercase tracking-widest text-[var(--brand-700)]"
        }
      >
        {t(lang, "ads.sponsored")}
      </p>
      {sponsor.imageUrl && (
        <div
          className={
            placement === "homepage"
              ? "homepage-ad-image"
              : "relative h-36 my-3"
          }
        >
          <Image
            src={sponsor.imageUrl}
            alt=""
            fill
            sizes="(max-width:640px) 100vw, 900px"
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <div className="homepage-ad-copy">
        <h3 className="text-sm font-semibold mt-3">{sponsor.headline}</h3>
        <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
          {sponsor.body}
        </p>
      </div>
    </>
  );
  return (
    <aside
      aria-label={t(lang, "ads.label")}
      className={
        placement === "homepage"
          ? "homepage-ad homepage-ad-active"
          : "sponsor-banner"
      }
    >
      {sponsor.linkUrl ? (
        <a
          href={sponsor.linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block"
        >
          {content}
        </a>
      ) : (
        <div>{content}</div>
      )}
    </aside>
  );
}
