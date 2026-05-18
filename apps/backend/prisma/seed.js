import bcrypt from "bcryptjs";
import { PrismaClient, Role, SensorType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Demo@12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@smartfarm.local" },
    update: {},
    create: {
      email: "admin@smartfarm.local",
      passwordHash,
      fullName: "Smart Farm Admin",
      role: Role.ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: "user@smartfarm.local" },
    update: {},
    create: {
      email: "user@smartfarm.local",
      passwordHash,
      fullName: "Farm Operator",
      role: Role.USER
    }
  });

  const vegetableZone = await prisma.farmZone.upsert({
    where: { id: "demo-zone-vegetable" },
    update: {},
    create: {
      id: "demo-zone-vegetable",
      name: "Khu rau nha kinh A",
      cropType: "Rau thuy canh",
      areaM2: 1200,
      latitude: 10.762622,
      longitude: 106.660172,
      description: "Khu demo cho dashboard cam bien moi truong."
    }
  });

  const fruitZone = await prisma.farmZone.upsert({
    where: { id: "demo-zone-fruit" },
    update: {},
    create: {
      id: "demo-zone-fruit",
      name: "Vuon cay an trai B",
      cropType: "Xoai",
      areaM2: 3500,
      latitude: 10.775,
      longitude: 106.681,
      description: "Khu demo cho ban do vung trong."
    }
  });

  const sensors = [
    {
      code: "SENSOR-TEMP-A1",
      name: "Nhiet do nha kinh A1",
      type: SensorType.TEMPERATURE,
      unit: "celsius",
      minThreshold: 18,
      maxThreshold: 35,
      farmZoneId: vegetableZone.id
    },
    {
      code: "SENSOR-SOIL-A1",
      name: "Do am dat nha kinh A1",
      type: SensorType.SOIL_MOISTURE,
      unit: "percent",
      minThreshold: 45,
      maxThreshold: 85,
      farmZoneId: vegetableZone.id
    },
    {
      code: "SENSOR-HUM-B1",
      name: "Do am vuon B1",
      type: SensorType.HUMIDITY,
      unit: "percent",
      minThreshold: 40,
      maxThreshold: 90,
      farmZoneId: fruitZone.id
    }
  ];

  for (const sensor of sensors) {
    const savedSensor = await prisma.sensor.upsert({
      where: { code: sensor.code },
      update: {},
      create: sensor
    });

    await prisma.sensorReading.createMany({
      data: [
        { id: `${sensor.code}-reading-1`, sensorId: savedSensor.id, value: 27.4 },
        { id: `${sensor.code}-reading-2`, sensorId: savedSensor.id, value: 29.1 },
        { id: `${sensor.code}-reading-3`, sensorId: savedSensor.id, value: 31.2 }
      ],
      skipDuplicates: true
    });
  }

  await prisma.alert.upsert({
    where: { id: "demo-alert-soil-low" },
    update: {},
    create: {
      id: "demo-alert-soil-low",
      title: "Do am dat thap",
      message: "Khu rau nha kinh A can kiem tra he thong tuoi.",
      severity: "warning",
      farmZoneId: vegetableZone.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
