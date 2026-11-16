ALTER TABLE "Sponsorship" ADD COLUMN "ctaLabel" TEXT DEFAULT 'Learn more';
ALTER TABLE "Sponsorship" ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'warm';
ALTER TABLE "Sponsorship" ADD COLUMN "animated" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Sponsorship" ADD COLUMN "isSample" BOOLEAN NOT NULL DEFAULT false;
