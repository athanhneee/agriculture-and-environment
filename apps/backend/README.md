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

---

## 🌿 Module Core (Farm Zones, Crops, Sensors)

Hệ thống cung cấp 3 module lõi để quản lý nông trại:

1. **Farm Zones (Vùng canh tác):** Quản lý thông tin vùng đất (diện tích, tọa độ, loại đất).
2. **Crops (Cây trồng):** Quản lý danh sách các loại cây trồng được gieo trồng trên từng vùng canh tác.
3. **Sensors (Cảm biến):** Quản lý thiết bị IoT giám sát chỉ số (Nhiệt độ, Độ ẩm, Ánh sáng, Độ ẩm đất) được lắp đặt tại các vùng.

Tất cả các API này đều yêu cầu **Authentication (Bearer Token)** lấy từ quá trình đăng nhập.

### 📍 Danh sách API (Routes)

#### 1. API FarmZones (`/api/farm-zones`)

| Method | Endpoint | Yêu cầu Auth | Chức năng chính |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/farm-zones` | 🔑 Token | Lấy danh sách vùng canh tác (Hỗ trợ phân trang, lọc theo status, search) |
| `GET` | `/api/farm-zones/:id` | 🔑 Token | Xem chi tiết vùng canh tác (Kèm danh sách crops, sensors, alerts) |
| `POST` | `/api/farm-zones` | 🔑 Token | Tạo vùng canh tác mới |
| `PATCH` | `/api/farm-zones/:id` | 🔑 Token | Cập nhật thông tin vùng canh tác (Chỉ Owner/Admin) |
| `DELETE`| `/api/farm-zones/:id` | 🔑 Token | Xóa vùng canh tác (Cascade xóa crops, sensors) |

#### 2. API Crops (`/api/crops`)

| Method | Endpoint | Yêu cầu Auth | Chức năng chính |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/crops` | 🔑 Token | Lấy danh sách cây trồng (Lọc theo `farmZoneId`, `status`) |
| `GET` | `/api/crops/:id` | 🔑 Token | Xem chi tiết cây trồng |
| `POST` | `/api/crops` | 🔑 Token | Tạo cây trồng mới vào vùng canh tác |
| `PATCH` | `/api/crops/:id` | 🔑 Token | Cập nhật thông tin (ngày thu hoạch, trạng thái) |
| `DELETE`| `/api/crops/:id` | 🔑 Token | Xóa cây trồng |

#### 3. API Sensors (`/api/sensors`)

| Method | Endpoint | Yêu cầu Auth | Chức năng chính |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/sensors` | 🔑 Token | Lấy danh sách cảm biến (Lọc theo `farmZoneId`, `type`, `status`) |
| `GET` | `/api/sensors/:id` | 🔑 Token | Xem chi tiết cảm biến |
| `POST` | `/api/sensors` | 🔑 Token | Tạo cảm biến mới (Yêu cầu `code` duy nhất) |
| `PATCH` | `/api/sensors/:id` | 🔑 Token | Cập nhật thông tin thiết bị cảm biến |
| `DELETE`| `/api/sensors/:id` | 🔑 Token | Xóa cảm biến |

---

### 🧪 Hướng dẫn Test API (Postman)

Để test các API này, bạn **BẮT BUỘC** phải gắn Bearer Token vào header.

#### 📌 Bước 1: Gắn Authorization Header
1. Đăng nhập qua `/api/auth/login` để lấy `accessToken`.
2. Mở tab **Authorization** trong Postman.
3. Chọn type là **Bearer Token**.
4. Dán `accessToken` vào ô Token.

#### 📌 Bước 2: Test API Tạo Vùng Canh Tác (Create FarmZone)
*   **Method:** `POST`
*   **URL:** `http://localhost:5000/api/farm-zones`
*   **Body (raw - JSON):**
```json
{
  "name": "Khu Cà Chua Dưa Lưới",
  "area": 500,
  "latitude": 10.762622,
  "longitude": 106.660172,
  "soilType": "Đất phù sa"
}
```
*   **Kết quả:** Mã 201 Created. Trả về thông tin vùng canh tác mới kèm `id`. Copy `id` này.

#### 📌 Bước 3: Test API Tạo Cây Trồng (Create Crop)
*   **Method:** `POST`
*   **URL:** `http://localhost:5000/api/crops`
*   **Body (raw - JSON):**
```json
{
  "name": "Cà chua Cherry",
  "variety": "Giống ngoại nhập",
  "plantedDate": "2024-05-01T00:00:00Z",
  "farmZoneId": "<dán_id_farm_zone_từ_bước_2>"
}
```
*   **Kết quả:** Mã 201 Created. `expectedHarvestDate` tự động null nếu không điền.

