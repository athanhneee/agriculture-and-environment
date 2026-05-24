# 🌿 Smart Farm Monitoring System - Backend API

> **Dự án Lập trình Web (INT1334)** - Phân hệ Backend API quản lý và giám sát nông trại thông minh.

Dự án này được xây dựng theo kiến trúc **Monorepo** (`apps/backend`), áp dụng chuẩn RESTful API với mô hình **Router - Controller - Service**. Hệ thống tập trung vào tính bảo mật, toàn vẹn dữ liệu, kiểm thử và tài liệu rõ ràng.

## 🚀 Công nghệ sử dụng (Tech Stack)

* **Core:** Node.js, Express.js
* **Ngôn ngữ:** TypeScript (Strict mode)
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Security & Auth:** JWT, Bcrypt.js, Helmet, CORS
* **Testing:** Jest, Supertest
* **Tài liệu API:** Swagger (OpenAPI 3.0)

---

## ⚙️ Hướng dẫn Cài đặt & Chạy dự án (Setup Local)

### 1. Yêu cầu hệ thống
- Node.js: v18.x trở lên
- PostgreSQL (hoặc Supabase, Neon)

### 2. Biến môi trường (Env Variables)
Hãy copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Cập nhật `DATABASE_URL` trỏ tới cơ sở dữ liệu PostgreSQL của bạn. (Lưu ý: Không commit `.env` chứa mật khẩu thực tế lên GitHub).

### 3. Cài đặt thư viện
Di chuyển vào thư mục backend và cài đặt dependencies:
```bash
cd apps/backend
npm install
```

### 4. Prisma Migrate và Seed
Khởi tạo cấu trúc bảng và đổ dữ liệu mẫu:
```bash
# Sinh mã Prisma Client
npm run prisma:generate

# Đẩy cấu trúc schema lên Database
npx prisma migrate dev --name init

# Nạp dữ liệu giả lập (Mock data)
npm run prisma:seed
```

**Các tài khoản giả lập (Seed Accounts) để test API:**
1. **Admin**: `admin@smartfarm.com` / `FarmPassword123`
2. **Nông dân 1**: `farmer1@gmail.com` / `FarmPassword123`
3. **Nông dân 2**: `farmer2@gmail.com` / `FarmPassword123`

### 5. Chạy môi trường Dev (Run Dev)
```bash
npm run dev
```
Server sẽ mặc định chạy tại `http://localhost:5000`.

---

## 🧪 Kiểm thử (Run Tests)

Dự án đã được thiết lập Jest và Supertest. Để chạy các test case:
```bash
npm run test
```

Các Test Case hiện có:
- `auth.test.ts`: Register validation, login success, protected route check.
- `farm.test.ts`: Farm zone validation fail.
- `alertRules.test.ts`: Đánh giá logic sinh cảnh báo HIGH_TEMPERATURE và LOW_SOIL_MOISTURE.

---

## 📖 Tài liệu API (Swagger & Postman)

- **Swagger UI**: Truy cập `http://localhost:5000/api/docs` khi server đang chạy để xem và test API trực quan.
- **Postman Collection**: Nằm tại `postman/smart-farm.postman_collection.json` ở thư mục gốc của repo. Import file này vào Postman để sử dụng.

---

## 🚀 Triển khai (Deploy Render/Railway)

1. Đăng nhập vào Render / Railway.
2. Tạo Web Service mới kết nối từ GitHub repo.
3. Thiết lập **Root Directory**: `apps/backend`.
4. Thiết lập **Build Command**: `npm install && npm run prisma:generate && npm run build`
5. Thiết lập **Start Command**: `npm run start`
6. Thêm các **Environment Variables**:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `PORT` (nếu cần)
7. Đợi quá trình build và deploy hoàn tất.

---

## ✅ Checklist hoàn thiện Backend (Rubric BE1-BE4)

- [x] (BE1) Khởi tạo dự án Express + TypeScript, tổ chức thư mục Router-Controller-Service.
- [x] (BE2) Cấu hình Prisma và PostgreSQL, chạy migrate và seed thành công.
- [x] (BE3) Đầy đủ tính năng CRUD và Logic (Auth, Farm, Sensors, Alerts, Statistics, Exports).
- [x] (BE4) Cấu hình Jest + Supertest, có ít nhất 5 test cases chạy xanh (100% pass).
- [x] Tích hợp Swagger Documentation (`/api/docs`).
- [x] Thêm Postman Collection.
- [x] README hoàn chỉnh các bước setup và deploy.
- [x] KHÔNG lưu trữ secret thật trong GitHub repo (`.env` đã bị gitignore, chỉ có `.env.example`).
- [x] Lệnh `npm run build` chạy thành công không có lỗi TypeScript.