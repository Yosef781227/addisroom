"use client";
import { type Lang, t } from "@/lib/i18n";
import { useSyncExternalStore } from "react";
const eventName = "addisroom-theme";
function snapshot() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
function subscribe(callback: () => void) {
  const update = () => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("addisroom-color-mode");
    } catch {}
    document.documentElement.dataset.theme =
      stored === "dark" ? "dark" : "light";
    callback();
  };
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", update);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", update);
  };
}
export function ThemeToggle({ lang = "en" }: { lang?: Lang }) {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "light"),
    dark = theme === "dark";
  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("addisroom-color-mode", next);
    } catch {}
    window.dispatchEvent(new Event(eventName));
  }
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={t(lang, dark ? "common.lightMode" : "common.darkMode")}
      title={t(lang, dark ? "common.lightMode" : "common.darkMode")}
    >
      <svg
        viewBox="0 0 24 24"
        width="19"
        height="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>
        ) : (
          <path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" />
        )}
      </svg>
    </button>
  );
}
