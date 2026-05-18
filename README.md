# Smart Farm Monitoring System

Đồ án cuối kỳ môn **INT1334 - Lập trình Web**.

## Mô tả

Smart Farm Monitoring System là hệ thống Web Fullstack hỗ trợ giám sát nông trại thông minh. Ứng dụng hướng đến quản lý vùng trồng, theo dõi dữ liệu cảm biến môi trường, cảnh báo bất thường, hiển thị bản đồ vùng trồng và cung cấp dashboard realtime cho người quản lý.

## Thành viên nhóm

| MSSV | Họ và tên | Vai trò |
| --- | --- | --- |
| N23DCCN056 | ĐẶNG MINH THÀNH | Thành viên |
| N23DCCN044 | NGÔ MINH PHÁT | Frontend |
| N23DCCN001 | ĐẶNG KIM AN | Backend |

## Công nghệ

- Frontend: Next.js App Router, React, Tailwind CSS, React Hook Form, Zod, Zustand/Context API.
- Backend: Node.js, Express.js, REST API theo mô hình MVC, JWT, Socket.io/SSE.
- Database: PostgreSQL 16, Prisma ORM, migration và seed data.
- Map: Leaflet.js hoặc react-leaflet.
- Testing: Vitest/Jest, Supertest cho backend.
- Local DevOps: Docker Compose cho PostgreSQL.
- Deployment: Vercel cho frontend, Railway/Render cho backend, Supabase/Neon cho database production.
- Workflow: GitHub public, branch `main`, `dev`, `feature/*`, Pull Request review.

## Tính năng chính

- Đăng ký, đăng nhập, JWT refresh token và phân quyền Admin/User.
- Quản lý vùng trồng, cảm biến, bản ghi môi trường và cảnh báo.
- Dashboard theo thời gian thực cho nhiệt độ, độ ẩm, độ ẩm đất và trạng thái vùng trồng.
- Bản đồ vùng trồng với vị trí cảm biến.
- Form nhập liệu có validation bằng React Hook Form và Zod.
- Báo cáo năng suất/cảnh báo và seed data phục vụ demo.

## Cấu trúc thư mục

```text
.
├── apps/
│   ├── frontend/          # Next.js App Router + Tailwind CSS
│   └── backend/           # Express REST API + Prisma + Socket.io
├── docs/
│   ├── report-outline.md
│   └── rubrics-checklist.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Hướng dẫn chạy local từ đầu đến cuối

Yêu cầu môi trường:

- Node.js >= 20
- npm >= 10
- Docker Desktop hoặc Docker Engine có Docker Compose

### Bước 1: Clone repo

```bash
git clone https://github.com/athanhneee/agriculture-and-environment
cd agriculture-and-environment
```

Cài dependencies cho toàn bộ workspace:

```bash
npm install
```

### Bước 2: Copy `.env.example` thành `.env` cho backend/frontend

Root `.env` dùng cho Docker Compose:

```bash
cp .env.example .env
```

Backend `.env` dùng cho Express/Prisma:

```bash
cp .env.example apps/backend/.env
```

Frontend `.env.local` dùng cho Next.js public environment:

```bash
cp .env.example apps/frontend/.env.local
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item .env.example apps/backend/.env
Copy-Item .env.example apps/frontend/.env.local
```

Ghi chú: không commit `.env`, `.env.local` hoặc bất kỳ file môi trường thật nào. `.env.example` chỉ chứa placeholder local, không chứa password/secret production.

### Bước 3: Chạy PostgreSQL bằng Docker Compose

```bash
docker compose up -d
```

Kiểm tra container:

```bash
docker compose ps
```

PostgreSQL local mặc định:

```text
Host: localhost
Port: 5432
Database: smart_farm
User: smart_farm
Password: change_me_local_password
```

### Bước 4: Chạy Prisma migrate dev

```bash
npm run db:migrate
```

Lệnh này chạy `prisma migrate dev`, áp dụng migration trong `apps/backend/prisma/migrations` và cập nhật database local. Khi nhóm đổi schema và cần tạo migration mới, dùng:

```bash
npm run db:migrate -- --name ten_migration
```

### Bước 5: Seed data

```bash
npm run db:seed
```

Dữ liệu demo gồm user mẫu, vùng trồng, cảm biến, sensor readings và cảnh báo. Tài khoản demo chỉ dùng local:

```text
admin@smartfarm.local / Demo@12345
user@smartfarm.local / Demo@12345
```

### Bước 6: Chạy backend và frontend

Terminal 1:

```bash
npm run dev:backend
```

Backend mặc định chạy tại:

```text
http://localhost:4000
http://localhost:4000/api/health
```

Terminal 2:

```bash
npm run dev:frontend
```

Frontend mặc định chạy tại:

```text
http://localhost:3000
```

Build và test:

```bash
npm run build:frontend
npm run build:backend
npm run test:backend
```

Tắt database local khi không dùng:

```bash
docker compose down
```

Nếu muốn xóa luôn dữ liệu local:

```bash
docker compose down -v
```

## Troubleshooting

### Port 5432 bị chiếm

Kiểm tra tiến trình/container đang dùng port:

```bash
docker ps
```

Nếu đã có PostgreSQL local chạy trên máy, đổi port bên trái trong `docker-compose.yml`, ví dụ:

```yaml
ports:
  - "5433:5432"