#### 📌 Bước 4: Test API Tạo Cảm Biến (Create Sensor)
*   **Method:** `POST`
*   **URL:** `http://localhost:5000/api/sensors`
*   **Body (raw - JSON):**
```json
{
  "name": "Cảm biến Nhiệt Ẩm 01",
  "code": "DHT22-ZONE1-01",
  "type": "TEMPERATURE",
  "unit": "°C",
  "farmZoneId": "<dán_id_farm_zone_từ_bước_2>"
}
```
*   **Kết quả:** Mã 201 Created. Thử POST lại cùng `code` sẽ nhận lỗi 400 (Mã cảm biến đã tồn tại).

#### 📌 Bước 5: Test API Cập Nhật (PATCH)
*   **Method:** `PATCH`
*   **Cập nhật FarmZone:** `PATCH http://localhost:5000/api/farm-zones/<id>`
*   **Cập nhật Cây Trồng (Crop):** `PATCH http://localhost:5000/api/crops/<id>`
```json
{
  "status": "HARVESTED"
}
```
*   **Cập nhật Cảm Biến (Sensor):** `PATCH http://localhost:5000/api/sensors/<id>`
```json
{
  "status": "MAINTENANCE"
}
```
*   **Kết quả:** Mã 200 OK, trả về thông tin đã được cập nhật.

#### 📌 Bước 6: Test API Lấy Danh Sách (GET List)
*   **Method:** `GET`
*   **FarmZone:** `GET http://localhost:5000/api/farm-zones?page=1&limit=5&search=Cà Chua`
*   **Crops:** `GET http://localhost:5000/api/crops?farmZoneId=<dán_id_farm_zone>`
*   **Sensors:** `GET http://localhost:5000/api/sensors?type=TEMPERATURE&status=ACTIVE`
*   **Kết quả:** Mã 200 OK. Trả về mảng dữ liệu hoặc cấu trúc phân trang (đối với FarmZone):
```json
{
  "success": true,
  "message": "Lấy danh sách vùng canh tác thành công",
  "data": [...],
  "metadata": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

#### 📌 Bước 7: Test API Xem Chi Tiết (GET Detail)
*   **Method:** `GET`
*   **FarmZone:** `GET http://localhost:5000/api/farm-zones/<id>` (Bên trong `data` trả về sẽ chứa thêm mảng `crops` và `sensors`)
*   **Crop:** `GET http://localhost:5000/api/crops/<id>`
*   **Sensor:** `GET http://localhost:5000/api/sensors/<id>`
*   **Kết quả:** Mã 200 OK. Trả về thông tin chi tiết của đối tượng.

#### 📌 Bước 8: Test API Xóa (DELETE)
*   **Method:** `DELETE`
*   **Xóa Crop:** `DELETE http://localhost:5000/api/crops/<id>`
*   **Xóa Sensor:** `DELETE http://localhost:5000/api/sensors/<id>`
*   **Xóa FarmZone:** `DELETE http://localhost:5000/api/farm-zones/<id>`
*   **Kết quả:** Mã 200 OK. Lưu ý: Xóa FarmZone sẽ tự động xóa sạch (Cascade Delete) toàn bộ `crops` và `sensors` thuộc về Zone đó.

---

## 📡 Module Sensor Readings & Socket.io

Hệ thống cung cấp cơ chế thu thập dữ liệu cảm biến thời gian thực và tự động sinh dữ liệu giả lập để kiểm thử.

### 📍 Danh sách API Sensor Readings (`/api/sensor-readings`)

| Method | Endpoint | Yêu cầu Auth | Chức năng chính |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/sensor-readings` | 🔑 Token | Lấy lịch sử cảm biến (Lọc theo `farmZoneId`, `sensorId`, `from`, `to`, phân trang) |
| `GET` | `/api/sensor-readings/latest` | 🔑 Token | Lấy reading mới nhất của mỗi vùng canh tác |
| `POST` | `/api/sensor-readings` | 🔑 Token | Tạo dữ liệu cảm biến thủ công |
| `DELETE`| `/api/sensor-readings/:id` | 🔑 Token (ADMIN) | Xóa lịch sử cảm biến |

### 🧪 Hướng dẫn Test Realtime bằng Socket.io

Backend sẽ tự động sinh dữ liệu cảm biến mỗi 5 giây (hoặc theo cấu hình `SENSOR_MOCK_INTERVAL_MS` trong file `.env`) nếu biến `SENSOR_MOCK_ENABLED=true`.

Bạn có thể test bằng client Socket.io (ví dụ: Postman v11+ hỗ trợ Socket.io, Hoppscotch, hoặc script JS đơn giản):

1. **Kết nối Socket:** 
   - URL: `http://localhost:5000`

