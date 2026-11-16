// Synthetic listings only; never imports local accounts, sessions or identity documents.
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
if (process.env.TEST_DEPLOYMENT !== "true") process.exit(0);
const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL }),
});
try {
  const owner = await db.profile.upsert({
    where: { id: "demo-landlord" },
    update: {},
    create: {
      id: "demo-landlord",
      name: "Demo landlord",
      role: "LANDLORD",
      profileComplete: true,
      bio: "Synthetic profile for the AddisRoom test deployment. Not a real landlord.",
    },
  });
  const homes = [
    [
      "bole",
      "Two-bedroom apartment",
      "Bole Subcity",
      "Edna Mall area",
      "APARTMENT",
      "TWO",
      45000,
      85,
      8.997,
      38.79,
      "1522708323590-d24dbb6b0267",
    ],
    [
      "yeka",
      "Bright furnished studio",
      "Yeka Subcity",
      "Wesen Grocery",
      "APARTMENT",
      "ONE",
      18000,
      38,
      9.04,
      38.84,
      "1505691938895-1758d7feb511",
    ],
    [
      "lafto",
      "Condominium with balcony",
      "Nifas Silk-Lafto Subcity",
      "Jemo 1",
      "CONDOMINIUM",
      "TWO",
      16000,
      70,
      8.935,
      38.72,
      "1484154218962-a197022b5858",
    ],
    [
      "kirkos",
      "Family house with a garden",
      "Kirkos Subcity",
      "Sarbet (African Union area)",
      "HOUSE",
      "THREE_PLUS",
      65000,
      160,
      9.01,
      38.735,
      "1600585154340-be6161a56a0c",
    ],
    [
      "sebeta",
      "Quiet one-bedroom home",
      "Sebeta",
      "Furi",
      "HOUSE",
      "ONE",
      12000,
      50,
      8.91,
      38.65,
      "1493809842364-78817add7ffb",
    ],
    [
      "legetafo",
      "Spacious family villa",
      "Legetafo-Legedadi",
      "Legetafo town",
      "VILLA",
      "THREE_PLUS",
      85000,
      240,
      9.05,
      38.88,
      "1616594039964-ae9021a400a0",
    ],
  ];
  for (const [
    key,
    title,
    area,
    neighborhood,
    propertyType,
    bedrooms,
    priceBirr,
    areaSqm,
    latitude,
    longitude,
    photo,
  ] of homes) {
    const id = `demo-rental-${key}`;
    if (await db.listing.findUnique({ where: { id }, select: { id: true } }))
      continue;
    await db.listing.create({
      data: {
        id,
        title: `Demo · ${title}`,
        description:
          "Sample property for testing AddisRoom. This is not a real rental offer. Explore the location filters, amenities, saved listings and map.",
        area,
        neighborhood,
        city: ["Sebeta", "Legetafo-Legedadi"].includes(area)
          ? area
          : "Addis Ababa",
        propertyType,
        bedrooms,
        roomType: "APARTMENT",
        dealType: "RENT",
        priceBirr,
        areaSqm,
        latitude,
        longitude,
        furnished: ["bole", "yeka"].includes(key),
        parking: ["bole", "kirkos", "legetafo"].includes(key),
        wifi: true,
        elevator: key === "bole",
        balcony: ["bole", "lafto"].includes(key),
        billsIncluded: key === "yeka",
        availableFrom: new Date(),
        published: true,
        postedById: owner.id,
        images: {
          create: [
            {
              url: `https://images.unsplash.com/photo-${photo}?w=1200&q=80`,
              sortOrder: 0,
            },
          ],
        },
      },
    });
  }
  console.log("Synthetic test listings are ready.");
} finally {
  await db.$disconnect();
}
