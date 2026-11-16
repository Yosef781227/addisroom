import Link from "next/link";
import { Suspense } from "react";
import { type Lang } from "@/lib/i18n";
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
            <h2>Your next home. Your neighborhood.</h2>
            <p>
              Find rental homes across Addis Ababa and nearby towns. Compare
              properties, explore the map, and connect directly with landlords
              and agents.
            </p>
          </div>
          <div className="brand-footer-explore">
            <h2>Make yourself at home</h2>
            <Suspense fallback={null}>
              <FooterLinks />
            </Suspense>
          </div>
          <div className="brand-footer-connect">
            <h2>Stay connected</h2>
            <p>
              Neighborhood discoveries, rental updates, and a little inspiration
              for your next move.
            </p>
            <SocialLinks />
          </div>
        </div>
        <div className="brand-footer-bottom">
          <p>© {new Date().getFullYear()} Addis Rooms. All rights reserved.</p>
          <p>Made for renting. Built around you.</p>
        </div>
      </div>
    </footer>
  );
}
