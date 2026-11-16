"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { parseLang, t, type Lang } from "@/lib/i18n";

const options: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "am", label: "አማርኛ" },
  { value: "om", label: "Afaan Oromoo" },
  { value: "ar", label: "العربية" },
  { value: "fr", label: "Français" },
  { value: "ti", label: "ትግርኛ" },
];

export function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = parseLang(searchParams.get("lang"));

  function onChange(next: Lang) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "en") params.delete("lang");
    else params.set("lang", next);
    const qs = params.toString();
    window.location.assign(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <select
      value={lang}
      onChange={(e) => onChange(parseLang(e.target.value))}
      aria-label={t(lang, "common.language")}
      dir="ltr"
      className="lang-select"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
