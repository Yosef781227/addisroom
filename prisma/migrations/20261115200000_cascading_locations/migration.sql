-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "area" TEXT;

-- CreateIndex
CREATE INDEX "Listing_area_neighborhood_idx" ON "Listing"("area", "neighborhood");


-- Retain legacy neighborhood labels; only backfill their broad parent area.
UPDATE "Listing" SET "area" = 'Bole Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Bole';
UPDATE "Listing" SET "area" = 'Bole Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Gerji';
UPDATE "Listing" SET "area" = 'Kirkos Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Kazanchis';
UPDATE "Listing" SET "area" = 'Kirkos Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Gotera';
UPDATE "Listing" SET "area" = 'Kirkos Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Mexico';
UPDATE "Listing" SET "area" = 'Kirkos Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Kirkos';
UPDATE "Listing" SET "area" = 'Arada Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Piazza';
UPDATE "Listing" SET "area" = 'Arada Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Arat Kilo';
UPDATE "Listing" SET "area" = 'Arada Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Sidist Kilo';
UPDATE "Listing" SET "area" = 'Lideta Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Lideta';
UPDATE "Listing" SET "area" = 'Yeka Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Yeka';
UPDATE "Listing" SET "area" = 'Yeka Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Megenagna';
UPDATE "Listing" SET "area" = 'Nifas Silk-Lafto Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Nifas Silk';
UPDATE "Listing" SET "area" = 'Nifas Silk-Lafto Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Jemo';
UPDATE "Listing" SET "area" = 'Gullele Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Gullele';
UPDATE "Listing" SET "area" = 'Addis Ketema Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Addis Ketema';
UPDATE "Listing" SET "area" = 'Kolfe Keranio Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Kolfe Keranio';
UPDATE "Listing" SET "area" = 'Akaky Kaliti Subcity' WHERE "area" IS NULL AND "neighborhood" = 'Akaki Kality';
UPDATE "Listing" SET "area" = 'Sululta' WHERE "area" IS NULL AND "neighborhood" = 'Sululta';
UPDATE "Listing" SET "area" = 'Sebeta' WHERE "area" IS NULL AND "neighborhood" = 'Sebeta';
UPDATE "Listing" SET "area" = 'Koye Feche' WHERE "area" IS NULL AND "neighborhood" = 'Koye Feche';
UPDATE "Listing" SET "area" = 'Gelan & Dukem' WHERE "area" IS NULL AND "neighborhood" = 'Gelan';
UPDATE "Listing" SET "area" = 'Legetafo-Legedadi' WHERE "area" IS NULL AND "neighborhood" = 'Legetafo';
