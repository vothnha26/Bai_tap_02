# Kế hoạch triển khai Module Order

## 1. Objective (Mục tiêu)
Xây dựng khung (skeleton) cho module Order (Đơn hàng) nhằm chuẩn hóa việc lưu trữ thông tin mua bán sản phẩm trong cơ sở dữ liệu MongoDB. Mặc dù chưa triển khai logic thanh toán phức tạp, hệ thống cần được thiết kế chuẩn chỉnh theo mô hình MVC (hoặc Controller-Service-Repository), sẵn sàng cho việc mở rộng tính năng và seed dữ liệu mẫu.

## 2. Key Files & Context (Các file và ngữ cảnh liên quan)
- **Tài liệu thiết kế:**
  - `docs/backend/orders/order-flow-sequence.puml` (Biểu đồ tuần tự luồng tạo đơn hàng)
  - `docs/backend/orders/README.md` (Đặc tả module)
- **Mã nguồn Backend:**
  - `backend/src/models/Order.js` (Lược đồ dữ liệu - Schema)
  - `backend/src/repositories/order.repository.js` (Thao tác DB)
  - `backend/src/services/order.service.js` (Logic nghiệp vụ)
  - `backend/src/controllers/order.controller.js` (Xử lý request)
  - `backend/src/routes/order.routes.js` (Định tuyến)
  - `backend/src/app.js` (Đăng ký route mới)

## 3. Implementation Steps (Các bước thực hiện)

### Bước 1: Thiết kế và Tài liệu hóa (Design)
- Tạo thư mục `docs/backend/orders/`.
- Soạn thảo `order-flow-sequence.puml` mô tả quá trình tạo một đơn hàng từ phía User.
- Soạn thảo `README.md` định nghĩa cấu trúc dữ liệu của đơn hàng (User, Items, Total Amount, Status...).

### Bước 2: Xây dựng cấu trúc dữ liệu (Model)
- Tạo file `backend/src/models/Order.js` với các trường chính:
  - `user`: ObjectId tham chiếu đến collection User.
  - `items`: Mảng đối tượng (Product ID, số lượng, giá tại thời điểm mua để tránh sai lệch khi giá sản phẩm đổi).
  - `totalAmount`: Tổng tiền của đơn.
  - `status`: Trạng thái đơn ('pending', 'processing', 'completed', 'cancelled'). Default là 'pending'.
  - `paymentStatus`: Trạng thái thanh toán ('unpaid', 'paid').
  - `shippingAddress` (Tùy chọn cho tương lai).

### Bước 3: Phát triển Backend Logic (Repository & Service)
- **Repository:** Tạo `backend/src/repositories/order.repository.js` bao gồm các hàm cơ bản: `createOrder`, `findOrdersByUser`, `findById`.
- **Service:** Tạo `backend/src/services/order.service.js` để kết nối Controller và Repository, xử lý các tính toán phụ (ví dụ kiểm tra đầu vào cơ bản).

### Bước 4: Xây dựng Controller và Routing
- **Controller:** Tạo `backend/src/controllers/order.controller.js` với các method như `createOrder`, `getMyOrders`.
- **Routes:** Tạo `backend/src/routes/order.routes.js`, áp dụng middleware xác thực (`auth.middleware.js`) để đảm bảo chỉ user đã đăng nhập mới xem/tạo được đơn.
- **Tích hợp:** Đăng ký route mới (`/api/orders`) vào `backend/src/app.js`.

## 4. Verification & Testing (Kiểm tra và Xác nhận)
- Chạy ứng dụng backend để đảm bảo không có lỗi khởi tạo.
- Sử dụng Postman hoặc mã kịch bản để test việc tạo một đơn hàng (mock dữ liệu) và lấy danh sách đơn hàng.
- (Tương lai): Chuẩn bị file seed data (`order.seed.js`) để bơm dữ liệu vào collection phục vụ UI.
