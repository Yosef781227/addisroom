import Link from "next/link";
import { Suspense } from "react";
import { type Lang, t } from "@/lib/i18n";
import { BannerAd } from "@/components/BannerAd";
import { FooterLinks } from "@/components/FooterLinks";
import { BrandLogo } from "@/components/BrandLogo";
import { SocialLinks } from "@/components/SocialLinks";
export async function SiteFooter({ lang = "en" }: { lang?: Lang }) {
  return (
    <footer className="reference-footer brand-footer">
      <div className="mx-auto max-w-6xl px-4">
        <BannerAd lang={lang} />
        <div className="brand-footer-grid">
          <div className="brand-footer-about">
            <Link href="/" aria-label="Addis Rooms home">
              <BrandLogo footer />
            </Link>
            <h2>{t(lang, "footer.heading")}</h2>
            <p>{t(lang, "footer.description")}</p>
          </div>
          <div className="brand-footer-explore">
            <h2>{t(lang, "footer.explore")}</h2>
            <Suspense fallback={null}>
              <FooterLinks />
            </Suspense>
          </div>
          <div className="brand-footer-connect">
            <h2>{t(lang, "footer.connect")}</h2>
            <p>{t(lang, "footer.connectBody")}</p>
            <SocialLinks />
          </div>
        </div>
        <div className="brand-footer-bottom">
          <p>
            © {new Date().getFullYear()} Addis Rooms.{" "}
            {t(lang, "footer.rights")}
          </p>
          <p>{t(lang, "footer.motto")}</p>
        </div>
      </div>
    </footer>
  );
}
