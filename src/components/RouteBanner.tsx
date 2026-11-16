"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { parseLang, t } from "@/lib/i18n";
export function RouteBanner() {
  const path = usePathname(),
    sp = useSearchParams(),
    lang = parseLang(sp.get("lang"));
  if (path === "/") return null;
  const title =
    path === "/search"
      ? sp.get("view") === "map"
        ? t(lang, "search.seeOnMap")
        : t(lang, "banner.rentals")
      : path === "/listings/new"
        ? t(lang, "nav.post")
        : path.startsWith("/listings/")
          ? t(lang, "banner.details")
          : path === "/saved"
            ? t(lang, "saved.title")
            : path === "/inbox"
              ? t(lang, "inbox.title")
              : path.startsWith("/profile")
                ? t(lang, "banner.profile")
                : "ADDISROOM";
  return (
    <section
      className={`villa-page-banner ${path === "/search" && sp.get("view") === "map" ? "villa-page-banner-map" : ""}`}
    >
      <div>
        <a href={lang === "en" ? "/" : `/?lang=${lang}`}>
          {t(lang, "nav.bottom.home")}
        </a>
        <span> / {title}</span>
      </div>
      <p>{title}</p>
    </section>
  );
}
