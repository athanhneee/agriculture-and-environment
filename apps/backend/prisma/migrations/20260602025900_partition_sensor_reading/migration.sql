-- Step 1: Drop the existing foreign key constraint from "Alert" to "SensorReading"
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_sensorReadingId_fkey";

-- Step 2: Add the new column to "Alert"
ALTER TABLE "Alert" ADD COLUMN "sensorReadingRecordedAt" TIMESTAMP(3);

-- Step 3: Rename the existing "SensorReading" table to "SensorReading_old"
ALTER TABLE "SensorReading" RENAME TO "SensorReading_old";
ALTER TABLE "SensorReading_old" RENAME CONSTRAINT "SensorReading_pkey" TO "SensorReading_old_pkey";
ALTER INDEX IF EXISTS "SensorReading_recordedAt_idx" RENAME TO "SensorReading_old_recordedAt_idx";
ALTER INDEX IF EXISTS "SensorReading_farmZoneId_recordedAt_idx" RENAME TO "SensorReading_old_farmZoneId_recordedAt_idx";

-- Step 4: Create the new "SensorReading" partitioned table
CREATE TABLE "SensorReading" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "farmZoneId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "airHumidity" DOUBLE PRECISION,
    "soilMoisture" DOUBLE PRECISION,
    "lightIntensity" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id", "recordedAt")
) PARTITION BY RANGE ("recordedAt");

-- Create Indexes for the partitioned table
CREATE INDEX "SensorReading_recordedAt_idx" ON "SensorReading"("recordedAt");
CREATE INDEX "SensorReading_farmZoneId_recordedAt_idx" ON "SensorReading"("farmZoneId", "recordedAt");

-- Step 5: Create partitions for 2026
CREATE TABLE "SensorReading_2026_01" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-01-01 00:00:00') TO ('2026-02-01 00:00:00');
CREATE TABLE "SensorReading_2026_02" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-02-01 00:00:00') TO ('2026-03-01 00:00:00');
CREATE TABLE "SensorReading_2026_03" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-03-01 00:00:00') TO ('2026-04-01 00:00:00');
CREATE TABLE "SensorReading_2026_04" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-04-01 00:00:00') TO ('2026-05-01 00:00:00');
CREATE TABLE "SensorReading_2026_05" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-05-01 00:00:00') TO ('2026-06-01 00:00:00');
CREATE TABLE "SensorReading_2026_06" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-06-01 00:00:00') TO ('2026-07-01 00:00:00');
CREATE TABLE "SensorReading_2026_07" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-07-01 00:00:00') TO ('2026-08-01 00:00:00');
CREATE TABLE "SensorReading_2026_08" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-08-01 00:00:00') TO ('2026-09-01 00:00:00');
CREATE TABLE "SensorReading_2026_09" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-09-01 00:00:00') TO ('2026-10-01 00:00:00');
CREATE TABLE "SensorReading_2026_10" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-10-01 00:00:00') TO ('2026-11-01 00:00:00');
CREATE TABLE "SensorReading_2026_11" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-11-01 00:00:00') TO ('2026-12-01 00:00:00');
CREATE TABLE "SensorReading_2026_12" PARTITION OF "SensorReading" FOR VALUES FROM ('2026-12-01 00:00:00') TO ('2027-01-01 00:00:00');

-- Step 6: Insert data from old table into new partitioned table
INSERT INTO "SensorReading" ("id", "sensorId", "farmZoneId", "temperature", "airHumidity", "soilMoisture", "lightIntensity", "recordedAt")
SELECT "id", "sensorId", "farmZoneId", "temperature", "airHumidity", "soilMoisture", "lightIntensity", "recordedAt" FROM "SensorReading_old";

-- Step 7: Update Alert table sensorReadingRecordedAt based on the old table data
UPDATE "Alert" a
SET "sensorReadingRecordedAt" = s."recordedAt"
FROM "SensorReading_old" s
WHERE a."sensorReadingId" = s."id";

-- Step 8: Add the new foreign key constraint from "Alert" to "SensorReading"
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_sensorReadingId_sensorReadingRecordedAt_fkey" FOREIGN KEY ("sensorReadingId", "sensorReadingRecordedAt") REFERENCES "SensorReading"("id", "recordedAt") ON DELETE SET NULL ON UPDATE CASCADE;

-- Also add foreign key constraints for the new "SensorReading" table
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_farmZoneId_fkey" FOREIGN KEY ("farmZoneId") REFERENCES "FarmZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Drop the old table
DROP TABLE "SensorReading_old";
