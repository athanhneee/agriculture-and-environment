/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,name]` on the table `FarmZone` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,latitude,longitude]` on the table `FarmZone` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "FarmZone_ownerId_name_key" ON "FarmZone"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FarmZone_ownerId_latitude_longitude_key" ON "FarmZone"("ownerId", "latitude", "longitude");
