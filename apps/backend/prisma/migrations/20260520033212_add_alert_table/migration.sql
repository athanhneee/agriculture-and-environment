/*
  Warnings:

  - The values [PENDING] on the enum `AlertStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AlertStatus_new" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');
ALTER TABLE "public"."Alert" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Alert" ALTER COLUMN "status" TYPE "AlertStatus_new" USING ("status"::text::"AlertStatus_new");
ALTER TYPE "AlertStatus" RENAME TO "AlertStatus_old";
ALTER TYPE "AlertStatus_new" RENAME TO "AlertStatus";
DROP TYPE "public"."AlertStatus_old";
ALTER TABLE "Alert" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AlertType" ADD VALUE 'HIGH_TEMPERATURE';
ALTER TYPE "AlertType" ADD VALUE 'LOW_SOIL_MOISTURE';
ALTER TYPE "AlertType" ADD VALUE 'HIGH_HUMIDITY';
ALTER TYPE "AlertType" ADD VALUE 'LOW_LIGHT';
ALTER TYPE "AlertType" ADD VALUE 'PEST_RISK';

-- AlterTable
ALTER TABLE "Alert" ALTER COLUMN "status" SET DEFAULT 'OPEN';
