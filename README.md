# Hướng Dẫn Sử Dụng & Tài Liệu: Tính Năng Đăng Ký - PubliCast

Tài liệu này tập trung vào chức năng **Đăng ký tài khoản (Registration)** và **Xác thực OTP qua Email**, giúp các thành viên trong team nắm vững quy trình thiết lập và luồng hoạt động của hệ thống.

---

## 🛠️ Công Nghệ Sử Dụng

- **Ngôn ngữ & Framework:** NodeJS, ExpressJS.
- **Cơ sở dữ liệu:** MySQL 8.0, Redis (Lưu mã OTP).
- **ORM:** Prisma (Quản lý Database).
- **Thư viện chính (Code):**
  - `bcryptjs`: Mã hóa mật khẩu.
  - `express-validator`: Validate dữ liệu đầu vào.
  - `express-rate-limit`: Giới hạn request (Spam protection).
  - `nodemailer`: Gửi email xác thực.
  - `jest` & `supertest`: Kiểm thử tự động.

---

## 🚀 Các Bước Thiết Lập Dự Án

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Khởi động Hạ tầng (Docker)
Đảm bảo Docker đang chạy, sau đó khởi động MySQL (mặc định cổng `3307`) và Redis:
```bash
docker compose up -d
```

### Bước 3: Cấu hình Môi trường
Sao chép `.env.example` thành `.env` và điền đầy đủ thông tin cấu hình Email (GMAIL_USER, GMAIL_PASS):
```bash
# Windows (PowerShell)
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

### Bước 4: Khởi tạo Database
Chạy migration để tạo các bảng cần thiết trong MySQL:
```bash
npx prisma migrate dev
```

---

## 🔄 Quy Trình Đăng Ký (Workflow)

Hệ thống hoạt động theo 2 giai đoạn chính nhằm đảm bảo tính xác thực:

### Giai đoạn 1: Đăng ký tài khoản
1. **Validation**: Kiểm tra email hợp lệ, mật khẩu tối thiểu 8 ký tự, xác nhận mật khẩu khớp.
2. **Kiểm tra trùng lặp**: Đảm bảo Email chưa tồn tại trong hệ thống.
3. **Lưu trữ**: Tạo bản ghi User trong MySQL với trạng thái `INACTIVE`.
4. **OTP**: Sinh mã 6 số ngẫu nhiên, lưu vào **Redis** với thời gian hết hạn (10 phút).
5. **Thông báo**: Gửi email chứa mã OTP đến địa chỉ email người dùng đã đăng ký.

### Giai đoạn 2: Xác minh OTP (Kích hoạt tài khoản)
1. **Truy vấn Redis**: Lấy mã OTP đã lưu dựa trên Email.
2. **So sánh**: Nếu khớp, cập nhật trạng thái User thành `ACTIVE` trong MySQL và xóa OTP khỏi Redis.

---

## 📝 Hướng Dẫn Sử Dụng API (Dành cho Frontend)

### 1. API Đăng ký (Register)
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Body:**
```json
{
  "name": "Nguyen Van A",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### 2. API Xác minh OTP (Verify OTP)
- **Method:** `POST`
- **Endpoint:** `/api/auth/verify-otp`
- **Body:**
```json
{
  "email": "test@example.com",
  "otp": "123456"
}
```

---

## 💻 Hướng Dẫn Code (Dành cho Backend)

Để mở rộng hoặc chỉnh sửa logic đăng ký, hãy làm việc với các thành phần sau:

**1. Repository (Thao tác Database):**
Sử dụng `UserRepository` để quản lý bản ghi User và Account:
```javascript
const userRepository = require('../repositories/user.repository');

// Tạo user mới kèm account (provider: LOCAL)
const user = await userRepository.createUser(
  { fullName: "A", email: "a@ex.com", status: "INACTIVE" },
  { provider: "LOCAL", passwordHash: "..." }
);
```

**2. Service (Logic nghiệp vụ):**
Logic đăng ký được đóng gói trong `AuthService.register`:
```javascript
// Quy trình chuẩn trong Service:
const existingUser = await userRepository.findByEmail(email);
if (existingUser) throw new Error("Email exists");

const passwordHash = await bcrypt.hash(password, 10);
const user = await userRepository.createUser(...);

const otp = await otpService.generateOTP();
await otpService.saveOTP(email, otp);
await emailService.sendOTP(email, otp);
```

**3. Constants (Hằng số):**
Tuyệt đối không sử dụng Magic String. Hãy định nghĩa và sử dụng `ERROR_MESSAGES` hoặc `USER_STATUS` trong `src/utils/constants.js`.

---

## 📁 Cấu Trúc Module Đăng Ký
- `src/controllers/auth.controller.js`: Tiếp nhận request và điều hướng phản hồi.
- `src/services/auth.service.js`: Chứa Business Logic (Đăng ký, Xác thực).
- `src/services/otp.service.js`: Quản lý lưu trữ và kiểm tra mã OTP với Redis.
- `src/services/email/`: Triển khai Strategy gửi Email (Nodemailer).
- `src/repositories/user.repository.js`: Thao tác trực tiếp với Database qua Prisma.

---

## 🧪 Kiểm Thử (Testing)
Dự án tích hợp kiểm thử tự động để đảm bảo tính ổn định:
- Chạy toàn bộ tests: `npm test`
- Chạy test tích hợp cho Auth: `npx jest tests/auth.integration.test.js`

Chúc team phát triển tính năng thuận lợi! 🚀
