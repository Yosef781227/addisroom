"use client";
import { useActionState, useState } from "react";
import { manageSponsorship } from "@/lib/admin-actions";
import {
  PromotionBanner,
  type PromotionData,
} from "@/components/PromotionBanner";
type Initial = PromotionData & { id: string; activeSlot: number | null };
const sample = {
  headline: "Move in without the hassle",
  body: "Sample advertisement · Moving, packing and a fresh start. Showcase your business to people finding their next home in Addis Ababa.",
  imageUrl: "",
  linkUrl: "",
  ctaLabel: "Explore services",
  theme: "warm",
  animated: true,
  isSample: true,
};
function safeImage(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export function PromotionForm({ initial }: { initial?: Initial }) {
  const [state, action, pending] = useActionState(manageSponsorship, null);
  const [fields, setFields] = useState({
    headline: initial?.headline ?? "",
    body: initial?.body ?? "",
    imageUrl: initial?.imageUrl ?? "",
    linkUrl: initial?.linkUrl ?? "",
    ctaLabel: initial?.ctaLabel ?? "Learn more",
    theme: initial?.theme ?? "warm",
    animated: initial?.animated ?? true,
    isSample: initial?.isSample ?? false,
  });
  const [publication, setPublication] = useState(
    initial ? (initial.activeSlot !== null ? "publish" : "draft") : "draft",
  );
  function text(
    name: "headline" | "body" | "imageUrl" | "linkUrl" | "ctaLabel" | "theme",
    value: string,
  ) {
    setFields((f) => ({ ...f, [name]: value }));
  }
  return (
    <form
      action={action}
      onReset={(e) => e.preventDefault()}
      className="card promotion-form p-5 sm:p-7 space-y-5"
    >
      <input
        type="hidden"
        name="command"
        value={initial ? "update" : "create"}
      />
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="font-semibold">
          {initial ? "Edit promotion" : "Create a promotion"}
        </h2>
        {!initial && (
          <button
            type="button"
            className="admin-button"
            onClick={() => {
              setFields({ ...sample });
              setPublication("draft");
            }}
          >
            Fill sample advertisement
          </button>
        )}
      </div>
      <div>
        <label
          htmlFor={`headline-${initial?.id ?? "new"}`}
          className="field-label"
        >
          Headline
        </label>
        <input
          id={`headline-${initial?.id ?? "new"}`}
          name="headline"
          value={fields.headline}
          onChange={(e) => text("headline", e.target.value)}
          required
          minLength={3}
          maxLength={120}
          className="input-field"
          placeholder="Your promotion headline"
        />
      </div>
      <label className="block">
        <span className="field-label">Description</span>
        <textarea
          name="body"
          value={fields.body}
          onChange={(e) => text("body", e.target.value)}
          required
          maxLength={500}
          rows={3}
          className="input-field !h-auto py-3"
          placeholder="Tell visitors what you offer"
        />
      </label>
      <div className="grid sm:grid-cols-2 gap-4">
        <label>
          <span className="field-label">Image URL (optional)</span>
          <input
            name="imageUrl"
            type="url"
            value={fields.imageUrl}
            onChange={(e) => text("imageUrl", e.target.value)}
            maxLength={2000}
            className="input-field"
            placeholder="https://…"
          />
          <span className="block text-xs text-[var(--muted)] mt-2">
            Leave empty to use the animated illustration.
          </span>
        </label>
        <label>
          <span className="field-label">Destination URL (optional)</span>
          <input
            name="linkUrl"
            type="url"
            value={fields.linkUrl}
            onChange={(e) => text("linkUrl", e.target.value)}
            maxLength={2000}
            className="input-field"
            placeholder="https://…"
          />
          <span className="block text-xs text-[var(--muted)] mt-2">
            No link or button is shown when empty.
          </span>
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label>
          <span className="field-label">Button text</span>
          <input
            name="ctaLabel"
            value={fields.ctaLabel}
            onChange={(e) => text("ctaLabel", e.target.value)}
            maxLength={40}
            className="input-field"
          />
        </label>
        <label>
          <span className="field-label">Banner style</span>
          <select
            name="theme"
            value={fields.theme}
            onChange={(e) => text("theme", e.target.value)}
            className="input-field"
          >
            <option value="warm">Warm / cream</option>
            <option value="dark">Charcoal</option>
            <option value="neutral">Clean / neutral</option>
          </select>
        </label>
      </div>
      <input
        type="hidden"
        name="animated"
        value={fields.animated ? "on" : "off"}
      />
      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={fields.animated}
            onChange={(e) =>
              setFields((f) => ({ ...f, animated: e.target.checked }))
            }
          />
          Animate this promotion
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isSample"
            checked={fields.isSample}
            onChange={(e) =>
              setFields((f) => ({ ...f, isSample: e.target.checked }))
            }
          />
          Mark as sample advertisement
        </label>
      </div>
      <section className="promotion-preview">
        <h3 className="field-label mb-3">
          Live preview · links are disabled here
        </h3>
        <PromotionBanner
          preview
          promotion={{
            ...fields,
            imageUrl: safeImage(fields.imageUrl),
            headline: fields.headline || "Your promotion headline",
            body: fields.body || "Your description will appear here.",
          }}
        />
      </section>
      <label className="block">
        <span className="field-label">Visibility</span>
        <select
          name="publication"
          value={publication}
          onChange={(e) => setPublication(e.target.value)}
          className="input-field"
        >
          <option value="draft">Save as draft</option>
          <option value="publish">Publish now</option>
        </select>
      </label>
      {publication === "publish" && (
        <p className="text-xs text-[var(--muted)]">
          Publish up to three promotions together. They rotate automatically;
          deactivate a live promotion to make room for another.
        </p>
      )}
      <button disabled={pending} className="btn-primary h-11 w-full">
        {pending
          ? "Saving…"
          : publication === "publish"
            ? "Save & publish promotion"
            : "Save draft"}
      </button>
      {state && (
        <p
          role="status"
          className={`text-sm ${state.error ? "text-red-700" : "text-[var(--brand-700)]"}`}
        >
          {state.error ?? state.success}
        </p>
      )}
    </form>
  );
}
export function PromotionEditor({ promotion }: { promotion: Initial }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      <button
        className="admin-button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? "Close editor" : "Edit promotion"}
      </button>
      {open && (
        <div className="mt-4">
          <PromotionForm initial={promotion} />
        </div>
      )}
    </div>
  );
}
