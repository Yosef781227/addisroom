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
        ? "EXPLORE THE MAP"
        : "RENTAL PROPERTIES"
      : path === "/listings/new"
        ? "LIST YOUR PROPERTY"
        : path.startsWith("/listings/")
          ? "PROPERTY DETAILS"
          : path === "/saved"
            ? "SAVED PROPERTIES"
            : path === "/inbox"
              ? "YOUR MESSAGES"
              : path.startsWith("/profile")
                ? "YOUR PROFILE"
                : "ADDISROOM";
  return (
    <section
      className={`villa-page-banner ${path === "/search" && sp.get("view") === "map" ? "villa-page-banner-map" : ""}`}
    >
      <div>
        <a href={lang === "en" ? "/" : `/?lang=${lang}`}>
          {lang === "en" ? "HOME" : t(lang, "nav.rent")}
        </a>
        <span> / {lang === "en" ? title : t(lang, "home.eyebrow")}</span>
      </div>
      <p>{title}</p>
    </section>
  );
}
