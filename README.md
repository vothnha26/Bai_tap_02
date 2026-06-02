# Hướng Dẫn Sử Dụng & Tài Liệu Dự Án - PubliCast

Tài liệu này tổng hợp về kiến trúc, các bước thiết lập, các tính năng đặc biệt (Đăng ký, Xác thực OTP, Hệ thống điểm thưởng sản phẩm) và quy chuẩn phát triển của dự án PubliCast.

---

## 🛠️ Công Nghệ Sử Dụng

- **Ngôn ngữ & Framework:** NodeJS, ExpressJS (Backend) & ReactJS, Vite, Tailwind CSS (Frontend).
- **Cơ sở dữ liệu:** MongoDB (lưu trữ chính), Redis (Lưu OTP, Rate Limiting, Cart Session, BullMQ).
- **ODM:** Mongoose (Giao tiếp MongoDB).
- **Thư viện chính:**
  - `ioredis` & `bullmq`: Quản lý hàng đợi bất đồng bộ (Email, Review Moderation, Reward Processing).
  - `bcryptjs`: Mã hóa mật khẩu.
  - `express-rate-limit`: Giới hạn request (Spam protection).
  - `nodemailer`: Gửi email xác thực.
  - `jest` & `supertest`: Kiểm thử tự động.

---

## 🚀 Các Bước Thiết Lập Dự Án

### Bước 1: Cài đặt thư viện

```bash
# Tại thư mục backend
cd backend
npm install

# Tại thư mục frontend
cd ../frontend
npm install
```

### Bước 2: Khởi động Hạ tầng (Docker)

Đảm bảo Docker Desktop đang chạy, sau đó khởi động MongoDB (mặc định cổng `27017`) và Redis (mặc định cổng `6379`):

```bash
docker compose up -d
```

### Bước 3: Cấu hình Môi trường (.env)

Sao chép `.env.example` thành `.env` bên trong thư mục `backend/` và điền đầy đủ thông tin:

```bash
cd backend
copy .env.example .env
```

**Lưu ý quan trọng về Email (Gmail):**
Để gửi được mail thật, bạn cần cấu hình:

1.  **GMAIL_USER**: Địa chỉ Gmail của bạn.
2.  **GMAIL_PASS**: **App Password** (Mật khẩu ứng dụng 16 ký tự).
3.  **EMAIL_PORT**: `465`.
4.  **EMAIL_HOST**: `smtp.gmail.com`.

_Nếu để giá trị mặc định (`your_email@gmail.com`), hệ thống sẽ tự động chuyển sang chế độ **CONSOLE MODE** (OTP sẽ in ra màn hình terminal)._

### Bước 4: Khởi tạo dữ liệu mẫu (Seed Data)

Nạp dữ liệu mẫu cho hệ thống tại thư mục `backend/`:

```bash
# Nạp sản phẩm mẫu
npm run seed

# Nạp khuyến mãi mẫu
npm run seed:promotion

# Nạp dữ liệu hệ thống điểm thưởng (Tiers, Benefits, Rules)
node src/seeds/reward_system.seed.js
```

---

## 📦 Các Module & Quy Trình Nổi Bật

### 1. Đăng ký & Xác thực OTP (Authentication)

- **Giai đoạn 1 (Đăng ký):** Lưu thông tin user với trạng thái `INACTIVE`, tạo mã OTP 6 số lưu vào Redis (TTL 10 phút) và gửi mail cho người dùng.
- **Giai đoạn 2 (Xác thực):** Kiểm tra mã khớp trong Redis, cập nhật user thành `ACTIVE` và xóa mã OTP trong Redis.

### 2. Chuỗi Xử lý Đơn hàng (Chain of Responsibility)

Tách luồng đặt hàng thành các bước độc lập giúp dễ dàng mở rộng và tối ưu hóa logic:
`CartValidation` -> `StockValidation` -> `Promotion` -> `OrderSave` -> `CartClear`.

### 3. Hệ thống Điểm thưởng & Thành viên (Reward System)

- **Hàng đợi BullMQ:** Cộng điểm thưởng và nâng hạng thành viên bất đồng bộ thông qua `RewardQueue` và `RewardWorker`.
- **Hạ hạng tự động:** Định kỳ quét và hạ hạng thành viên thông qua `TierDowngradeWorker`.
- **Tích điểm sản phẩm (`ProductRewardRule`):** Admin cấu hình điểm thưởng cố định riêng cho từng sản phẩm. Hệ thống tự động đồng bộ và hiển thị điểm dự kiến nhận được trên Chi tiết sản phẩm, Giỏ hàng và Thanh toán.

---

## 🚀 Production Readiness (Độ sẵn sàng triển khai)

Dự án đã được Audit và tối ưu hóa cho môi trường thực tế:

### 1. Biến môi trường bắt buộc (Production)
Đảm bảo các biến sau được thiết lập trên server:
- `MONGODB_URI`: Chuỗi kết nối MongoDB (không được để trống).
- `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`: Chuỗi bí mật cho Token (độ dài > 32 ký tự).
- `VITE_API_URL`: URL backend cho frontend (ví dụ: `https://api.yourdomain.com`).
- `NODE_ENV=production`: Kích hoạt chế độ ghi log ra file và các tối ưu hóa production.

### 2. Giám sát & Logs
Hệ thống sử dụng **Winston** để ghi log. Trong môi trường production:
- Log lỗi: `backend/logs/error.log`
- Log tổng hợp: `backend/logs/combined.log`

### 3. Chính sách bảo mật (Security Policy)
- **Mật khẩu:** Yêu cầu tối thiểu **12 ký tự**, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
- **Hashing:** Sử dụng `bcrypt` với **12 rounds** (tiêu chuẩn an toàn cao).
- **Security Logs:** Toàn bộ các sự kiện Login/Reset/Refresh đều được giám sát chặt chẽ.

### 4. Tối ưu hóa Frontend
- Toàn bộ trang đã được cấu hình **Lazy Loading**.
- Bundle được chia nhỏ tự động bởi Vite để tăng tốc độ tải trang đầu tiên.

---

## 🧪 Kiểm Thử (Testing)


Dự án tích hợp kiểm thử tự động toàn diện bằng Jest & Supertest:

```bash
# Tại thư mục backend
$env:USE_MEMORY_REDIS="true"; npx jest --runInBand --forceExit
```

- **Chạy toàn bộ tests:** `npm test`
- **Test tích hợp module điểm thưởng:** `npx jest src/tests/reward.integration.test.js`
- **Test CRUD luật điểm thưởng:** `npx jest src/tests/product_reward_rule.test.js`

Chúc team phát triển tính năng thuận lợi! 🚀
