import { Suspense } from "react";
import { type Lang } from "@/lib/i18n";
import { BannerAd } from "@/components/BannerAd";
import { FooterLinks } from "@/components/FooterLinks";
export async function SiteFooter({ lang = "en" }: { lang?: Lang }) {
  return (
    <footer className="reference-footer">
      <div className="mx-auto max-w-6xl px-4 py-7">
        <BannerAd lang={lang} />
        <div className="villa-footer-brand">
          ADDISROOM<span>Find your place in Addis.</span>
        </div>
        <Suspense fallback={null}>
          <FooterLinks />
        </Suspense>
        <p className="villa-design-credit">
          Design adapted from{" "}
          <a
            href="https://templatemo.com/tm-591-villa-agency"
            target="_blank"
            rel="noreferrer"
          >
            Villa Agency by TemplateMo
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
