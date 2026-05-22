# Tài liệu API - Smart Farm Monitoring System

Tài liệu này dùng cho báo cáo kỹ thuật, kiểm thử Postman và demo checkpoint. Backend hiện đã triển khai nhóm `Auth` và `Health Check`; các nhóm còn lại là đặc tả REST đề xuất dựa trên `apps/backend/prisma/schema.prisma` để thống nhất hướng triển khai.

- Base URL local: `http://localhost:5000`
- Base URL Postman: `{{baseUrl}}`
- Định dạng response chuẩn:

```json
{
  "success": true,
  "message": "Mô tả kết quả",
  "data": {}
}
```

- Quyền truy cập:
  - `Public`: không cần đăng nhập.
  - `Cookie Refresh`: dùng cookie HttpOnly `refreshToken`.
  - `Bearer USER`: cần header `Authorization: Bearer <accessToken>`.
  - `Bearer ADMIN`: chỉ tài khoản có role `ADMIN`.
  - Với role `USER`, dữ liệu farm chỉ nên giới hạn theo `ownerId` của người dùng đăng nhập.

## 1. Auth

### 1.1 Đăng ký tài khoản

- Method: `POST`
- Path: `/api/auth/register`
- Quyền truy cập: `Public`
- Mô tả: Tạo tài khoản người dùng mới, mặc định role `USER`.
- Body mẫu:

```json
{
  "name": "Kỹ Sư Nông Nghiệp",
  "email": "farmer.demo@smartfarm.com",
  "password": "FarmPassword123",
  "confirmPassword": "FarmPassword123"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "id": "user_001",
    "name": "Kỹ Sư Nông Nghiệp",
    "email": "farmer.demo@smartfarm.com",
    "role": "USER",
    "createdAt": "2026-05-22T06:00:00.000Z"
  }
}
```

### 1.2 Đăng nhập

- Method: `POST`
- Path: `/api/auth/login`
- Quyền truy cập: `Public`
- Mô tả: Xác thực email/mật khẩu, trả `accessToken` và set cookie `refreshToken`.
- Body mẫu:

```json
{
  "email": "farmer.demo@smartfarm.com",
  "password": "FarmPassword123"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "user_001",
      "name": "Kỹ Sư Nông Nghiệp",
      "email": "farmer.demo@smartfarm.com",
      "role": "USER",
      "createdAt": "2026-05-22T06:00:00.000Z",
      "updatedAt": "2026-05-22T06:00:00.000Z"
    },
    "accessToken": "ACCESS_TOKEN_MAU_KHONG_DUNG_THAT"
  }
}
```

### 1.3 Lấy thông tin người dùng hiện tại

- Method: `GET`
- Path: `/api/auth/me`
- Quyền truy cập: `Bearer USER`
- Mô tả: Trả thông tin profile của tài khoản đang đăng nhập.
- Header mẫu:

```json
{
  "Authorization": "Bearer {{accessToken}}"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy thông tin thành công",
  "data": {
    "id": "user_001",
    "name": "Kỹ Sư Nông Nghiệp",
    "email": "farmer.demo@smartfarm.com",
    "role": "USER",
    "createdAt": "2026-05-22T06:00:00.000Z"
  }
}
```

### 1.4 Làm mới access token

