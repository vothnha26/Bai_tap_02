# PubliCast - Project Context & Architecture

Tài liệu này lưu trữ tóm tắt về kiến trúc, các kỹ thuật sử dụng và quy chuẩn phát triển của dự án PubliCast để đảm bảo tính nhất quán trong quá trình phát triển.

## 🏗️ Kiến trúc Hệ thống (Backend)
- **Kiến trúc:** Controller - Service - Repository.
- **Công nghệ chính:** Node.js (Express), MongoDB (Mongoose), Redis.
- **Database:** Sử dụng Mongoose để giao tiếp với MongoDB. Redis dùng cho OTP, Rate Limiting và quản lý Refresh Token.

## 🔐 Module Authentication
- **Cơ chế:** JWT (JSON Web Token) với mô hình Access Token (ngắn hạn) và Refresh Token (dài hạn).
- **Luồng Đăng ký:**
  1. Validate dữ liệu -> Kiểm tra trùng lặp Email.
  2. Tạo User trạng thái `INACTIVE`.
  3. Sinh OTP (6 số), lưu vào Redis (TTL 10 phút).
  4. Gửi Email (SMTP/Nodemailer). Nếu cấu hình lỗi sẽ chạy **Console Mode**.
- **Xác thực:** Middleware `auth.middleware.js` kiểm tra Access Token trong Header/Cookie.
- **Bảo mật:** Tích hợp `express-rate-limit` cho các endpoint nhạy cảm (Login, Register, Reset Password).

## 📦 Các Module & Kỹ thuật đặc biệt
- **Order Module (Chain of Responsibility):**
  - Tách luồng đặt hàng thành các bước: `CartValidation` -> `StockValidation` -> `Promotion` -> `OrderSave` -> `CartClear`.
  - Giúp hệ thống cực kỳ dễ mở rộng (ví dụ: thêm bước Fraud Detection chỉ cần chèn 1 Handler mới).
- **Inventory Module (Facade & Factory):**
  - **Facade (`InventoryService`):** Điểm truy cập duy nhất để thay đổi kho, đảm bảo tính nhất quán.
  - **Factory (`InventoryTransactionFactory`):** Tự động tạo Audit Logs (nhật ký biến động) cho mọi hành động (SALE, RESTOCK, STOCK_TAKE...).
- **Promotion Module:** Sử dụng mô hình Strategy/Facade để tính toán các loại giảm giá (Phần trăm, Số tiền cố định, Miễn phí vận chuyển).

## 🎨 Kiến trúc Frontend
- **Framework:** React (Vite), Tailwind CSS.
- **State Management:** 
  - `AuthContext`: Quản lý trạng thái đăng nhập toàn cục.
  - `CartContext`: Quản lý giỏ hàng phía client.
  - Redux: Sử dụng cho các logic phức tạp khác.
- **Thư mục:** Cấu trúc theo Feature-based kết hợp Service layer.

## 🛠️ Quy chuẩn kỹ thuật (Mandates)
- **SOLID:** Tuân thủ tuyệt đối, đặc biệt là SRP và OCP.
- **Design Patterns:** Ưu tiên áp dụng (Strategy, Factory, Facade, CoR) khi xử lý logic rẽ nhánh.
- **No Magic String:** Tất cả hằng số định nghĩa tại `backend/src/utils/constants.js`.
- **Quy trình:** Sequence Diagram -> Implementation -> Automated Testing (Jest/Supertest cho BE, Selenium cho UI).

## 🚀 Lệnh hữu ích
- `npm run dev`: Chạy server dev (nodemon).
- `npm run seed`: Nạp dữ liệu mẫu sản phẩm.
- `npm run seed:promotion`: Nạp dữ liệu mẫu khuyến mãi.
- `npm test`: Chạy toàn bộ test suite.