2. **Lắng nghe sự kiện Global (Tất cả nông trại):**
   - Lắng nghe event: `sensor:global-reading`
   - Data nhận về: `{ farmZoneId, reading: { ... }, timestamp }`

3. **Tham gia Room theo FarmZone (Chỉ nghe dữ liệu của 1 vùng):**
   - Emit event: `join-room` với data là chuỗi `farmZoneId` (VD: `d2b453e1-3f...`)
   - Sau đó lắng nghe event: `sensor:reading-created`
   - Khi không muốn nghe nữa, emit event: `leave-room` với data là chuỗi `farmZoneId`

---

## 🚨 Module Cảnh báo (Alerts)

Hệ thống cung cấp cơ chế đánh giá tự động dựa trên các chỉ số môi trường (nhiệt độ, độ ẩm, độ ẩm đất, ánh sáng) từ các cảm biến. Khi phát hiện chỉ số bất thường hoặc nguy cơ dịch bệnh, hệ thống tự động sinh ra cảnh báo.

### 📍 Danh sách API Cảnh báo (`/api/alerts`)

| Method | Endpoint | Yêu cầu Auth | Chức năng chính |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/alerts` | 🔑 Token | Lấy danh sách cảnh báo (Lọc theo `farmZoneId`, `status`, `severity`, `type`, phân trang) |
| `GET` | `/api/alerts/:id` | 🔑 Token | Lấy chi tiết một cảnh báo |
| `PATCH` | `/api/alerts/:id/acknowledge`| 🔑 Token | Xác nhận đã xem cảnh báo (Đổi trạng thái thành `ACKNOWLEDGED`) |
| `PATCH` | `/api/alerts/:id/resolve` | 🔑 Token | Đánh dấu đã xử lý xong cảnh báo (Đổi trạng thái thành `RESOLVED`) |
| `DELETE`| `/api/alerts/:id` | 🔑 Token (ADMIN) | Xóa cảnh báo |

### 📋 Luật cảnh báo (Rules)

1. **`HIGH_TEMPERATURE`**: Nhiệt độ > 35°C (WARNING), > 40°C (CRITICAL)
2. **`LOW_SOIL_MOISTURE`**: Độ ẩm đất < 30% (WARNING), < 20% (CRITICAL)
3. **`HIGH_HUMIDITY`**: Độ ẩm không khí > 85% (WARNING)
4. **`LOW_LIGHT`**: Ánh sáng < 3000 Lux (WARNING)
5. **`PEST_RISK`**: Cảnh báo nguy cơ sâu bệnh khi nhiệt độ > 28°C VÀ độ ẩm > 80% (WARNING)

### 🧪 Hướng dẫn Demo Cảnh báo Tự động

Module Alert tích hợp trực tiếp với Mock Job của hệ thống để đánh giá ngay lập tức:

1. **Khởi động server**: Đảm bảo `SENSOR_MOCK_ENABLED=true`.
2. **Lắng nghe Socket.io**: 
   - Connect client tới URL: `http://localhost:5000`
   - Lắng nghe event `alert:created`.
   - Lắng nghe event `alert:global` (nếu có dashboard tổng quát).
3. **Cơ chế chống Spam**:
   - Nếu một cảnh báo (cùng Vùng, cùng Loại) đang ở trạng thái `OPEN` trong vòng 15 phút qua, hệ thống sẽ **bỏ qua** không sinh thêm cảnh báo mới để tránh làm phiền người dùng.
4. **Quản lý Cảnh báo (Postman)**:
   - Sau khi nhận được thông báo từ Socket, hãy copy ID của Alert.
   - Gọi API `PATCH /api/alerts/<id>/acknowledge` để xác nhận.
   - Khi đã xử lý xong ngoài đời thực (VD: bật máy bơm), gọi API `PATCH /api/alerts/<id>/resolve`. Lịch sử sẽ ghi nhận `resolvedAt`.