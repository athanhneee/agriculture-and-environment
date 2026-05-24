# Smart Farm Monitoring System - Integration Checklist

Tai lieu dung cho nhom kiem thu truoc khi bao ve. Muc tieu la xac nhan frontend ket noi backend on dinh, dung cookie credentials, dung format response, realtime Socket.io va cac luong nghiep vu chinh.

## Cau hinh bat buoc

| Hang muc | Gia tri can co | Cach kiem tra | Expected result |
| --- | --- | --- | --- |
| Frontend API URL | `apps/frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000` | Restart frontend sau khi sua `.env.local`, mo DevTools Network | Request goi ve `http://localhost:5000/api/...` |
| Frontend Socket URL | `apps/frontend/.env.local`: `NEXT_PUBLIC_SOCKET_URL=http://localhost:5000` | Mo `/dashboard`, xem panel realtime va Network WS | Socket ket noi toi backend port `5000` |
| Backend CORS | `apps/backend/.env`: `CLIENT_URL=http://localhost:3000` | Goi login tu frontend | Response co CORS hop le, khong bi browser block |
| Cookie refresh token | Backend set cookie `refreshToken` voi `httpOnly`, frontend fetch `credentials: "include"` | Login thanh cong, xem Application > Cookies | Co cookie `refreshToken`; request refresh gui kem cookie |
| API response format | JSON API tra `{ success, message, data?, errors? }` | Test cac endpoint CRUD | Frontend doc duoc `body.success`, loi hien thi tu `body.message` |
| 401 handling | `apiRequest` gap 401 se goi `/api/auth/refresh`, refresh fail thi `clearAuth()` | Xoa/sua access token trong localStorage, giu refresh cookie | Request duoc retry voi access token moi; neu refresh fail thi logout |
| Socket.io connection | Backend `initSocket` cho phep `CLIENT_URL`, frontend dung `socket.io-client` | Mo dashboard khi backend dang chay | Panel hien `Socket connected` |
| Sensor realtime | Dashboard lang nghe `sensor:reading-created` va `sensor:global-reading` | Bat `SENSOR_MOCK_ENABLED=true`, co farm zone va sensor active | So event tang, chi so reading cap nhat |
| Alert realtime | Dashboard lang nghe `alert:created` va `alert:global` | Tao reading vuot nguong hoac cho mock tao alert | Panel realtime alerts hien alert moi |
| Map farm zones | `/dashboard/map` fetch `/api/farm-zones` | Login, mo Map | Danh sach/marker lay theo farm zones backend; fallback mock neu API rong/lui |
| Export Excel | Nut Export trong `/dashboard/sensors` goi `/api/exports/*.xlsx` | Bam Readings hoac Alerts | Browser tai file `.xlsx`; neu token het han thi refresh roi tai lai |

## Bang test luong chinh

| Luong can test | Buoc test de xuat | Expected result |
| --- | --- | --- |
| Register | Mo `/auth/register`, nhap ten/email/password hop le, submit | Backend tao user, frontend chuyen ve login voi thong bao dang ky thanh cong |
| Login | Mo `/auth/login`, dang nhap bang tai khoan da seed/dang ky | Nhan `accessToken`, cookie `refreshToken`, vao `/dashboard` |
| CRUD vung trong | Vao `/dashboard/zones`, tao vung moi; neu co UI update/delete thi thuc hien tiep; neu chua co UI thi test bang Postman | GET/POST/PATCH/DELETE `/api/farm-zones` tra format thong nhat; danh sach frontend cap nhat sau tao |
| CRUD cay trong | Test `/api/crops` bang Postman hoac UI tuong ung neu da co | Tao/sua/xoa crop thanh cong, crop gan dung farm zone, loi validation tra `success:false` |
| CRUD cam bien | Test `/api/sensors` bang Postman hoac UI tuong ung neu da co | Sensor duoc tao voi farm zone hop le, filter/list hoat dong, sensor active duoc mock job su dung |
| Mock sensor realtime | Dat `SENSOR_MOCK_ENABLED=true`, `SENSOR_MOCK_INTERVAL_MS=5000`, dam bao co farm zone/sensor active, mo `/dashboard` | Moi chu ky backend tao reading va emit socket; dashboard nhan event realtime |
| Alert realtime | Tao reading vuot nguong hoac cho mock sinh gia tri bat thuong | Backend tao alert OPEN, emit `alert:created`/`alert:global`, dashboard hien alert moi |
| History filter | Goi `/api/sensor-readings?farmZoneId=...&from=...&to=...` | Data chi nam trong khoang loc; pagination/meta neu endpoint co tra |
| Export Excel | Dang nhap, bam Export Readings/Alerts o `/dashboard/sensors` | File `readings.xlsx`/`alerts.xlsx` tai ve, dung content-type Excel |
| Map | Dang nhap, mo `/dashboard/map` | Map doc duoc farm zones tu backend, hien ten/crop/status; khong con chi phu thuoc mock data |
| Statistics | Goi `/api/statistics/...` theo swagger/Postman | So lieu tong hop dung voi data seed/mock, filter theo role/user neu co |

