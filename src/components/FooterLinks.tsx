"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseLang, t } from "@/lib/i18n";
export function FooterLinks() {
  const sp = useSearchParams(),
    lang = parseLang(sp.get("lang")),
    qs = lang === "en" ? "" : `?lang=${lang}`;
  return (
    <nav className="brand-footer-links" aria-label="Footer navigation">
      <Link href={`/search${qs}`}>
        {t(lang, "footer.browse")} <span aria-hidden="true">↗</span>
      </Link>
      <Link href={`/search?view=map${lang === "en" ? "" : `&lang=${lang}`}`}>
        {t(lang, "search.seeOnMap")} <span aria-hidden="true">↗</span>
      </Link>
      <Link href={`/listings/new${qs}`}>
        {t(lang, "nav.post")} <span aria-hidden="true">↗</span>
      </Link>
      <Link href={`/signup${qs}`}>
        {t(lang, "footer.signup")} <span aria-hidden="true">↗</span>
      </Link>
    </nav>
  );
}
