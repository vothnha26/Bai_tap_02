---
title: "Nâng cấp Giao diện Quản lý Đơn hàng"
description: "Mô tả chi tiết về việc hợp nhất hệ thống quản lý đơn hàng và các tính năng lọc, phân trang nâng cao tại trang Profile."
---

# Nâng cấp Giao diện Quản lý Đơn hàng

Hệ thống quản lý đơn hàng của PubliCast đã được tái cấu trúc từ một trang rời rạc (`/orders`) thành một bảng điều khiển (Dashboard) tập trung tích hợp trong trang Cá nhân (`/profile?tab=orders`), đi kèm với các bộ lọc dữ liệu mạnh mẽ.

## 1. Rationale (Tại sao hợp nhất?)

Trước đây, người dùng phải chuyển đổi qua lại giữa `/profile` (để quản lý địa chỉ/thông tin) và `/orders` (để xem lịch sử). Việc hợp nhất mang lại các lợi ích:
- **Tập trung hóa (Centralization)**: Người dùng có cái nhìn toàn cảnh về tài khoản của mình tại một nơi duy nhất.
- **Tối ưu Navigation**: Giảm bớt số lượng route cấp 1, giúp thanh Header gọn gàng hơn.
- **Tính năng đồng bộ**: Dễ dàng liên kết các thông tin như "Điểm thưởng từ đơn hàng" ngay trong cùng một trang dashboard.

---

## 2. Các Tính năng Nâng cao (Key Features)

### A. Bộ lọc thời gian (Date Range Filtering)
Người dùng có thể chọn khoảng thời gian "Từ ngày - Đến ngày" để tra cứu lịch sử mua sắm.
- **Triển khai**: Sử dụng ô nhập `type="date"` đồng bộ với state `orderFilters`.
- **Logic**: Backend sử dụng truy vấn MongoDB `$gte` và `$lte` trên trường `createdAt` `(backend/src/repositories/order.repository.js:15-18)`.

### B. Bộ lọc trạng thái (Status Chips)
Thay thế danh sách dropdown truyền thống bằng các "ô bấm" (chips) hiện đại, cho phép lọc nhanh trạng thái đơn hàng: *Chờ xử lý, Đã xác nhận, Đang chuẩn bị, Đang giao, Đã hủy, Thành công*.

### C. Phân trang (Pagination)
Để đảm bảo hiệu năng khi số lượng đơn hàng lớn, hệ thống không tải toàn bộ dữ liệu một lúc.
- **Frontend**: Hiển thị các nút số trang và nút điều hướng Trước/Sau.
- **Backend**: Sử dụng `.skip()` và `.limit()` trong Repository để trích xuất đúng lượng dữ liệu cần thiết `(backend/src/repositories/order.repository.js:23-25)`.

---

## 3. Kiến trúc Luồng Dữ liệu (Full-stack Data Flow)

Hệ thống sử dụng các tham số truy vấn (Query Parameters) để giao tiếp giữa FE và BE:

```mermaid
sequenceDiagram
    autonumber
    skinparam backgroundColor #161b22
    
    participant UI as Profile UI (React)
    participant SVC as order.service.js
    participant API as OrderController (Express)
    participant Repo as OrderRepository (Mongoose)

    UI->>UI: Người dùng bấm chọn "Đang giao" (SHIPPING)
    UI->>SVC: getUserOrders({ status: 'SHIPPING', page: 1 })
    SVC->>API: GET /api/orders?status=SHIPPING&page=1&limit=5
    
    API->>Repo: findByUserId(userId, { status: 'SHIPPING', ... })
    Repo->>Repo: Count total documents match query
    Repo->>Repo: Fetch orders with skip/limit
    Repo-->>API: { orders: [...], total: 24, page: 1 }
    
    API-->>SVC: JSON Response
    SVC-->>UI: Cập nhật state 'orders' và 'orderMeta'
    UI->>UI: Re-render danh sách đơn hàng & số trang
```

---

## 4. Chi tiết Hiển thị Thẻ Đơn hàng (Order Card)

Mỗi thẻ đơn hàng trong danh sách đã được nâng cấp để hiển thị thông tin trực quan nhất:

- **Hình ảnh**: Hiển thị ảnh của sản phẩm đầu tiên trong đơn hàng (sử dụng `ImageWithFallback`).
- **Mã đơn hàng**: Hiển thị đầy đủ ID để phục vụ đối soát.
- **Giá tiền minh bạch**: 
    - Hiển thị giá cuối cùng (Final Amount) nổi bật.
    - Hiển thị giá gốc (gạch ngang) nếu đơn hàng có áp dụng giảm giá (Promotion/Reward).
- **Trạng thái**: Nhãn màu theo cấu hình `statusConfig` định nghĩa tại `frontend/src/pages/Profile.jsx`.

---

## 5. References
- **Frontend UI**: `frontend/src/pages/Profile.jsx`
- **Frontend Service**: `frontend/src/services/order.service.js`
- **Backend Controller**: `backend/src/controllers/order.controller.js`
- **Backend Service**: `backend/src/services/order/order.service.js`
- **Backend Repository**: `backend/src/repositories/order.repository.js`
- **Route Removal**: `frontend/src/routes.jsx`
