"use client";
import { useState } from "react";
import { AMENITIES, type AmenityFilter } from "@/lib/amenities";
import { type Lang, t } from "@/lib/i18n";
export function AmenitiesSelector({
  lang,
  mode = "filter",
  initial = [],
}: {
  lang: Lang;
  mode?: "filter" | "listing";
  initial?: AmenityFilter[];
}) {
  const [selected, setSelected] = useState<AmenityFilter[]>(initial);
  function toggle(value: AmenityFilter, checked: boolean) {
    setSelected((values) =>
      checked
        ? [...values.filter((v) => v !== value), value]
        : values.filter((v) => v !== value),
    );
  }
  const options =
    mode === "filter"
      ? AMENITIES.filter((a) => a.value !== "PARKING")
      : AMENITIES;
  const content = (
    <fieldset className="space-y-4">
      <legend className="sr-only">{t(lang, "amenity.title")}</legend>
      {mode === "filter" && (
        <div>
          <p className="text-sm font-medium mb-2">
            {t(lang, "amenity.parking")}
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              [
                ["", "amenity.anyParking"],
                ["PARKING", "amenity.parkingYes"],
                ["NO_PARKING", "amenity.parkingNo"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="amenities"
                  value={value}
                  checked={
                    value
                      ? selected.includes(value as AmenityFilter)
                      : !selected.some(
                          (v) => v === "PARKING" || v === "NO_PARKING",
                        )
                  }
                  onChange={() =>
                    setSelected((values) => [
                      ...values.filter(
                        (v) => v !== "PARKING" && v !== "NO_PARKING",
                      ),
                      ...(value ? [value as AmenityFilter] : []),
                    ])
                  }
                  className="accent-[var(--brand-600)]"
                />
                {t(lang, label)}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map((a) => (
          <label key={a.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={mode === "filter" ? "amenities" : a.field}
              value={mode === "filter" ? a.value : "on"}
              checked={selected.includes(a.value)}
              onChange={(e) => toggle(a.value, e.target.checked)}
              className="h-4 w-4 accent-[var(--brand-600)]"
            />
            {t(lang, a.label)}
          </label>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">
        {t(
          lang,
          mode === "filter" ? "amenity.allMatch" : "amenity.listingHint",
        )}
      </p>
    </fieldset>
  );
  return mode === "filter" ? (
    <details className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--brand-50)]/40">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-[var(--brand-800)]">
        {t(lang, "amenity.title")}
        {selected.length > 0 ? ` (${selected.length})` : ""}
      </summary>
      <div className="px-4 pb-4">{content}</div>
    </details>
  ) : (
    <section className="mt-6 rounded-xl border border-[var(--border)] p-4">
      <h2 className="font-semibold mb-4">{t(lang, "amenity.title")}</h2>
      {content}
    </section>
  );
}
