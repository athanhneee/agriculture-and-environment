# 🌿 Smart Farm Monitoring System - Backend API

> **Dự án Lập trình Web (INT1334)** - Phân hệ Backend API quản lý và giám sát nông trại thông minh.

Dự án này được xây dựng theo kiến trúc **Monorepo** (`apps/backend`), áp dụng chuẩn RESTful API với mô hình **Router - Controller - Service**. Hệ thống tập trung vào tính bảo mật, toàn vẹn dữ liệu và tối ưu hiệu năng truy vấn chuỗi thời gian (Time-series data) cho các thiết bị IoT.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

* **Core:** Node.js, Express.js
* **Ngôn ngữ:** TypeScript (Strict mode)
* **Database & ORM:** PostgreSQL, Prisma ORM (v7.8.0 - Tích hợp cấu hình Edge-ready với `@prisma/adapter-pg`)
* **Security & Auth:** JWT (JSON Web Tokens), Bcrypt.js, Cookie-parser (HttpOnly), Helmet, CORS (Credentials mode)
* **Validation:** Zod
* **Công cụ Dev:** `ts-node-dev`, `dotenv`, ESLint/Prettier

---

## 📂 Cấu trúc thư mục (Folder Structure)

```text
apps/backend/
├── prisma/                 # Cấu hình database và dữ liệu mẫu
│   ├── migrations/         # Lưu lịch sử thay đổi cấu trúc DB
│   ├── schema.prisma       # Định nghĩa các Table, Enum, Index
│   └── seed.ts             # Script đổ dữ liệu mẫu mô phỏng
├── src/
│   ├── config/             # Cấu hình môi trường, DB Singleton, CORS
│   ├── controllers/        # Xử lý request/response, gọi Service
│   ├── middlewares/        # Interceptors (Bắt lỗi tập trung, Xác thực Auth)
│   ├── routes/             # Định nghĩa API endpoints
│   ├── services/           # Chứa logic nghiệp vụ lõi (Business logic)
│   ├── utils/              # Tiện ích dùng chung (ApiResponse, asyncHandler)
│   ├── app.ts              # Khởi tạo và cấu hình Express App
│   └── server.ts           # Điểm neo khởi chạy Server
├── .env.example            # File mẫu chứa các biến môi trường
├── package.json            # Quản lý thư viện và scripts
└── tsconfig.json           # Cấu hình biên dịch TypeScript
```

⚙️ Hướng dẫn Cài đặt & Chạy dự án (Getting Started)

1. Yêu cầu hệ thống (Prerequisites)
    Node.js: v18.x trở lên

    PostgreSQL: Đang chạy local hoặc sử dụng dịch vụ Cloud (Supabase, Neon, v.v.)

2. Cài đặt thư viện
Di chuyển vào thư mục backend và cài đặt các dependencies:

```bash
cd apps/backend
npm install
```
3. Cấu hình Biến môi trường (.env)
Tạo file .env từ file mẫu:

```Bash
cp .env.example .env
```
Mở file .env và cập nhật thông tin chuỗi kết nối Database của bạn vào biến DATABASE_URL.

4. Khởi tạo Cơ sở dữ liệu (Database Setup)
Chạy lần lượt các lệnh sau để khởi tạo type, cấu trúc bảng và nạp dữ liệu giả lập hệ thống:

```Bash
# 1. Sinh mã Prisma Client (Bắt buộc chạy mỗi khi đổi nhánh hoặc pull code mới)
npm run prisma:generate

# 2. Đẩy cấu trúc schema lên PostgreSQL
npx prisma migrate dev --name init_smart_farm_database

# 3. Nạp dữ liệu mẫu (Admin, User, FarmZone, Sensor, Alerts...)
npm run prisma:seed
```
5. Khởi động Server
```Bash
# Chạy ở chế độ Development (Hot-reload)
npm run dev

# Chạy ở chế độ Production (Build & Start)
npm run build
npm run start
```
Server sẽ mặc định chạy tại: http://localhost:5000.
Kiểm tra trạng thái hệ thống qua endpoint: GET http://localhost:5000/api/health