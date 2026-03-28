-- Add location fields for MOTHER and HEALTH_WORKER profiles
ALTER TABLE "public"."User"
ADD COLUMN "country" TEXT,
ADD COLUMN "regionLevel1" TEXT,
ADD COLUMN "regionLevel2" TEXT;

