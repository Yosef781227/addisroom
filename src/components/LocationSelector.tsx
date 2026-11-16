"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  LOCATION_AREAS,
  getLocationArea,
  neighborhoodBelongsTo,
} from "@/lib/locations";
import { t, type Lang } from "@/lib/i18n";
export function LocationSelector({
  lang,
  required = false,
  hideNeighborhoodUntilArea = false,
  initialArea = "",
  initialNeighborhood = "",
  onChange,
}: {
  lang: Lang;
  required?: boolean;
  hideNeighborhoodUntilArea?: boolean;
  initialArea?: string;
  initialNeighborhood?: string;
  onChange?: (area: string, neighborhood: string) => void;
}) {
  const [area, setArea] = useState(initialArea);
  const [neighborhood, setNeighborhood] = useState(
    neighborhoodBelongsTo(initialArea, initialNeighborhood)
      ? initialNeighborhood
      : "",
  );
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const id = useId(),
    selectedArea = getLocationArea(area);
  const groups = (selectedArea?.groups ?? [])
    .map((g) => ({
      ...g,
      neighborhoods: g.neighborhoods.filter((n) =>
        n.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
      ),
    }))
    .filter((g) => g.neighborhoods.length);
  const allOptions = [
    ...new Set((selectedArea?.groups ?? []).flatMap((g) => g.neighborhoods)),
  ];
  function choose(value: string) {
    setNeighborhood(value);
    setOpen(false);
    setQuery("");
    onChange?.(area, value);
    trigger.current?.focus();
  }
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);
  useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);
  return (
    <>
      <label>
        <span className="field-label">
          {t(lang, "location.area")}
          {required ? " *" : ""}
        </span>
        <select
          name="area"
          value={area}
          required={required}
          className="home-input h-12 w-full"
          onChange={(e) => {
            setArea(e.target.value);
            setNeighborhood("");
            setQuery("");
            setOpen(false);
            onChange?.(e.target.value, "");
          }}
        >
          <option value="">
            {t(lang, required ? "location.chooseArea" : "location.anyArea")}
          </option>
          <optgroup label={t(lang, "location.subcities")}>
            {LOCATION_AREAS.filter((a) => a.kind === "subcity").map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </optgroup>
          <optgroup label={t(lang, "location.surrounding")}>
            {LOCATION_AREAS.filter((a) => a.kind === "surrounding").map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </optgroup>
        </select>
      </label>
      <div
        ref={root}
        hidden={hideNeighborhoodUntilArea && !area}
        className="relative min-w-0"
      >
        <span className="field-label" id={`${id}-label`}>
          {t(lang, "location.neighborhood")}
          {required ? " *" : ""}
        </span>
        <select
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          name="neighborhood"
          value={neighborhood}
          required={required}
          disabled={!area}
          onChange={(e) => choose(e.target.value)}
          onInvalid={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          <option value="" />
          {allOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          ref={trigger}
          type="button"
          role="combobox"
          aria-label={t(lang, "location.neighborhood")}
          aria-required={required}
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-haspopup="listbox"
          disabled={!area}
          title={neighborhood || undefined}
          className="home-input flex items-center justify-between gap-2 h-12 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            setOpen(!open);
            setQuery("");
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <span className="truncate">
            {neighborhood ||
              (area
                ? t(
                    lang,
                    required
                      ? "location.chooseNeighborhood"
                      : "location.anyNeighborhood",
                  )
                : t(lang, "location.selectAreaFirst"))}
          </span>
          <span aria-hidden="true">⌄</span>
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 z-[60] mt-2 overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-xl">
            <div className="p-3 border-b border-[var(--border)]">
              <input
                ref={input}
                type="search"
                aria-label={t(lang, "location.findNeighborhood")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(lang, "location.typeAhead")}
                className="home-input h-10 w-full"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setOpen(false);
                    trigger.current?.focus();
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const first = groups[0]?.neighborhoods[0];
                    if (first) choose(first);
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    root.current
                      ?.querySelector<HTMLButtonElement>('[role="option"]')
                      ?.focus();
                  }
                }}
              />
            </div>
            <div
              role="listbox"
              aria-label={t(lang, "location.neighborhood")}
              id={`${id}-list`}
              className="max-h-64 overflow-y-auto overscroll-contain p-1"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  trigger.current?.focus();
                }
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const options = [
                    ...e.currentTarget.querySelectorAll<HTMLButtonElement>(
                      '[role="option"]',
                    ),
                  ];
                  const index = options.indexOf(
                    document.activeElement as HTMLButtonElement,
                  );
                  options[
                    (index +
                      (e.key === "ArrowDown" ? 1 : -1) +
                      options.length) %
                      options.length
                  ]?.focus();
                }
              }}
            >
              {!required && !query && (
                <button
                  type="button"
                  role="option"
                  aria-selected={!neighborhood}
                  onClick={() => choose("")}
                  className="w-full rounded-lg p-3 text-left text-sm hover:bg-[var(--brand-50)] focus:bg-[var(--brand-50)]"
                >
                  {t(lang, "location.anyNeighborhood")}
                </button>
              )}
              {groups.map((g) => (
                <div role="group" aria-label={g.name} key={g.name}>
                  <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wide font-semibold text-[var(--muted)]">
                    {g.name}
                  </p>
                  {g.neighborhoods.map((n, i) => (
                    <button
                      type="button"
                      key={`${n}-${i}`}
                      role="option"
                      aria-selected={n === neighborhood}
                      onClick={() => choose(n)}
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[var(--brand-50)] focus:bg-[var(--brand-50)] focus:outline-none"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              ))}
              {!groups.length && (
                <p role="status" className="p-4 text-sm text-[var(--muted)]">
                  {t(lang, "location.noMatches")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
