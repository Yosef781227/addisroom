"use client";
import { useState } from "react";
import { BEDROOM_FILTERS, PROPERTY_TYPES } from "@/lib/addis";
import { LocationSelector } from "@/components/LocationSelector";
import { type Lang, t } from "@/lib/i18n";
import { AmenitiesSelector } from "@/components/AmenitiesSelector";
import type { SearchFilters } from "@/lib/search-shared";
type Initial = Omit<SearchFilters, "page">;
export const EMPTY_SEARCH: Initial = {
  deal: "RENT",
  propertyType: null,
  neighborhood: "",
  area: "",
  radiusKm: null,
  priceMin: null,
  priceMax: null,
  areaMin: null,
  areaMax: null,
  rooms: [],
  furnished: false,
  amenities: [],
  q: "",
  sort: "new",
  view: "list",
};
export function SearchBar({
  lang,
  initial = EMPTY_SEARCH,
  variant = "page",
}: {
  lang: Lang;
  initial?: Initial;
  variant?: "hero" | "page";
}) {
  const [propertyType, setPropertyType] = useState(initial.propertyType ?? "");
  const [error, setError] = useState("");
  const isShop = propertyType === "SHOP";
  return (
    <form
      action="/search"
      className={`rental-search ${variant === "page" ? "rental-search-page" : ""}`}
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        for (const [min, max, label] of [
          ["priceMin", "priceMax", t(lang, "search.price")],
        ]) {
          const a = Number(fd.get(min)),
            b = Number(fd.get(max));
          if (a > 0 && b > 0 && a > b) {
            e.preventDefault();
            setError(`${label}: minimum must not exceed maximum.`);
            return;
          }
        }
        setError("");
      }}
    >
      {lang !== "en" && <input type="hidden" name="lang" value={lang} />}
      <input type="hidden" name="sort" value={initial.sort} />
      <p className="rental-search-heading">{t(lang, "home.filtersTitle")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <LocationSelector
          lang={lang}
          initialArea={initial.area}
          initialNeighborhood={initial.neighborhood}
          hideNeighborhoodUntilArea
        />

        <label>
          <span className="field-label">{t(lang, "search.rooms")}</span>
          <select
            name="rooms"
            defaultValue={initial.rooms[0] ?? ""}
            disabled={isShop}
            className="home-input h-12 w-full disabled:opacity-50"
          >
            <option value="">{t(lang, "home.anyBedrooms")}</option>
            {BEDROOM_FILTERS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">{t(lang, "home.propertyType")}</span>
          <select
            name="propertyType"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="home-input h-12 w-full"
          >
            <option value="">{t(lang, "home.allPropertyTypes")}</option>
            {PROPERTY_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">
            {t(lang, "search.minPrice")}
            {` ${t(lang, "search.perMonth")}`}
          </span>
          <input
            type="number"
            name="priceMin"
            max={2147483647}
            min={0}
            step={1}
            defaultValue={initial.priceMin ?? ""}
            placeholder="0"
            className="home-input h-12 w-full"
          />
        </label>
        <label>
          <span className="field-label">
            {t(lang, "search.maxPrice")}
            {` ${t(lang, "search.perMonth")}`}
          </span>
          <input
            type="number"
            name="priceMax"
            max={2147483647}
            min={0}
            step={1}
            defaultValue={initial.priceMax ?? ""}
            placeholder={t(lang, "search.anyPrice")}
            className="home-input h-12 w-full"
          />
        </label>
      </div>
      <AmenitiesSelector lang={lang} initial={initial.amenities} />
      {error && (
        <p role="alert" className="text-red-700 text-sm mt-3">
          {error}
        </p>
      )}
      <div className="rental-search-actions">
        <button
          type="submit"
          name="view"
          value={initial.view}
          className="btn-primary h-12"
        >
          {t(lang, "search.submit")}
        </button>
        <button
          type="submit"
          name="view"
          value="map"
          className="rental-map-action"
        >
          ⌖ {t(lang, "search.seeOnMap")}
        </button>
      </div>
      {variant === "page" && (
        <a
          className="block text-center mt-4 text-xs text-[var(--brand-700)] underline"
          href={`/search${lang !== "en" ? `?lang=${lang}` : ""}`}
        >
          {t(lang, "search.clear")}
        </a>
      )}
    </form>
  );
}
