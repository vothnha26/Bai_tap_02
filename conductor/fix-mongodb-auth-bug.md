# Plan: Fix MongoDB Authentication Bug during Seeding

## 1. Objective
Khắc phục lỗi `MongoServerError: Command delete requires authentication` khi chạy script seed dữ liệu ban đầu. Đảm bảo mã nguồn được tái cấu trúc tuân thủ tuyệt đối nguyên tắc SOLID, áp dụng Design Pattern (Template Method / Command) và quy trình phát triển bắt đầu bằng Sequence Diagram.

## 2. Key Files & Context
- `backend/.env`: Cấu hình sai database (đang là MySQL, thiếu MongoDB credentials).
- `backend/src/seeds/product.seed.js`: Gặp lỗi do thiếu thông tin xác thực, logic kết nối DB trùng lặp, thiếu tính module hóa.
- `backend/src/config/mongoose.js`: Module kết nối DB cần được tận dụng lại.
- `docs/backend/products/seed-sequence.puml`: File chứa Sequence Diagram mới.

## 3. Implementation Steps

### Phase 1: Sequence Diagram
- Tạo file `docs/backend/products/seed-sequence.puml`.
- Vẽ biểu đồ tuần tự thể hiện sự tương tác giữa client (chạy lệnh script), Seeder class (Base), ProductSeeder (Concrete), Database Connection và các Models (Category, Product).

### Phase 2: Configuration Update
- Chỉnh sửa `backend/.env`:
  - Xóa dòng cấu hình `DATABASE_URL` của MySQL bị lỗi/thừa.
  - Thêm `MONGODB_URI="mongodb://root:root_password@localhost:27017/publicast?authSource=admin"` để tương thích với cấu hình Docker Compose hiện có.

### Phase 3: Code Refactoring (SOLID & Design Patterns)
- **Áp dụng Template Method Pattern** (hoặc Command) cho quá trình Seeding.
- Tại `backend/src/seeds/product.seed.js` (hoặc tạo các module hỗ trợ nếu cần):
  - Khai báo một base logic (có thể là class hoặc object đóng gói) chứa khung thực thi (Template): `connect()`, `clearData()`, `seedData()`, `disconnect()`.
  - Triển khai cụ thể `ProductSeeder` thực hiện `clearData` (xóa Category, Product) và `seedData` (insert dữ liệu mẫu).
  - Tái sử dụng (import) cấu hình kết nối từ `backend/src/config/mongoose.js` (chỉnh sửa một chút để phù hợp với việc mở/đóng kết nối động trong script nếu cần, hoặc tự kết nối thông qua base class).

### Phase 4: Validation & Testing
- Chạy lệnh `npm run seed` trong thư mục `backend/`.
- Xác nhận logs hiển thị `Connected to MongoDB...`, `Cleared existing data.`, `Seeded...` và script thoát với mã `0`.
- (Tùy chọn) Kiểm tra thông qua Docker hoặc Mongoose script để đảm bảo records thực sự tồn tại trong DB.