- Method: `POST`
- Path: `/api/auth/refresh`
- Quyền truy cập: `Cookie Refresh`
- Mô tả: Dùng cookie `refreshToken` để cấp access token mới và xoay vòng refresh token.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Làm mới token thành công",
  "data": {
    "accessToken": "ACCESS_TOKEN_MOI_MAU_KHONG_DUNG_THAT"
  }
}
```

### 1.5 Đăng xuất

- Method: `POST`
- Path: `/api/auth/logout`
- Quyền truy cập: `Cookie Refresh`
- Mô tả: Thu hồi refresh token trong database và xóa cookie phía client.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

## 2. Farm Zones

### 2.1 Danh sách vùng trồng

- Method: `GET`
- Path: `/api/farm-zones`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy danh sách vùng trồng. `ADMIN` xem tất cả, `USER` xem vùng thuộc sở hữu của mình.
- Query mẫu:

```json
{
  "status": "ACTIVE",
  "page": 1,
  "limit": 10,
  "keyword": "nhà kính"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy danh sách vùng trồng thành công",
  "data": {
    "items": [
      {
        "id": "zone_001",
        "name": "Khu Nhà Kính Dưa Lưới A",
        "description": "Hệ thống nhà màng ứng dụng tưới nhỏ giọt",
        "area": 1200.5,
        "latitude": 10.9983,
        "longitude": 106.5024,
        "soilType": "Đất cát pha thịt nhẹ",
        "status": "ACTIVE",
        "ownerId": "user_001",
        "createdAt": "2026-05-22T06:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  }
}
```

### 2.2 Chi tiết vùng trồng

- Method: `GET`
- Path: `/api/farm-zones/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy chi tiết vùng trồng, kèm cây trồng và cảm biến liên quan.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy chi tiết vùng trồng thành công",
  "data": {
    "id": "zone_001",
    "name": "Khu Nhà Kính Dưa Lưới A",
    "area": 1200.5,
    "latitude": 10.9983,
    "longitude": 106.5024,
    "soilType": "Đất cát pha thịt nhẹ",
    "status": "ACTIVE",
    "crops": [
      {
        "id": "crop_001",
        "name": "Dưa Lưới Taki",
        "status": "GROWING"
      }
    ],
    "sensors": [
      {
        "id": "sensor_001",
        "name": "Trạm Thống Kê IoT Mẫu 1",
        "type": "ALL_IN_ONE",
        "status": "ACTIVE"
      }
    ]
  }
}
```

### 2.3 Tạo vùng trồng

- Method: `POST`
- Path: `/api/farm-zones`
- Quyền truy cập: `Bearer USER`
- Mô tả: Tạo vùng trồng mới cho người dùng hiện tại. `ADMIN` có thể truyền `ownerId` khi cần gán cho người khác.
- Body mẫu:

```json
{
  "name": "Khu Nhà Kính Dưa Lưới A",
  "description": "Hệ thống nhà màng ứng dụng tưới nhỏ giọt",
  "area": 1200.5,
  "latitude": 10.9983,
  "longitude": 106.5024,
  "soilType": "Đất cát pha thịt nhẹ",
  "status": "ACTIVE"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Tạo vùng trồng thành công",
  "data": {
    "id": "zone_001",
    "name": "Khu Nhà Kính Dưa Lưới A",
    "area": 1200.5,
    "status": "ACTIVE",
    "ownerId": "user_001",
    "createdAt": "2026-05-22T06:05:00.000Z"
  }
}
```

### 2.4 Cập nhật vùng trồng

- Method: `PATCH`
- Path: `/api/farm-zones/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Cập nhật thông tin vùng trồng thuộc quyền quản lý.
- Body mẫu:

```json
{
  "description": "Đã bổ sung hệ thống tưới tự động",
  "area": 1250,
  "status": "ACTIVE"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Cập nhật vùng trồng thành công",
  "data": {
    "id": "zone_001",
    "name": "Khu Nhà Kính Dưa Lưới A",
    "area": 1250,
    "status": "ACTIVE",
    "updatedAt": "2026-05-22T06:10:00.000Z"
  }
}
```

### 2.5 Xóa vùng trồng

- Method: `DELETE`
- Path: `/api/farm-zones/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Xóa vùng trồng. Các cây trồng, cảm biến, dữ liệu đo và cảnh báo liên quan sẽ bị xóa theo ràng buộc cascade.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Xóa vùng trồng thành công",
  "data": {
    "id": "zone_001"
  }
}
```

## 3. Crops

### 3.1 Danh sách cây trồng

- Method: `GET`
- Path: `/api/crops`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy danh sách cây trồng theo vùng hoặc trạng thái.
- Query mẫu:

```json
{
  "farmZoneId": "zone_001",
  "status": "GROWING",
  "page": 1,
  "limit": 10
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy danh sách cây trồng thành công",
  "data": {
    "items": [
      {
        "id": "crop_001",
        "name": "Dưa Lưới Taki",
        "variety": "Giống Nhật Bản",
        "plantedDate": "2026-04-22T00:00:00.000Z",
        "expectedHarvestDate": "2026-07-06T00:00:00.000Z",
        "status": "GROWING",
        "farmZoneId": "zone_001"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  }
}
```

### 3.2 Chi tiết cây trồng

- Method: `GET`
- Path: `/api/crops/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy chi tiết một cây trồng.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy chi tiết cây trồng thành công",
  "data": {
    "id": "crop_001",
    "name": "Dưa Lưới Taki",
    "variety": "Giống Nhật Bản",
    "plantedDate": "2026-04-22T00:00:00.000Z",
    "expectedHarvestDate": "2026-07-06T00:00:00.000Z",
    "status": "GROWING",
    "farmZone": {
      "id": "zone_001",
      "name": "Khu Nhà Kính Dưa Lưới A"
    }
  }
}
```

### 3.3 Tạo cây trồng

- Method: `POST`
- Path: `/api/crops`
- Quyền truy cập: `Bearer USER`
- Mô tả: Thêm cây trồng mới vào một vùng trồng.
- Body mẫu:

```json
{
  "name": "Dưa Lưới Taki",
  "variety": "Giống Nhật Bản",
  "plantedDate": "2026-04-22T00:00:00.000Z",
  "expectedHarvestDate": "2026-07-06T00:00:00.000Z",
  "status": "PLANTED",
  "farmZoneId": "zone_001"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Tạo cây trồng thành công",
  "data": {
    "id": "crop_001",
    "name": "Dưa Lưới Taki",
    "variety": "Giống Nhật Bản",
    "status": "PLANTED",
    "farmZoneId": "zone_001",
    "createdAt": "2026-05-22T06:15:00.000Z"
  }
}
```

### 3.4 Cập nhật cây trồng

- Method: `PATCH`
- Path: `/api/crops/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Cập nhật trạng thái hoặc thông tin cây trồng.
- Body mẫu:

```json
{
  "status": "GROWING",
  "expectedHarvestDate": "2026-07-10T00:00:00.000Z"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Cập nhật cây trồng thành công",
  "data": {
    "id": "crop_001",
    "name": "Dưa Lưới Taki",
    "status": "GROWING",
    "expectedHarvestDate": "2026-07-10T00:00:00.000Z",
    "updatedAt": "2026-05-22T06:20:00.000Z"
  }
}
```

### 3.5 Xóa cây trồng

- Method: `DELETE`
- Path: `/api/crops/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Xóa cây trồng khỏi vùng trồng.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Xóa cây trồng thành công",
  "data": {
    "id": "crop_001"
  }
}
```

## 4. Sensors

### 4.1 Danh sách cảm biến

- Method: `GET`
- Path: `/api/sensors`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy danh sách cảm biến theo vùng, loại hoặc trạng thái.
- Query mẫu:

```json
{
  "farmZoneId": "zone_001",
  "type": "ALL_IN_ONE",
  "status": "ACTIVE",
  "page": 1,
  "limit": 10
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy danh sách cảm biến thành công",
  "data": {
    "items": [
      {
        "id": "sensor_001",
        "name": "Trạm Thống Kê IoT Mẫu 1",
        "code": "ESP32-NODE-01",
        "type": "ALL_IN_ONE",
        "unit": "Hỗn hợp",
        "status": "ACTIVE",
        "farmZoneId": "zone_001"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  }
}
```

### 4.2 Chi tiết cảm biến

- Method: `GET`
- Path: `/api/sensors/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy chi tiết cảm biến và bản ghi đo mới nhất.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy chi tiết cảm biến thành công",
  "data": {
    "id": "sensor_001",
    "name": "Trạm Thống Kê IoT Mẫu 1",
    "code": "ESP32-NODE-01",
    "type": "ALL_IN_ONE",
    "unit": "Hỗn hợp",
    "status": "ACTIVE",
    "farmZoneId": "zone_001",
    "latestReading": {
      "temperature": 31.5,
      "airHumidity": 72,
      "soilMoisture": 45.5,
      "lightIntensity": 12000,
      "recordedAt": "2026-05-22T06:30:00.000Z"
    }
  }
}
```

### 4.3 Tạo cảm biến

- Method: `POST`
- Path: `/api/sensors`
- Quyền truy cập: `Bearer USER`
- Mô tả: Thêm thiết bị cảm biến vào vùng trồng.
- Body mẫu:

```json
{
  "name": "Trạm Thống Kê IoT Mẫu 1",
  "code": "ESP32-NODE-01",
  "type": "ALL_IN_ONE",
  "unit": "Hỗn hợp",
  "status": "ACTIVE",
  "farmZoneId": "zone_001"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Tạo cảm biến thành công",
  "data": {
    "id": "sensor_001",
    "name": "Trạm Thống Kê IoT Mẫu 1",
    "code": "ESP32-NODE-01",
    "type": "ALL_IN_ONE",
    "unit": "Hỗn hợp",
    "status": "ACTIVE",
    "farmZoneId": "zone_001",
    "createdAt": "2026-05-22T06:25:00.000Z"
  }
}
```

### 4.4 Cập nhật cảm biến

- Method: `PATCH`
- Path: `/api/sensors/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Cập nhật tên, trạng thái hoặc thông tin thiết bị.
- Body mẫu:

```json
{
  "name": "Trạm IoT Nhà Kính A",
  "status": "ACTIVE"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Cập nhật cảm biến thành công",
  "data": {
    "id": "sensor_001",
    "name": "Trạm IoT Nhà Kính A",
    "code": "ESP32-NODE-01",
    "status": "ACTIVE",
    "updatedAt": "2026-05-22T06:35:00.000Z"
  }
}
```

### 4.5 Xóa cảm biến

- Method: `DELETE`
- Path: `/api/sensors/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Xóa cảm biến và các bản ghi đo liên quan.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Xóa cảm biến thành công",
  "data": {
    "id": "sensor_001"
  }
}
```

## 5. Sensor Readings

### 5.1 Danh sách dữ liệu đo

- Method: `GET`
- Path: `/api/sensor-readings`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy lịch sử dữ liệu đo theo vùng, cảm biến và khoảng thời gian.
- Query mẫu:

```json
{
  "farmZoneId": "zone_001",
  "sensorId": "sensor_001",
  "from": "2026-05-22T00:00:00.000Z",
  "to": "2026-05-22T23:59:59.000Z",
  "page": 1,
  "limit": 20
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy dữ liệu cảm biến thành công",
  "data": {
    "items": [
      {
        "id": "reading_001",
        "sensorId": "sensor_001",
        "farmZoneId": "zone_001",
        "temperature": 31.5,
        "airHumidity": 72,
        "soilMoisture": 45.5,
        "lightIntensity": 12000,
        "recordedAt": "2026-05-22T06:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

### 5.2 Ghi nhận dữ liệu đo mới

- Method: `POST`
- Path: `/api/sensor-readings`
- Quyền truy cập: `Bearer USER` hoặc API key thiết bị IoT nếu triển khai thực tế.
- Mô tả: Nhận dữ liệu đo từ cảm biến. Có thể sinh cảnh báo nếu vượt ngưỡng.
- Body mẫu:

```json
{
  "sensorId": "sensor_001",
  "farmZoneId": "zone_001",
  "temperature": 38.2,
  "airHumidity": 40.1,
  "soilMoisture": 18.5,
  "lightIntensity": 45000,
  "recordedAt": "2026-05-22T06:45:00.000Z"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Ghi nhận dữ liệu cảm biến thành công",
  "data": {
    "id": "reading_002",
    "sensorId": "sensor_001",
    "farmZoneId": "zone_001",
    "temperature": 38.2,
    "airHumidity": 40.1,
    "soilMoisture": 18.5,
    "lightIntensity": 45000,
    "recordedAt": "2026-05-22T06:45:00.000Z",
    "generatedAlerts": [
      {
        "id": "alert_001",
        "type": "SOIL_DRY",
        "severity": "CRITICAL",
        "status": "PENDING"
      }
    ]
  }
}
```

### 5.3 Dữ liệu đo mới nhất theo vùng

- Method: `GET`
- Path: `/api/farm-zones/:id/readings/latest`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy bản ghi đo mới nhất của một vùng trồng để hiển thị dashboard realtime/mock realtime.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy dữ liệu mới nhất thành công",
  "data": {
    "id": "reading_002",
    "farmZoneId": "zone_001",
    "sensorId": "sensor_001",
    "temperature": 38.2,
    "airHumidity": 40.1,
    "soilMoisture": 18.5,
    "lightIntensity": 45000,
    "recordedAt": "2026-05-22T06:45:00.000Z"
  }
}
```

## 6. Alerts

### 6.1 Danh sách cảnh báo

- Method: `GET`
- Path: `/api/alerts`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy danh sách cảnh báo theo vùng, trạng thái hoặc mức độ.
- Query mẫu:

```json
{
  "farmZoneId": "zone_001",
  "status": "PENDING",
  "severity": "CRITICAL",
  "page": 1,
  "limit": 10
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy danh sách cảnh báo thành công",
  "data": {
    "items": [
      {
        "id": "alert_001",
        "farmZoneId": "zone_001",
        "sensorReadingId": "reading_002",
        "type": "SOIL_DRY",
        "severity": "CRITICAL",
        "title": "Độ ẩm đất xuống mức nguy hiểm",
        "message": "Độ ẩm đất chỉ còn 18.5%. Cần kích hoạt tưới tự động.",
        "status": "PENDING",
        "createdAt": "2026-05-22T06:45:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  }
}
```

### 6.2 Chi tiết cảnh báo

- Method: `GET`
- Path: `/api/alerts/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Xem chi tiết cảnh báo và dữ liệu đo liên quan.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy chi tiết cảnh báo thành công",
  "data": {
    "id": "alert_001",
    "type": "SOIL_DRY",
    "severity": "CRITICAL",
    "title": "Độ ẩm đất xuống mức nguy hiểm",
    "message": "Độ ẩm đất chỉ còn 18.5%. Cần kích hoạt tưới tự động.",
    "status": "PENDING",
    "farmZone": {
      "id": "zone_001",
      "name": "Khu Nhà Kính Dưa Lưới A"
    },
    "sensorReading": {
      "id": "reading_002",
      "soilMoisture": 18.5,
      "recordedAt": "2026-05-22T06:45:00.000Z"
    }
  }
}
```

### 6.3 Xác nhận đã xem cảnh báo

- Method: `PATCH`
- Path: `/api/alerts/:id/acknowledge`
- Quyền truy cập: `Bearer USER`
- Mô tả: Chuyển trạng thái cảnh báo từ `PENDING` sang `ACKNOWLEDGED`.
- Body/query mẫu: Không có.
- Response mẫu:

```json
{
  "success": true,
  "message": "Xác nhận cảnh báo thành công",
  "data": {
    "id": "alert_001",
    "status": "ACKNOWLEDGED",
    "updatedAt": "2026-05-22T06:50:00.000Z"
  }
}
```

### 6.4 Đánh dấu cảnh báo đã xử lý

- Method: `PATCH`
- Path: `/api/alerts/:id/resolve`
- Quyền truy cập: `Bearer USER`
- Mô tả: Chuyển cảnh báo sang `RESOLVED` và lưu thời điểm xử lý.
- Body mẫu:

```json
{
  "resolutionNote": "Đã kích hoạt bơm tưới tự động trong 15 phút."
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Xử lý cảnh báo thành công",
  "data": {
    "id": "alert_001",
    "status": "RESOLVED",
    "resolvedAt": "2026-05-22T07:00:00.000Z"
  }
}
```

## 7. Statistics

### 7.1 Tổng quan dashboard

- Method: `GET`
- Path: `/api/statistics/overview`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy số liệu tổng quan cho dashboard.
- Query mẫu:

```json
{
  "from": "2026-05-22T00:00:00.000Z",
  "to": "2026-05-22T23:59:59.000Z"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy thống kê tổng quan thành công",
  "data": {
    "totalZones": 4,
    "activeZones": 3,
    "totalSensors": 4,
    "activeSensors": 3,
    "pendingAlerts": 1,
    "criticalAlerts": 1,
    "averages": {
      "temperature": 31.5,
      "airHumidity": 72,
      "soilMoisture": 45.5,
      "lightIntensity": 12000
    }
  }
}
```

### 7.2 Thống kê theo vùng trồng

- Method: `GET`
- Path: `/api/statistics/farm-zones/:id`
- Quyền truy cập: `Bearer USER`
- Mô tả: Lấy thống kê min/max/avg của chỉ số môi trường trong một vùng trồng.
- Query mẫu:

```json
{
  "from": "2026-05-01T00:00:00.000Z",
  "to": "2026-05-22T23:59:59.000Z",
  "groupBy": "day"
}
```

- Response mẫu:

```json
{
  "success": true,
  "message": "Lấy thống kê vùng trồng thành công",
  "data": {
    "farmZoneId": "zone_001",
    "range": {
      "from": "2026-05-01T00:00:00.000Z",
      "to": "2026-05-22T23:59:59.000Z"
    },
    "metrics": {
      "temperature": {
        "min": 24.8,
        "max": 38.2,
        "avg": 31.5
      },
      "soilMoisture": {
        "min": 18.5,
        "max": 68.2,
        "avg": 45.5
      }
    }
  }
}
```

## 8. Exports

### 8.1 Xuất dữ liệu đo cảm biến

- Method: `GET`
- Path: `/api/exports/sensor-readings`
- Quyền truy cập: `Bearer USER`
- Mô tả: Xuất lịch sử dữ liệu đo ra file CSV hoặc JSON.
- Query mẫu:

```json
{
  "farmZoneId": "zone_001",
  "from": "2026-05-01T00:00:00.000Z",
  "to": "2026-05-22T23:59:59.000Z",
  "format": "csv"
}
```

- Response mẫu khi `format=json`:

```json
{
  "success": true,
  "message": "Xuất dữ liệu cảm biến thành công",
  "data": {
    "fileName": "sensor-readings-zone_001-2026-05.csv",
    "downloadUrl": "/api/exports/files/sensor-readings-zone_001-2026-05.csv",
    "expiresAt": "2026-05-22T07:30:00.000Z"
  }
}
```

### 8.2 Xuất danh sách cảnh báo

- Method: `GET`
- Path: `/api/exports/alerts`
- Quyền truy cập: `Bearer USER`
- Mô tả: Xuất danh sách cảnh báo phục vụ báo cáo vận hành.
- Query mẫu:

```json
{
  "status": "PENDING",
  "severity": "CRITICAL",
  "from": "2026-05-01T00:00:00.000Z",
  "to": "2026-05-22T23:59:59.000Z",
  "format": "csv"
}
```

- Response mẫu khi `format=json`:

```json
{
  "success": true,
  "message": "Xuất danh sách cảnh báo thành công",
  "data": {
    "fileName": "alerts-critical-2026-05.csv",
    "downloadUrl": "/api/exports/files/alerts-critical-2026-05.csv",
    "expiresAt": "2026-05-22T07:30:00.000Z"
  }
}
```

## Ghi chú lỗi chuẩn

Khi lỗi xảy ra, API trả cùng cấu trúc nhưng `success=false`.

```json
{
  "success": false,
  "message": "Access Token không hợp lệ hoặc đã hết hạn",
  "errors": null
}
```

## Hướng dẫn import Postman và demo checkpoint

1. Mở Postman, chọn `Import`.
2. Chọn file `postman/smart-farm.postman_collection.json`.
3. Sau khi import, mở collection `Smart Farm Monitoring System`.
4. Kiểm tra collection variables:
   - `baseUrl`: mặc định `http://localhost:5000`.
   - `accessToken`: để trống, request `login` sẽ tự cập nhật sau khi đăng nhập thành công.
5. Chạy backend local:

```bash
cd apps/backend
npm run dev
```

6. Demo API theo thứ tự:
   - Gửi `register` nếu chưa có tài khoản demo.
   - Gửi `login`; Postman sẽ lưu `accessToken` vào collection variable.
   - Gửi `me` để chứng minh route bảo vệ bằng JWT hoạt động.
   - Trình bày các request `create farm zone`, `list farm zones`, `create crop`, `create sensor`, `list readings`, `list alerts`, `statistics overview` theo đặc tả trong collection.

Lưu ý cho checkpoint: tại thời điểm viết tài liệu, backend đã mount nhóm `Auth`; các endpoint nghiệp vụ còn lại là đặc tả REST đề xuất theo Prisma schema. Nếu chưa triển khai route tương ứng, dùng phần này để giải thích thiết kế API/ERD và roadmap hoàn thiện module CRUD.
