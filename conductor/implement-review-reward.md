# Kế hoạch Thực thi: Review, Reward & Tier System (Enterprise Edition)

Bản kế hoạch này áp dụng tiêu chuẩn **Nerdzao Elite** (Senior Engineer 15+ years), tập trung vào kiến trúc hướng sự kiện, tính mở rộng cao và độ tin cậy dữ liệu tuyệt đối.

---

## 1. Thiết kế Hệ thống & Luồng xử lý (Sequence Diagrams)
Hệ thống được thiết kế dựa trên các luồng Sequence Diagram chi tiết (đã vẽ trong folder `docs/backend`):
- **Luồng Đánh giá:** `docs/backend/reviews/review-submission-sequence.puml` (Sử dụng BullMQ + Content Moderation).
- **Luồng Tích điểm & Thăng hạng:** `docs/backend/rewards/reward-tiering-sequence.puml` (Atomic Update + Idempotency).
- **Luồng Hạ hạng Định kỳ:** `docs/backend/rewards/tier-downgrade-sequence.puml` (O(1) Rolling Points calculation).

---

## 2. Mô hình Dữ liệu (Mongoose Models)
Áp dụng nguyên tắc SOLID và Clean Code:

### 1.1. `Review` (Đánh giá sản phẩm)
Lưu trữ thông tin đánh giá của khách hàng.
- **Trường dữ liệu:** `userId`, `productId`, `orderId`, `rating` (1-5), `comment`, `status` (PENDING, APPROVED, REJECTED), `isRewarded`.
- **Index:** `{ productId: 1, createdAt: -1 }`, `{ userId: 1, orderId: 1 } (Unique)`.

### 1.2. `Membership` (Ví điểm & Hạng - SRP separation)
Tách biệt hoàn toàn khỏi bảng `User` để đảm bảo SRP.
- **Trường dữ liệu:** `userId` (Unique), `tierId`, `currentPoints`, `rollingPoints`, `pointsByMonth` (Metadata mapping).

### 1.3. `Tier` (Cấu hình Hạng - Metadata Driven)
Quản lý các cấp bậc (Đồng, Bạc, Vàng...).
- **Trường dữ liệu:** `code`, `name`, `minPoints`, `benefits` (Mảng các Object `{ benefitId, value }`).

### 1.4. `BenefitMaster` (Từ điển quyền lợi - Dynamic UI Rendering)
Định nghĩa các loại quyền lợi mà Marketing có thể cấu hình.
- **Trường dữ liệu:** `code`, `name`, `valueType` (NUMBER, BOOLEAN, STRING), `description`.

### 1.5. `RewardLog` (Audit Trail)
Ghi lại mọi biến động điểm số để đối soát.
- **Index:** `{ sourceId: 1, source: 1 } (Unique - Idempotency)`.

---

## 3. Kiến trúc Xử lý Logic Backend (Software Architecture)

Hệ thống sẽ áp dụng các Design Patterns và Kiến trúc hiện đại:

### 3.1. Event-Driven Architecture (EDA) - Xử lý bất đồng bộ
- **Flow:** User Review -> `ReviewService` (Lưu PENDING) -> Publish Event `review.submitted`.
- **Worker (BullMQ):** Lắng nghe event, thực hiện Content Moderation (tự động/thủ công).
- **Reward Flow:** Khi status chuyển sang `APPROVED`, Worker publish event `review.approved` -> `RewardWorker` cộng điểm đồng thời vào `currentPoints`, `rollingPoints` and `pointsByMonth`.
- **Notification:** Khi hạng thay đổi, bắn event `membership.tier_changed` để gửi thông báo (Email/Push) minh bạch lý do (VD: `TIER_DOWNGRADE_DUE_TO_INACTIVITY`).

### 3.2. Cơ chế Bảo mật & Thực chiến (RewardService)
- **Atomic Update:** Trừ điểm bằng câu lệnh `{ $inc: { currentPoints: -points }, $gte: points }`.
- **Database Indexes:**
    - `{ sourceId: 1, source: 1 } (Unique)`: Chống cộng điểm trùng (Idempotency).
    - `{ userId: 1, createdAt: 1, pointsChanged: 1 }`: Tối ưu cho Cron Job quét điểm.
    - `{ userId: 1, createdAt: -1 }`: Tối ưu cho API hiển thị lịch sử ví điểm.

