import { PromotionEditor } from "@/components/PromotionForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { SponsorForm, SponsorControls } from "@/components/AdminControls";
export default async function SponsorsPage() {
  await requireAdmin();
  const sponsors = await prisma.sponsorship.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="max-w-3xl mx-auto space-y-7">
      <div>
        <h1 className="text-2xl font-bold">Promotions & advertisements</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Create, preview and edit dynamic promotions. Save drafts or publish up
          to three rotating banners across the app. Animation and appearance are
          controlled here.
        </p>
      </div>
      <SponsorForm />
      <section>
        <h2 className="text-xs uppercase font-semibold tracking-wider text-[var(--muted)] mb-3">
          All sponsor posts ({sponsors.length})
        </h2>
        <div className="space-y-3">
          {sponsors.map((s) => (
            <article
              key={s.id}
              className="card p-5 flex flex-wrap gap-4 justify-between"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">
                  {s.headline}{" "}
                  {s.activeSlot === null && (
                    <span className="status-pill">Draft / inactive</span>
                  )}
                  {s.isSample && <span className="status-pill">Sample</span>}
                  {s.activeSlot !== null && (
                    <span className="status-pill !bg-green-50 !text-green-800">
                      Live
                    </span>
                  )}
                </h3>
                <p className="text-sm text-[var(--muted)] mt-2">{s.body}</p>
                {s.linkUrl && (
                  <a
                    href={s.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline text-[var(--brand-700)] break-all"
                  >
                    {s.linkUrl}
                  </a>
                )}
              </div>
              <SponsorControls id={s.id} active={s.activeSlot !== null} />
              <PromotionEditor promotion={s} />
            </article>
          ))}
          {!sponsors.length && (
            <div className="card p-6 text-sm text-[var(--muted)]">
              No sponsorships yet. Post one above to publish the first banner.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
