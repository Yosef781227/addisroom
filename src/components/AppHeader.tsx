"use client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { logout } from "@/lib/auth-actions";
import { parseLang, t } from "@/lib/i18n";

function SignInButton() {
  const searchParams = useSearchParams();
  const lang = parseLang(searchParams.get("lang"));

  function href(path: string) {
    const params = new URLSearchParams(searchParams.toString());
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  }

  return (
    <a href={href("/login")} className="header-btn btn-primary btn-shine">
      {t(lang, "nav.login")}
    </a>
  );
}

function MainLinks({ showPost }: { showPost: boolean }) {
  const searchParams = useSearchParams();
  const lang = parseLang(searchParams.get("lang"));
  const pathname = usePathname();
  const amp = lang !== "en" ? `&lang=${lang}` : "";
  const qs = lang !== "en" ? `?lang=${lang}` : "";

  return (
    <div className="mr-auto hidden items-center gap-4 pl-1 sm:flex sm:gap-7 sm:pl-8">
      <a
        href={`/${qs}`}
        className="nav-link"
        aria-current={pathname === "/" ? "page" : undefined}
      >
        {lang === "en" ? "Home" : "መነሻ"}
      </a>
      <a
        href={`/search${qs}`}
        className="nav-link"
        aria-current={
          pathname === "/search" && searchParams.get("view") !== "map"
            ? "page"
            : undefined
        }
      >
        {t(lang, "nav.rent")}
      </a>
      <a
        href={`/search?view=map${amp}`}
        className="nav-link"
        aria-current={searchParams.get("view") === "map" ? "page" : undefined}
      >
        {t(lang, "search.map")}
      </a>
      {showPost ? (
        <a href={`/listings/new${qs}`} className="nav-link hidden md:block">
          {t(lang, "nav.post")}
        </a>
      ) : null}
    </div>
  );
}

function LogOutButton() {
  const searchParams = useSearchParams();
  const lang = parseLang(searchParams.get("lang"));

  return (
    <form action={logout}>
      <button
        type="submit"
        className="header-btn border border-[var(--border)] font-medium text-[var(--muted)] transition hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]"
      >
        {t(lang, "nav.logout")}
      </button>
    </form>
  );
}

function MobileMenu({ loggedIn }: { loggedIn: boolean }) {
  const sp = useSearchParams(),
    lang = parseLang(sp.get("lang")),
    qs = lang === "en" ? "" : `?lang=${lang}`;
  return (
    <details className="villa-mobile-nav">
      <summary aria-label="Open navigation">☰</summary>
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a"))
            e.currentTarget.closest("details")?.removeAttribute("open");
        }}
      >
        <Link href={`/${qs}`}>{lang === "en" ? "Home" : "መነሻ"}</Link>
        <Link href={`/search${qs}`}>{t(lang, "nav.rent")}</Link>
        <Link href={`/search?view=map${lang === "en" ? "" : `&lang=${lang}`}`}>
          {t(lang, "search.map")}
        </Link>
        <Link href={`/listings/new${qs}`}>{t(lang, "nav.post")}</Link>
        {!loggedIn && (
          <Link href={`/signup${qs}`}>{t(lang, "footer.signup")}</Link>
        )}
      </div>
    </details>
  );
}

export function AppHeader({
  loggedIn = false,
  isAdmin = false,
}: {
  loggedIn?: boolean;
  isAdmin?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="villa-topbar">
        <div>
          <span className="topbar-location">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M12 22s8-7 8-13A8 8 0 0 0 4 9c0 6 8 13 8 13Z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            Addis Ababa & nearby towns
          </span>
          <span className="topbar-message">
            <span className="topbar-live-dot" aria-hidden="true" />
            Rental homes · Local connections
            <span className="topbar-arrow" aria-hidden="true">
              ↗
            </span>
          </span>
        </div>
      </div>
      <header className="site-header" data-scrolled={scrolled}>
        <div className="villa-header-inner mx-auto flex max-w-6xl items-center gap-3 px-4">
          <Link
            href="/"
            aria-label="AddisRoom home"
            className="flex shrink-0 items-center gap-2.5"
          >
            <BrandLogo />
          </Link>
          <nav className="flex min-w-0 flex-1 items-center justify-end gap-2.5 text-sm">
            <Suspense fallback={<div className="mr-auto" />}>
              <MainLinks showPost={!loggedIn} />
            </Suspense>
            {isAdmin && (
              <a href="/admin" className="nav-link">
                Admin
              </a>
            )}
            <ThemeToggle />
            <Suspense
              fallback={
                <div className="h-10 w-28 rounded-xl border border-[var(--border)] bg-[var(--brand-50)]" />
              }
            >
              <LanguageSwitcher />
            </Suspense>
            {!loggedIn ? (
              <Suspense fallback={null}>
                <SignInButton />
              </Suspense>
            ) : (
              <Suspense fallback={null}>
                <LogOutButton />
              </Suspense>
            )}
            <Suspense fallback={null}>
              <MobileMenu loggedIn={loggedIn} />
            </Suspense>
          </nav>
        </div>
      </header>
    </>
  );
}
