import Image from "next/image";
import { t, type Lang } from "@/lib/i18n";
export type PromotionData = {
  headline: string;
  body: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string | null;
  theme?: string;
  animated?: boolean;
  isSample?: boolean;
};
export function PromotionBanner({
  promotion,
  lang = "en",
  compact = false,
  preview = false,
}: {
  promotion: PromotionData;
  lang?: Lang;
  compact?: boolean;
  preview?: boolean;
}) {
  const tone = ["warm", "dark", "neutral"].includes(promotion.theme ?? "")
    ? promotion.theme
    : "warm";
  const content = (
    <>
      <span className="promotion-orbit" aria-hidden="true" />
      <span className="promotion-sheen" aria-hidden="true" />
      <div className="promotion-copy">
        <div className="promotion-badges">
          <span className="promotion-label">{t(lang, "ads.sponsored")}</span>
          {promotion.isSample && (
            <span className="promotion-sample">{t(lang, "ads.sample")}</span>
          )}
        </div>
        <h3 dir="auto">{promotion.headline}</h3>
        <p dir="auto">{promotion.body}</p>
        {promotion.linkUrl && (
          <span className="promotion-cta">
            {!promotion.ctaLabel || promotion.ctaLabel === "Learn more"
              ? t(lang, "ads.learnMore")
              : promotion.ctaLabel}
            <span aria-hidden="true">↗</span>
          </span>
        )}
      </div>
      <div className="promotion-visual" aria-hidden="true">
        {promotion.imageUrl ? (
          <Image
            src={promotion.imageUrl}
            alt=""
            fill
            sizes={compact ? "300px" : "(max-width:640px) 100vw, 300px"}
            className="object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 300 190"
            fill="none"
            className="promotion-illustration"
          >
            <circle cx="199" cy="74" r="57" className="promotion-disc" />
            <path
              d="M17 156h268"
              stroke="currentColor"
              strokeOpacity=".15"
              strokeWidth="2"
            />
            <g className="promotion-house">
              <path
                d="M159 79l41-35 42 35v58h-83Z"
                fill="var(--promo-paper)"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M149 81l51-44 52 44"
                stroke="var(--accent)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <rect
                x="191"
                y="102"
                width="21"
                height="35"
                rx="2"
                fill="var(--promo-tint)"
              />
              <rect
                x="170"
                y="88"
                width="12"
                height="14"
                rx="2"
                fill="var(--accent)"
                fillOpacity=".3"
              />
              <rect
                x="221"
                y="88"
                width="12"
                height="14"
                rx="2"
                fill="var(--accent)"
                fillOpacity=".3"
              />
            </g>
            <g className="promotion-truck">
              <rect
                x="39"
                y="94"
                width="106"
                height="53"
                rx="7"
                fill="var(--promo-paper)"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M145 112h24l19 21v14h-43Z" fill="var(--accent)" />
              <path
                d="M151 118h14l12 15h-26Z"
                fill="var(--promo-paper)"
                fillOpacity=".9"
              />
              <circle cx="65" cy="148" r="13" fill="var(--promo-wheel)" />
              <circle cx="65" cy="148" r="5" fill="var(--promo-paper)" />
              <circle cx="166" cy="148" r="13" fill="var(--promo-wheel)" />
              <circle cx="166" cy="148" r="5" fill="var(--promo-paper)" />
              <path
                d="M75 119h34m-17-17v34"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
            <path
              d="M20 116h12m-18 13h18"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              className="promotion-speed"
            />
          </svg>
        )}
      </div>
    </>
  );
  return (
    <aside
      aria-label={t(lang, "ads.label")}
      className={`${compact ? "sponsor-banner" : "homepage-ad homepage-ad-active"} promotion-banner ${compact ? "promotion-banner-compact" : ""}`}
      data-tone={tone}
      data-animated={promotion.animated !== false}
    >
      {promotion.linkUrl && !preview ? (
        <a
          className="promotion-banner-content"
          href={promotion.linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
        >
          {content}
        </a>
      ) : (
        <div className="promotion-banner-content">{content}</div>
      )}
    </aside>
  );
}
