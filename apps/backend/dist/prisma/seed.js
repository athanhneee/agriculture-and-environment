"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Thay vì tạo mới, ta import trực tiếp instance đã được cấu hình pg-adapter + dotenv từ hệ thống!
const prisma_1 = __importDefault(require("../src/config/prisma"));
async function main() {
    console.log('Khởi động quá trình Seeding dữ liệu hệ thống Farm...');
    await prisma_1.default.refreshToken.deleteMany();
    await prisma_1.default.alert.deleteMany();
    await prisma_1.default.sensorReading.deleteMany();
    await prisma_1.default.sensor.deleteMany();
    await prisma_1.default.crop.deleteMany();
    await prisma_1.default.farmZone.deleteMany();
    await prisma_1.default.user.deleteMany();
    // 2. TẠO TÀI KHOẢN USERS (Dùng bcrypt mã hóa password chuẩn bảo mật)
    const salt = await bcryptjs_1.default.genSalt(10);
    const defaultPasswordHash = await bcryptjs_1.default.hash('FarmPassword123', salt);
    const admin = await prisma_1.default.user.create({
        data: {
            name: 'Nguyễn Quản Trị',
            email: 'admin@smartfarm.com',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.ADMIN,
        },
    });
    const farmer1 = await prisma_1.default.user.create({
        data: {
            name: 'Trần Văn Nông',
            email: 'farmer1@gmail.com',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.USER,
        },
    });
    const farmer2 = await prisma_1.default.user.create({
        data: {
            name: 'Lê Thị Diệu',
            email: 'farmer2@gmail.com',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.USER,
        },
    });
    console.log('👤 Đã khởi tạo thành công 1 Admin và 2 Farmers mẫu.');
    // 3. TẠO 4 VÙNG TRỒNG (FARM ZONES) - Giả lập tọa độ thực tế khu vực Củ Chi, TP.HCM
    const zonesData = [
        {
            name: 'Khu Nhà Kính Dưa Lưới A',
            description: 'Hệ thống nhà màng ứng dụng tưới nhỏ giọt công nghệ Israel',
            area: 1200.5,
            latitude: 10.9983, // Tọa độ giả lập Củ Chi, TP.HCM
            longitude: 106.5024,
            soilType: 'Đất cát pha thịt nhẹ',
            status: client_1.ZoneStatus.ACTIVE,
            ownerId: farmer1.id,
        },
        {
            name: 'Khu Trồng Rau Thủy Canh B',
            description: 'Mô hình rau xà lách thủy canh hồi lưu tuần hoàn',
            area: 850.0,
            latitude: 10.9991,
            longitude: 106.5035,
            soilType: 'Giá thể xơ dừa',
            status: client_1.ZoneStatus.ACTIVE,
            ownerId: farmer1.id,
        },
        {
            name: 'Vườn Cây Ăn Trái C',
            description: 'Nông trại cây ăn trái hữu cơ (Xoài cát, Bưởi da xanh)',
            area: 5000.0,
            latitude: 10.9950,
            longitude: 106.5010,
            soilType: 'Đất phù sa cổ',
            status: client_1.ZoneStatus.ACTIVE,
            ownerId: farmer2.id,
        },
        {
            name: 'Khu Thử Nghiệm Thiết Bị D',
            description: 'Vùng đất đang bảo trì cấu trúc cơ sở hạ tầng mạng IoT',
            area: 500.0,
            latitude: 10.9965,
            longitude: 106.5040,
            soilType: 'Đất sét pha trấu',
            status: client_1.ZoneStatus.MAINTENANCE,
            ownerId: farmer2.id,
        },
    ];
    const createdZones = [];
    for (const zone of zonesData) {
        const createdZone = await prisma_1.default.farmZone.create({ data: zone });
        createdZones.push(createdZone);
    }
    console.log('🗺️ Đã cấu hình thành công 4 Vùng trồng công nghệ cao.');
    // 4. SEED CÂY TRỒNG (CROPS) VÀ CẢM BIẾN (SENSORS) CHO TỪNG VÙNG
    let sensorIndex = 1;
    const now = new Date();
    for (let i = 0; i < createdZones.length; i++) {
        const zone = createdZones[i];
        // Tạo Cây Trồng
        let cropName = 'Dưa Lưới Taki';
        let cropVariety = 'Giống Nhật Bản';
        if (i === 1) {
            cropName = 'Xà Lách Romaine';
            cropVariety = 'Thủy canh hữu cơ';
        }
        if (i === 2) {
            cropName = 'Bưởi Da Xanh';
            cropVariety = 'Chiết cành VietGAP';
        }
        if (i === 3) {
            cropName = 'Cà Chùa Bi';
            cropVariety = 'Thử nghiệm nhà màng';
        }
        await prisma_1.default.crop.create({
            data: {
                name: cropName,
                variety: cropVariety,
                plantedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Đã trồng 30 ngày trước
                expectedHarvestDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
                status: client_1.CropStatus.GROWING,
                farmZoneId: zone.id,
            },
        });
        // Tạo các thiết bị cảm biến phần cứng IoT
        const sensorAllInOne = await prisma_1.default.sensor.create({
            data: {
                name: `Trạm Thống Kê IoT Mẫu ${sensorIndex}`,
                code: `ESP32-NODE-0${sensorIndex}`,
                type: client_1.SensorType.ALL_IN_ONE,
                unit: 'Hỗn hợp',
                status: i === 3 ? client_1.SensorStatus.ERROR : client_1.SensorStatus.ACTIVE,
                farmZoneId: zone.id,
            },
        });
        sensorIndex++;
        // 5. SEED DỮ LIỆU ĐO ĐẠC MẪU (SENSOR READINGS) - 2 bản ghi lịch sử cho mỗi vùng
        const reading1 = await prisma_1.default.sensorReading.create({
            data: {
                sensorId: sensorAllInOne.id,
                farmZoneId: zone.id,
                temperature: 31.5,
                airHumidity: 72.0,
                soilMoisture: 45.5,
                lightIntensity: 12000,
                recordedAt: new Date(now.getTime() - 60 * 60 * 1000), // Cách đây 1 tiếng
            },
        });
        // Bản ghi thứ 2 (Có chỉ số vượt ngưỡng để phục vụ bắn Alert mẫu)
        const reading2 = await prisma_1.default.sensorReading.create({
            data: {
                sensorId: sensorAllInOne.id,
                farmZoneId: zone.id,
                temperature: 38.2, // Quá nóng
                airHumidity: 40.1, // Không khí khô hanh
                soilMoisture: 18.5, // Đất bị khô cằn nghiêm trọng
                lightIntensity: 45000,
                recordedAt: now,
            },
        });
        // 6. SEED CẢNH BÁO MẪU (ALERTS) NẾU ĐẤT QUÁ KHÔ HOẶC THIẾT BỊ LỖI
        if (i === 0) {
            await prisma_1.default.alert.create({
                data: {
                    farmZoneId: zone.id,
                    sensorReadingId: reading2.id,
                    type: client_1.AlertType.SOIL_DRY,
                    severity: client_1.AlertSeverity.CRITICAL,
                    title: 'Độ ẩm đất xuống mức nguy hiểm',
                    message: `Hệ thống ghi nhận độ ẩm đất tại khu ${zone.name} chỉ còn 18.5%. Cần kích hoạt béc phun tưới tự động ngay!`,
                    status: client_1.AlertStatus.PENDING,
                },
            });
        }
        if (i === 3) {
            await prisma_1.default.alert.create({
                data: {
                    farmZoneId: zone.id,
                    type: client_1.AlertType.SENSOR_MALFUNCTION,
                    severity: client_1.AlertSeverity.WARNING,
                    title: 'Cảm biến mất tín hiệu (Offline)',
                    message: `Trạm IoT số ${sensorAllInOne.code} ngắt kết nối không dây đột ngột quá 15 phút.`,
                    status: client_1.AlertStatus.ACKNOWLEDGED,
                },
            });
        }
    }
    console.log('📊 Đã nạp thành công bộ chỉ số SensorReadings và Alerts mô phỏng.');
    console.log('✨ Chúc mừng! Quy trình Seeding cơ sở dữ liệu Smart Farm hoàn tất mỹ mãn!');
}
main()
    .catch((e) => {
    console.error(' Lỗi xảy ra trong quá trình seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
