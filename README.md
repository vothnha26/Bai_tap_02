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
# Tại thư mục gốc
npm install

# Tại thư mục backend
cd backend
npm install
```

### Bước 2: Khởi động Hạ tầng (Docker)
Đảm bảo Docker đang chạy, sau đó khởi động MySQL (mặc định cổng `3307`) và Redis:
```bash
docker compose up -d
```

### Bước 3: Cấu hình Môi trường (.env)
Sao chép `.env.example` thành `.env` bên trong thư mục `backend/` và điền đầy đủ thông tin:
```bash
# Di chuyển vào backend trước khi copy
cd backend
copy .env.example .env
```

**Lưu ý quan trọng về Email (Gmail):**
Để gửi được mail thật, bạn cần:
1.  **GMAIL_USER**: Địa chỉ Gmail của bạn.
2.  **GMAIL_PASS**: **App Password** (Mật khẩu ứng dụng 16 ký tự), không phải mật khẩu đăng nhập Gmail.
3.  **EMAIL_PORT**: Luôn để `465` cho Gmail.
4.  **EMAIL_HOST**: `smtp.gmail.com`.

*Nếu để giá trị mặc định (`your_email@gmail.com`), hệ thống sẽ tự động chuyển sang chế độ **CONSOLE MODE** (OTP sẽ in ra màn hình terminal thay vì gửi mail).*

### Bước 4: Khởi tạo & Quản lý Database
Chạy migration để tạo các bảng:
```bash
npx prisma migrate dev
```

**Lệnh xóa sạch dữ liệu (Reset DB):**
Khi muốn làm sạch database trong quá trình phát triển:
```bash
# Cách 1: Reset hoàn toàn (xóa bảng và tạo lại)
npx prisma migrate reset

# Cách 2: Ép buộc reset nhanh (Khuyên dùng khi dev)
npx prisma db push --force-reset
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

## 💻 Hướng Dẫn Debug & Mở rộng

**1. Kiểm tra cấu hình Email:**
Khi khởi động server (`npm run dev`), hãy quan sát log ở Terminal để biết hệ thống đang dùng cấu hình nào:
```text
[Email Config] Using User: vothanhnha152@gmail.com
[Email Config] Port: 465, Secure: true
[Email Config] Mode: SMTP
```

**2. Repository (Thao tác Database):**
Sử dụng `UserRepository` để quản lý bản ghi User và Account thông qua Prisma.

**3. Constants (Hằng số):**
Tuyệt đối không sử dụng Magic String. Hãy định nghĩa và sử dụng `ERROR_MESSAGES` hoặc `USER_STATUS` trong `src/utils/constants.js`.

---

## 🧪 Kiểm Thử (Testing)
Dự án tích hợp kiểm thử tự động để đảm bảo tính ổn định:
- Chạy toàn bộ tests: `npm test`
- Chạy test tích hợp cho Auth: `npx jest tests/auth.integration.test.js`

**Lưu ý:** Mỗi lần thay đổi file `.env`, bạn bắt buộc phải **Khởi động lại Server** (Ctrl + C và chạy lại) để áp dụng thay đổi.

Chúc team phát triển tính năng thuận lợi! 🚀
