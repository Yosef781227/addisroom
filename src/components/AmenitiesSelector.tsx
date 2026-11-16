"use client";
import { useState } from "react";
import { AMENITIES, type AmenityFilter } from "@/lib/amenities";
import { type Lang, t } from "@/lib/i18n";
const icons: Record<string, string> = {
  PARKING: "M6 21V3h7a5 5 0 0 1 0 10H6m0-7h7a2 2 0 0 1 0 4H6",
  FURNISHED:
    "M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M4 18v3m16-3v3M2 11h4v4h12v-4h4v7H2Z",
  ELEVATOR: "M5 2h14v20H5ZM9 9l3-3 3 3m-6 6 3 3 3-3",
  BALCONY: "M5 13V3h14v10M12 3v10M2 13h20M3 13v8m6-8v8m6-8v8m6-8v8M2 21h20",
  WIFI: "M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0m-4 4h.01",
  BILLS_INCLUDED: "M6 2h12v20l-3-2-3 2-3-2-3 2ZM9 7h6m-6 4h6m-6 4h3",
};
function Icon({ value }: { value: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[value]} />
    </svg>
  );
}
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
  const content = (
    <fieldset>
      <legend className="sr-only">{t(lang, "amenity.title")}</legend>
      <div className="amenity-tiles">
        {AMENITIES.map((a) =>
          mode === "filter" && a.value === "PARKING" ? (
            <label
              className="amenity-tile amenity-parking"
              data-selected={
                selected.includes("PARKING") || selected.includes("NO_PARKING")
              }
              key={a.value}
            >
              <Icon value={a.value} />
              <span>{t(lang, a.label)}</span>
              <select
                aria-label={t(lang, a.label)}
                name="amenities"
                value={
                  selected.includes("PARKING")
                    ? "PARKING"
                    : selected.includes("NO_PARKING")
                      ? "NO_PARKING"
                      : ""
                }
                onChange={(e) =>
                  setSelected((values) => [
                    ...values.filter(
                      (v) => v !== "PARKING" && v !== "NO_PARKING",
                    ),
                    ...(e.target.value
                      ? [e.target.value as AmenityFilter]
                      : []),
                  ])
                }
              >
                <option value="">{t(lang, "amenity.anyParking")}</option>
                <option value="PARKING">{t(lang, "amenity.parkingYes")}</option>
                <option value="NO_PARKING">
                  {t(lang, "amenity.parkingNo")}
                </option>
              </select>
            </label>
          ) : (
            <label
              className="amenity-tile"
              data-selected={selected.includes(a.value)}
              key={a.value}
            >
              <input
                type="checkbox"
                name={mode === "filter" ? "amenities" : a.field}
                value={mode === "filter" ? a.value : "on"}
                checked={selected.includes(a.value)}
                onChange={(e) =>
                  setSelected((values) =>
                    e.target.checked
                      ? [...values, a.value]
                      : values.filter((v) => v !== a.value),
                  )
                }
              />
              <Icon value={a.value} />
              <span>{t(lang, a.label)}</span>
              <span className="amenity-check" aria-hidden="true">
                {selected.includes(a.value) ? "✓" : "+"}
              </span>
            </label>
          ),
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">
        {t(
          lang,
          mode === "filter" ? "amenity.allMatch" : "amenity.listingHint",
        )}
      </p>
    </fieldset>
  );
  return mode === "filter" ? (
    <details className="amenity-panel" open={initial.length > 0 || undefined}>
      <summary>
        <span>
          {t(lang, "amenity.title")}{" "}
          <span className="amenity-count">{selected.length || "+"}</span>
        </span>
        <span className="text-xs font-normal text-[var(--muted)]">
          {t(lang, "common.optional")} ⌄
        </span>
      </summary>
      <div className="p-4 pt-0">{content}</div>
    </details>
  ) : (
    <section className="amenity-panel p-4 mt-6">
      <h2 className="font-semibold mb-4">{t(lang, "amenity.title")}</h2>
      {content}
    </section>
  );
}
