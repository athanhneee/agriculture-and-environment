import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deduplicate() {
  const zones = await prisma.farmZone.findMany({
    orderBy: { createdAt: "asc" }
  });

  const seenNames = new Set<string>();
  const seenLocations = new Set<string>();

  for (const zone of zones) {
    const nameKey = `${zone.ownerId}_${zone.name}`;
    const locKey = `${zone.ownerId}_${zone.latitude}_${zone.longitude}`;

    if (seenNames.has(nameKey) || seenLocations.has(locKey)) {
      console.log(`Deleting duplicate: ${zone.name}`);
      await prisma.farmZone.delete({ where: { id: zone.id } });
    } else {
      seenNames.add(nameKey);
      seenLocations.add(locKey);
    }
  }

  console.log("Deduplication done");
}

deduplicate().then(() => prisma.$disconnect()).catch(console.error);
