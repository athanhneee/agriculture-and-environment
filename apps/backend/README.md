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


🔐 Module Authentication (Xác thực & Phân quyền)1. 
Mục đích của Module AuthModule này đóng vai trò là "người gác cổng" bảo mật cho toàn bộ hệ thống Smart Farm. 
Nó chịu trách nhiệm:
-   Đăng ký & Đăng nhập
-   Quản lý Phiên (Session Management):
-   Phân quyền (RBAC): 
Danh sách API (Routes):

Dưới đây là danh sách các đường dẫn API được cung cấp bởi module Auth, phương thức gọi và yêu cầu xác thực tương ứng:

| Method |       Endpoint       |   Yêu cầu Auth  |                       Chức năng chính                    |
| :----: | :------------------: | :-------------: | :------------------------------------------------------: |
| `POST` | `/api/auth/register` | ❌ Không        | Đăng ký tài khoản mới vào hệ thống                       |
| `POST` | `/api/auth/login`    | ❌ Không        | Đăng nhập, nhận Access Token & gài Cookie Refresh        |
| `POST` | `/api/auth/refresh`  | 🍪 Dùng Cookie  | Dùng Cookie để xin cấp lại Access Token mới              |
| `POST` | `/api/auth/logout`   | 🍪 Dùng Cookie  | Xóa Cookie, thu hồi token dưới DB, hủy phiên làm việc    |
| `GET`  | `/api/auth/me`       | 🔑 Bearer Token | Truy xuất thông tin Profile của tài khoản đang đăng nhập |



📌 Bước 1: Đăng ký tài khoản (Register)
-   Method: POST
-   URL: http://localhost:5000/api/auth/register
-   Body (raw - JSON):JSON
```json
{
  "name": "Kỹ Sư Nông Nghiệp",
  "email": "kysu@smartfarm.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```
Kết quả mong đợi: 
-   Mã 201 Created. 
-   Trả về thông tin user (không chứa mật khẩu).
📌 Bước 2: Đăng nhập (Login)
Method: POST
URL: http://localhost:5000/api/auth/login
Body (raw - JSON):JSON
Example
```json
    {
      "email": "kysu@smartfarm.com",
      "password": "Password123!"
    }
```
** Kết quả mong đợi:
    * Mã 200 OK. 
    *   Trả về chuỗi `accessToken` (Bạn cần copy chuỗi này để dùng cho Bước 3).
    *   *Mẹo Postman:* Mở tab **Cookies** (kế bên Headers) bạn sẽ thấy hệ thống tự động lưu một cookie tên là `refreshToken`.

#### 📌 Bước 3: Lấy profile (Get Me) - Thử nghiệm Protect Route
*   **Method:** `GET`
*   **URL:** `http://localhost:5000/api/auth/me`
*   **Headers:** 
    *   Thêm mới một cột Header.
    *   Key: `Authorization`
    *   Value: `Bearer <dán_chuỗi_accessToken_vừa_copy_vào_đây>` (Chú ý có chữ Bearer và khoảng trắng).
*   **Kết quả mong đợi:** Mã 200 OK. Trả về thông tin user của bạn. Nếu sai token hoặc hết hạn sẽ báo lỗi 401.

#### 📌 Bước 4: Test tự động làm mới Token (Refresh)
*   **Method:** `POST`
*   **URL:** `http://localhost:5000/api/auth/refresh`
*   **Yêu cầu:** Không cần truyền Body, cũng không cần truyền Headers Auth. Trình duyệt/Postman sẽ tự gửi Cookie ngầm.
*   **Kết quả mong đợi:** Mã 200 OK. Hệ thống cấp cho bạn một `accessToken` mới tinh. (Cookie dưới DB cũng tự động được xoay vòng).

#### 📌 Bước 5: Đăng xuất (Logout)
*   **Method:** `POST`
*   **URL:** `http://localhost:5000/api/auth/logout`
*   **Yêu cầu:** Không cần truyền Body, không cần Headers Auth.
*   **Kết quả mong đợi:** Mã 200 OK. Hệ thống thu hồi Refresh Token. Mở lại tab Cookies trong Postman bạn sẽ thấy cookie `refreshToken` đã biến mất.