### 3.3. Background Jobs (BullMQ Repeatable Jobs)
Sử dụng BullMQ thay vì node-cron để quản lý tập trung và có dashboard giám sát:
- **Tier Downgrade Job:** Chạy định kỳ đầu tháng, khấu trừ điểm từ `pointsByMonth` (O(1)).
- **Points Expiration Job:** Quét các điểm cũ hơn 1 năm, thực hiện trừ điểm hết hạn.
- **Cấu hình hạ tầng chuyên sâu (Critical):**
    - **Redis Protection:** Cấu hình `removeOnComplete: 1000` và `removeOnFail: 5000` để tránh phình RAM (OOM) khi xử lý hàng chục ngàn review cùng lúc.
    - **Concurrency Safety:** Tăng `lockDuration` (VD: 5 phút) cho các job quét DB quy mô lớn để tránh race condition giữa các workers.
    - **Persistence:** Cấu hình Redis với AOF/RDB để đảm bảo không mất Job khi server crash.

---

## 4. Kiến trúc Dynamic UI (Metadata-Driven) - Trang Admin

Hệ thống cho phép Admin cấu hình quyền lợi mà không cần thay đổi code Frontend:

### 4.1. API Mapping
- `GET /api/admin/tiers/:id`: Trả về danh sách benefits kèm `valueType`.
- **Value Types hỗ trợ:** `NUMBER` (InputNumber), `BOOLEAN` (Switch), `STRING` (Input/Textarea), `PERCENTAGE` (Slider/InputNumber).

### 4.2. Frontend Component Factory
Sử dụng Pattern Registry để mapping `valueType` sang React Components, đảm bảo tính đóng gói và dễ mở rộng.

---

## 5. Lộ trình Triển khai (Implementation Steps)

### Phase 1: Chuẩn bị Cơ sở dữ liệu (Database Schema)
1. Tạo 5 models Mongoose: `Review`, `Membership`, `Tier`, `BenefitMaster`, `RewardLog`.
2. Định nghĩa các Indexes cần thiết.
3. Tạo file Seed để nạp dữ liệu mặc định cho `BenefitMaster` và các `Tier` cơ bản.

### Phase 2: Logic Nghiệp vụ & Event Workers (Backend Logic)
1. Xây dựng `BenefitRegistry` (Strategy Pattern) để xử lý tính toán quyền lợi.
2. Xây dựng `RewardService` (Cộng điểm, Trừ điểm, Ghi Log, Kiểm tra Thăng hạng).
3. Xây dựng `ReviewService` (Validate đơn hàng `DELIVERED`, lưu Review).
4. Thiết lập BullMQ Workers cho Content Moderation và Reward Processing.
5. Cập nhật Order Workflow: Thêm `RewardPointHandler` vào Chain of Responsibility.

### Phase 3: Quản trị (Admin CMS)
1. Xây dựng Dashboard cho Admin kiểm duyệt Review thủ công.
2. API quản lý `Tier` và `BenefitMaster`.
3. Tích hợp Dynamic Form Rendering cho trang cấu hình hạng.

### Phase 4: Trải nghiệm Người dùng (Frontend UI)
1. Xây dựng component Đánh giá sản phẩm sau khi mua hàng.
2. Trang Quản lý Ví điểm (Lịch sử, Hạng hiện tại, Quyền lợi).
3. Hiệu ứng Visual thăng hạng (Confetti, Badge mới).

### Phase 5: Kiểm thử Tự động (Automated Testing)
1. Viết Unit Test cho `BenefitRegistry` và các Strategy.
2. Viết Integration Test cho `RewardService`.
3. **Async Testing:** Kiểm thử các worker lắng nghe event từ BullMQ.
4. **Load & Stress Test:** Giả lập 10,000 request submit review đồng thời.
5. Viết End-to-End Test (Jest/Supertest) cho luồng mua hàng và tích điểm.

---

## 6. Cam kết Chất lượng
- **Tuyệt đối không Magic String:** Sử dụng `constants.js`.
- **Bảo mật:** Không thể đánh giá nếu chưa nhận hàng, không spam đánh giá nhiều lần.
- **Minh bạch:** Mọi thay đổi điểm số đều có Audit Log.
- **Siêu linh hoạt (OCP):** Thêm quyền lợi mới không cần sửa cấu trúc Database, Marketing tự do sáng tạo luật lệ.
