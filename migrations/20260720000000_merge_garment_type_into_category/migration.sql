-- Create any missing categories from GarmentType data
INSERT INTO "Category" ("name", "slug")
SELECT gt."name", gt."slug"
FROM "GarmentType" gt
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c WHERE c."slug" = gt."slug"
);

-- Add categoryId column to Order
ALTER TABLE "Order" ADD COLUMN "categoryId" INTEGER;

-- Migrate data: set categoryId from garmentTypeId by matching name/slug
UPDATE "Order" o
SET "categoryId" = c."id"
FROM "GarmentType" gt
JOIN "Category" c ON c."slug" = gt."slug"
WHERE o."garmentTypeId" = gt."id";

-- Drop foreign key constraint on garmentTypeId
ALTER TABLE "Order" DROP CONSTRAINT "Order_garmentTypeId_fkey";

-- Drop garmentTypeId column
ALTER TABLE "Order" DROP COLUMN "garmentTypeId";

-- Drop GarmentType table
DROP TABLE "GarmentType";

-- Add foreign key for categoryId
ALTER TABLE "Order" ADD CONSTRAINT "Order_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
