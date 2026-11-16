// Explicit local example only. This script is never called by container startup.
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
if (process.env.NODE_ENV === "production")
  throw Error("Sample promotion seeding is for local development only.");
const url = process.env.DATABASE_URL ?? "file:./dev.db";
if (!url.startsWith("file:"))
  throw Error("A local SQLite database is required.");
const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: "file:" + path.resolve(url.slice(5)),
  }),
});
try {
  const samples = [
    {
      id: "sample-local-promotion",
      headline: "Move in without the hassle",
      body: "Sample advertisement · Packing, moving and a fresh start. Make your next move in Addis a little easier.",
      theme: "warm",
    },
    {
      id: "sample-local-promotion-interiors",
      headline: "Make room for your own style",
      body: "Sample advertisement · Furniture, lighting and thoughtful details to turn your rental into a home.",
      theme: "dark",
    },
    {
      id: "sample-local-promotion-internet",
      headline: "New home. Stay connected.",
      body: "Sample advertisement · Introduce your WiFi and home services to people settling into their next place.",
      theme: "neutral",
    },
  ];
  for (const sample of samples) {
    if (await db.sponsorship.findUnique({ where: { id: sample.id } })) continue;
    await db.$transaction(async (tx) => {
      const live = await tx.sponsorship.findMany({
        where: { activeSlot: { not: null } },
      });
      const slot = [1, 2, 3].find(
        (value) => !live.some((row) => row.activeSlot === value),
      );
      await tx.sponsorship.create({
        data: {
          ...sample,
          animated: true,
          isSample: true,
          ctaLabel: "Learn more",
          activeSlot: slot ?? null,
        },
      });
      await tx.adminAudit.create({
        data: {
          actorId: "LOCAL_OPERATOR",
          profileId: sample.id,
          decision: "SPONSOR_CREATED",
          note: "Local sample promotion added for review.",
        },
      });
    });
  }
  console.log("Local sample promotions ready; existing content preserved.");
} finally {
  await db.$disconnect();
}
