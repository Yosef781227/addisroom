import { AMENITIES, type Amenity } from "@/lib/amenities";
import { t, type Lang } from "@/lib/i18n";
export function AmenityBadges({
  values,
  lang,
}: {
  values: Amenity[];
  lang: Lang;
}) {
  if (!values.length) return null;
  return (
    <div className="flex flex-wrap gap-2" aria-label={t(lang, "amenity.title")}>
      {AMENITIES.filter((a) => values.includes(a.value)).map((a) => (
        <span
          key={a.value}
          className="rounded-full bg-[var(--brand-50)] px-2.5 py-1 text-xs font-medium text-[var(--brand-900)]"
        >
          {t(lang, a.label)}
        </span>
      ))}
    </div>
  );
}