```

Sau đó cập nhật `DATABASE_URL` trong các file `.env`:

```text
DATABASE_URL=postgresql://smart_farm:change_me_local_password@localhost:5433/smart_farm?schema=public
```

### `DATABASE_URL` sai

Dấu hiệu thường gặp: Prisma báo không kết nối được database hoặc authentication failed.

Kiểm tra các giá trị trong `.env` phải khớp với Docker Compose:

```text
POSTGRES_USER=smart_farm
POSTGRES_PASSWORD=change_me_local_password
POSTGRES_DB=smart_farm
DATABASE_URL=postgresql://smart_farm:change_me_local_password@localhost:5432/smart_farm?schema=public
```

Sau khi sửa, chạy lại:

```bash
docker compose up -d
npm run db:migrate
```

### CORS error

Dấu hiệu thường gặp: frontend gọi API bị chặn bởi browser.

Kiểm tra backend `.env`:

```text
CLIENT_URL=http://localhost:3000
```

Kiểm tra frontend `.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

Sau khi đổi env, restart cả backend và frontend.

### Prisma client chưa generate

Dấu hiệu thường gặp: lỗi `@prisma/client did not initialize yet` hoặc Prisma Client không khớp schema.

Chạy:

```bash
npm run db:generate
```

Nếu vừa đổi schema, chạy lại migration:

```bash
npm run db:migrate
```

## Link GitHub

https://github.com/athanhneee/agriculture-and-environment

## Link Live Demo

TODO: thêm link Vercel/Railway sau khi deploy.

## Quy tắc branch và commit

- `main`: chỉ chứa phiên bản ổn định đã demo/deploy, nên bật branch protection.
- `dev`: nhánh tích hợp chính trong quá trình làm đồ án.
- `feature/<mssv>-<ten-chuc-nang>`: nhánh phát triển tính năng, ví dụ `feature/n23dccn001-auth`.
- `fix/<mo-ta-loi>`: sửa lỗi trong quá trình phát triển.
- `hotfix/<mo-ta-loi>`: sửa lỗi khẩn cấp trên bản đã deploy.
- Mỗi Pull Request merge vào `dev` cần ít nhất 1 thành viên review và approve.
- Commit theo Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `style:`.
- Mỗi commit nên nhỏ, rõ việc, chạy được hoặc có mô tả nếu là commit đang làm dở.
- Không commit `.env`, token, API key, mật khẩu database hoặc secret production.
