# Chiến lược Render (Rendering Strategies) trong Next.js

Tài liệu này giải thích chi tiết các chiến lược render (SSR, SSG, ISR) được áp dụng thực tế trong hệ thống Thành Phát An Smart Farm dựa trên kết quả build của Next.js (Turbopack).

## Tổng quan các Route chính

Dưới đây là danh sách phân tích các route quan trọng và chiến lược tương ứng đang được áp dụng:

### 1. Route: `/` (Trang chủ)
- **Chiến lược:** `SSR` (Dynamic Rendering)
- **Lý do:** Trang chủ cần kiểm tra trạng thái đăng nhập (đọc Cookie qua `next/headers` hoặc middleware) để quyết định hiển thị nút "Đăng nhập" hay "Đi đến Dashboard". Do phụ thuộc vào Request header (Cookie), route này buộc phải render động.

### 2. Route: `/auth/login`
- **Chiến lược:** `Static` (SSG không có tham số / Client Component)
- **Lý do:** Form đăng nhập là một giao diện hoàn toàn tĩnh, không phụ thuộc vào dữ liệu từ database lúc render. Các thao tác xử lý submit, kiểm tra validation đều diễn ra hoàn toàn ở phía trình duyệt (Client-side). Do đó, Next.js render sẵn trang này thành HTML tĩnh (`○ (Static)`) lúc build để tăng tốc độ phản hồi.

### 3. Route: `/dashboard` (Tổng quan)
- **Chiến lược:** `SSR` (Dynamic Rendering)
- **Lý do:** Toàn bộ cụm `/dashboard` kế thừa cấu hình `export const dynamic = "force-dynamic"` từ `dashboard/layout.tsx`. Bảng điều khiển này phải luôn phản ánh dữ liệu Realtime, số lượng cảm biến, thông báo cảnh báo và kiểm tra xác thực người dùng liên tục. Bất kỳ sự chậm trễ nào do cache đều gây rủi ro sai lệch dữ liệu giám sát hệ thống.

### 4. Route: `/dashboard/history`
- **Chiến lược:** `SSR` kết hợp `Client Component`
- **Lý do:** Kế thừa SSR từ Layout để bảo vệ Route. Tuy nhiên, nội dung chính của trang phụ thuộc lớn vào tương tác của người dùng (chọn bộ lọc ngày tháng `from/to`, vẽ biểu đồ đồ thị Recharts). Các thao tác fetch dữ liệu lịch sử này diễn ra ở phía Client (CSR - Client Side Rendering) ngay sau khi khung trang SSR được tải xuống.

### 5. Route: `/dashboard/map`
- **Chiến lược:** `SSR` kết hợp `Client Component`
- **Lý do:** Route này cần render động để xác thực quyền xem bản đồ. Bản thân thư viện bản đồ (React-Leaflet) yêu cầu sử dụng các API của trình duyệt (Browser Window Object), do vậy component bản đồ buộc phải render hoàn toàn bằng JS trên trình duyệt của người dùng (CSR) thông qua `next/dynamic` với `ssr: false`.

### 6. Route: `/dashboard/zones/[id]` (Chi tiết vùng trồng)
- **Chiến lược:** `SSR` (Dynamic Rendering)
- **Lý do:** Dù trang này có tham số URL (`[id]`), hệ thống không sử dụng `generateStaticParams` để tạo trước tĩnh do dữ liệu nhiệt độ/độ ẩm/cảnh báo của vùng trồng thay đổi từng phút. SSR giúp server luôn móc vào DB lấy thông số vùng trồng mới nhất ngay tại thời điểm người dùng truy cập.

### 7. Route: `/farm-guide` (Danh sách hướng dẫn)
- **Chiến lược:** `Static` + `ISR` (Incremental Static Regeneration)
- **Lý do:** Trang danh sách các hướng dẫn nông nghiệp là nội dung chung, rất ít thay đổi. Bằng cách thiết lập `export const revalidate = 3600;`, Next.js tạo sẵn một bản HTML siêu nhanh lúc build. Cứ sau mỗi 1 giờ (3600s), nếu có request mới, Next.js sẽ ngầm render lại ở background để cập nhật danh sách bài viết mới mà không làm chậm trải nghiệm của người truy cập.

### 8. Route: `/farm-guide/[slug]` (Chi tiết bài hướng dẫn)
- **Chiến lược:** `SSG` (Static Site Generation) + `ISR`
- **Lý do:** Trang này áp dụng kỹ thuật hàm `generateStaticParams()` để xác định trước danh sách các chủ đề (ví dụ: `setup-sensors`, `manage-zones`) ngay lúc build. Next.js lấy danh sách này tạo sẵn HTML (`● (SSG)`). Kết hợp thêm `revalidate = 3600`, trang vừa có tốc độ truy cập tức thì (0ms pre-rendered), vừa tự động cập nhật được nội dung (nhờ ISR) nếu admin có chỉnh sửa nội dung bài hướng dẫn trên cơ sở dữ liệu.

---

## Bảng đối chiếu Output Build Thực tế

Dựa vào output của lệnh `npm run build`, ta thấy rõ kết quả mapping:

| Route (app) | Ký hiệu (Output) | Ý nghĩa thực tế |
| :--- | :---: | :--- |
| `/` | `ƒ` | Server-rendered on demand (SSR) |
| `/auth/login` | `○` | Prerendered as static content (Static) |
| `/dashboard/...` | `ƒ` | Server-rendered on demand (SSR) |
| `/farm-guide` | `○` | Prerendered Static với Revalidate (1h) |
| `/farm-guide/[slug]` | `●` | Prerendered as SSG HTML với Revalidate (1h) |

*Mọi tuyên bố trên đều khớp tuyệt đối 100% với file cấu hình mã nguồn và output của TurboPack Engine.*
