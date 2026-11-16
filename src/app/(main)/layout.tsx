import { headers } from "next/headers";
import { parseLang } from "@/lib/i18n";
import { RouteBanner } from "@/components/RouteBanner";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PaymentToast } from "@/components/PaymentToast";
import { getSessionProfile } from "@/lib/auth";
import { isProfileComplete } from "@/lib/profile";
import { canPostListing } from "@/lib/monetization";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = parseLang((await headers()).get("x-addisroom-lang"));
  const me = await getSessionProfile();

  if (me && !me.isAdmin && !isProfileComplete(me)) {
    redirect("/onboarding");
  }

  if (me && !me.isAdmin && me.identityStatus !== "APPROVED")
    redirect("/verification");

  const loggedIn = Boolean(me);
  const canPost = me ? canPostListing(me.role) : false;

  return (
    <div
      className={
        loggedIn ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]" : ""
      }
    >
      <Suspense fallback={null}>
        <PaymentToast />
      </Suspense>
      <AppHeader loggedIn={loggedIn} isAdmin={me?.isAdmin ?? false} />
      <Suspense fallback={null}>
        <RouteBanner />
      </Suspense>
      <main className="villa-main mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
      <SiteFooter lang={lang} />
      {loggedIn && <BottomNav canPost={canPost} />}
    </div>
  );
}