## Loi thuong gap va cach xu ly

| Loi | Nguyen nhan thuong gap | Cach xu ly |
| --- | --- | --- |
| CORS error tren browser | `CLIENT_URL` backend khac origin frontend, hoac chua restart backend sau khi sua `.env` | Dat `CLIENT_URL=http://localhost:3000`, restart backend |
| Login thanh cong nhung refresh fail | Fetch khong co `credentials: "include"`, cookie bi chan boi domain/sameSite/secure | Dung frontend qua `http://localhost:3000`, backend dev `secure:false`, giu `credentials: "include"` |
| Request bi 401 lien tuc | Access token het han va refresh cookie khong ton tai/da bi revoke | Logout/login lai; xoa cookie cu neu bi lech moi truong |
| Socket offline | Backend chua chay, sai `NEXT_PUBLIC_SOCKET_URL`, CORS socket khong khop `CLIENT_URL` | Kiem tra `.env.local`, `.env`, restart ca hai server |
| Dashboard khong nhan reading | Chua co farm zone ACTIVE hoac sensor ACTIVE, mock job chua bat | Seed data, bat `SENSOR_MOCK_ENABLED=true`, xem log backend co "Starting Sensor Mock Job" |
| Dashboard khong nhan alert | Reading chua vuot nguong hoac bi spam-window 15 phut | Tao reading vuot nguong ro rang, doi qua cua so 15 phut hoac test voi loai alert khac |
| Map khong co zone | Chua login, token server cookie mat, database rong | Login lai, tao farm zone, kiem tra `/api/farm-zones` bang Postman |
| Export Excel tai file loi/JSON | Goi endpoint Excel bang parser JSON, thieu Authorization, token het han | Dung nut Export frontend hoac Postman Send and Download; xac nhan access token/refresh token |
| Backend build loi Prisma Client | Prisma Client cu/le schema | Chay `npm install` neu thieu package, sau do `npm run prisma:generate` va `npm run build` |
| Frontend build canh bao workspace root | Repo co nhieu `package-lock.json` | Khong chan demo; co the cau hinh `turbopack.root` sau neu can don dep |

## Checklist demo 5 phut - Sprint 1

| Thoi luong | Noi dung demo | Dau hieu thanh cong |
| --- | --- | --- |
| 0:00-0:45 | Gioi thieu kien truc frontend Next.js, backend Express, Prisma, PostgreSQL | Neu duoc API base URL va CORS/cookie flow |
| 0:45-1:45 | Register va Login | User vao dashboard, co access token va refresh cookie |
| 1:45-2:45 | CRUD vung trong | Tao vung trong moi, danh sach zones cap nhat |
| 2:45-3:30 | CRUD cay trong/cam bien qua UI hoac Postman | Data duoc gan dung farm zone |
| 3:30-4:20 | Map doc farm zones | Map hien zone tu backend |
| 4:20-5:00 | API response/error handling | Demo validation error hoac 401 refresh/logout |

## Checklist demo 5 phut - Sprint 2

| Thoi luong | Noi dung demo | Dau hieu thanh cong |
| --- | --- | --- |
| 0:00-0:45 | Bat backend voi mock sensor realtime | Log backend bao sensor mock job dang chay |
| 0:45-1:45 | Dashboard realtime sensor | Socket connected, event count tang, chi so reading thay doi |
| 1:45-2:45 | Alert realtime | Alert moi xuat hien khi reading vuot nguong |
| 2:45-3:30 | History filter/statistics | Filter theo ngay/vung, so lieu tong hop tra dung |
| 3:30-4:20 | Export Excel | Tai duoc `readings.xlsx` hoac `alerts.xlsx` |
| 4:20-5:00 | Kich ban loi | Ngat token/refresh fail thi frontend logout, khong crash UI |

## Trang thai sau lan integration nay

- Frontend da co `.env.local` cho `NEXT_PUBLIC_API_URL` va `NEXT_PUBLIC_SOCKET_URL` tro ve backend local.
- `apiRequest` da co retry 401 bang `/api/auth/refresh`; `downloadApiFile` dung cung co che cho file Excel.
- Dashboard da co panel Socket.io lang nghe `sensor:reading-created`, `sensor:global-reading`, `alert:created`, `alert:global`.
- Map da fetch farm zones tu backend, co fallback mock khi API rong hoac loi.
- Backend CORS va Socket.io CORS deu dua vao `CLIENT_URL`; cookie refresh token can `credentials: "include"` o frontend.
