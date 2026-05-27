import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Đang tìm và sửa các bản ghi FarmZone trùng lặp...');
  
  const farmZones = await prisma.farmZone.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const seen = new Set();
  const seenLatLon = new Set();
  let fixedCount = 0;
  
  for (const zone of farmZones) {
    const nameKey = `${zone.ownerId}_${zone.name}`;
    const locKey = `${zone.ownerId}_${zone.latitude}_${zone.longitude}`;
    
    let needsUpdate = false;
    let newName = zone.name;
    let newLat = zone.latitude;
    let newLon = zone.longitude;

    if (seen.has(nameKey)) {
      newName = `${zone.name} (Copy ${zone.id.slice(0, 4)})`;
      needsUpdate = true;
    }
    
    if (seenLatLon.has(locKey)) {
      newLat = zone.latitude + 0.0001 + (Math.random() * 0.001);
      newLon = zone.longitude + 0.0001 + (Math.random() * 0.001);
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`Đã sửa vùng trùng lặp: ${zone.name} -> ${newName}`);
      await prisma.farmZone.update({
        where: { id: zone.id },
        data: { name: newName, latitude: newLat, longitude: newLon },
      });
      fixedCount++;
    }

    seen.add(`${zone.ownerId}_${newName}`);
    seenLatLon.add(`${zone.ownerId}_${newLat}_${newLon}`);
  }
  
  console.log(`Hoàn tất. Đã sửa ${fixedCount} bản ghi bị trùng lặp.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
