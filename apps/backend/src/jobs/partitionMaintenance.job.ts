import prisma from '../config/prisma';

let maintenanceInterval: NodeJS.Timeout | null = null;

export const autoCreateNextMonthPartition = async () => {
  try {
    // 1. Tính toán tháng hiện tại và tháng tiếp theo
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const year = nextMonth.getFullYear();
    const month = (nextMonth.getMonth() + 1).toString().padStart(2, '0');
    
    // Tên phân vùng dạng: SensorReading_2026_06
    const partitionName = `SensorReading_${year}_${month}`;
    
    // Ngày bắt đầu: Mùng 1 tháng tiếp theo
    const startDate = `${year}-${month}-01 00:00:00`;
    
    // 2. Tính toán ngày kết thúc (Mùng 1 của tháng tiếp theo nữa)
    const endMonth = new Date(nextMonth);
    endMonth.setMonth(endMonth.getMonth() + 1);
    
    const endYear = endMonth.getFullYear();
    const endMonthStr = (endMonth.getMonth() + 1).toString().padStart(2, '0');
    const endDate = `${endYear}-${endMonthStr}-01 00:00:00`;

    // 3. Tự động sinh SQL tạo Partition mới (Nếu chưa tồn tại)
    const sql = `CREATE TABLE IF NOT EXISTS "${partitionName}" PARTITION OF "SensorReading" FOR VALUES FROM ('${startDate}') TO ('${endDate}');`;

    await prisma.$executeRawUnsafe(sql);
    console.log(`[Auto Partition] Checked/Created partition for next month: ${partitionName}`);
  } catch (error) {
    console.error('❌ Error creating auto partition:', error);
  }
};

export const startPartitionMaintenanceJob = () => {
  console.log(' Starting Partition Maintenance Job (Runs every 24h)');
  
  // Chạy ngay lúc server start để chắc chắn partition đã tồn tại
  autoCreateNextMonthPartition();

  // Chạy lặp lại mỗi 24 tiếng (24 * 60 * 60 * 1000)
  maintenanceInterval = setInterval(autoCreateNextMonthPartition, 24 * 60 * 60 * 1000);
};

export const stopPartitionMaintenanceJob = () => {
  if (maintenanceInterval) {
    clearInterval(maintenanceInterval);
    console.log(' Partition Maintenance Job stopped.');
  }
};
