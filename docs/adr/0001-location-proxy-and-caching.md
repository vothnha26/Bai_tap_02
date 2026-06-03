# ADR-0001: Triển khai Backend Proxy và Redis Caching cho Dữ liệu Địa chỉ

## Trạng thái (Status)

Đã chấp nhận (Accepted) - 03/06/2026

## Ngữ cảnh (Context)

Tính năng quản lý địa chỉ và thanh toán của PubliCast phụ thuộc vào API hành chính từ `provinces.open-api.vn`. Trong quá trình phát triển, chúng tôi gặp các vấn đề sau:
1.  **Hiệu năng**: Việc tải danh sách phường/xã từ client tốn nhiều thời gian do server bên thứ ba phản hồi chậm.
2.  **Lỗi kỹ thuật**: API v2 của bên thứ ba trả về lỗi `422` nếu tham số không khớp hoàn toàn, và chính sách CORS gây khó khăn cho việc gọi trực tiếp từ trình duyệt trong một số môi trường.
3.  **Độ tin cậy**: Hệ thống Checkout bị dừng hoàn toàn nếu API địa chỉ gặp sự cố.

## Các yếu tố quyết định (Decision Drivers)

*   **Tính ổn định**: Hệ thống không được phép phụ thuộc quá nhiều vào uptime của bên thứ ba.
*   **Hiệu năng**: Dropdown địa chỉ phải hiển thị gần như ngay lập tức.
*   **Tính mở rộng**: Dễ dàng thay đổi nguồn dữ liệu địa chỉ mà không cần cập nhật code ở nhiều nơi trên Frontend.

## Các lựa chọn đã cân nhắc (Considered Options)

### Lựa chọn 1: Tiếp tục gọi trực tiếp từ Frontend (Hiện tại)
-   **Ưu điểm**: Không tốn tài nguyên Backend.
-   **Nhược điểm**: Chậm, dễ lỗi CORS, khó debug.

### Lựa chọn 2: Import cứng dữ liệu vào Database (Local Storage)
-   **Ưu điểm**: Tốc độ nhanh nhất, không phụ thuộc API ngoài.
-   **Nhược điểm**: Làm phình to Database (hàng nghìn bản ghi), khó cập nhật khi nhà nước thay đổi địa giới hành chính.

### Lựa chọn 3: Backend Proxy kết hợp Redis Caching (Lựa chọn được chọn)
-   **Ưu điểm**: Tốc độ cực nhanh (sau lần fetch đầu), ẩn được API Key (nếu có), xử lý được lỗi tham số trước khi trả về FE, đảm bảo tính nhất quán.
-   **Nhược điểm**: Tốn thêm một ít tài nguyên RAM cho Redis và băng thông Backend.

## Quyết định (Decision)

Chúng tôi chọn **Lựa chọn 3**: Xây dựng module `Location` tại Backend làm Proxy cho `provinces.open-api.vn` và sử dụng **Redis** để lưu trữ kết quả.

## Lý do (Rationale)

1.  **Tối ưu trải nghiệm**: Redis cho phép truy xuất dữ liệu trong < 10ms, giúp trải nghiệm chọn địa chỉ mượt mà.
2.  **Giảm tải**: TTL 24 giờ là hợp lý vì dữ liệu hành chính rất ít thay đổi, giúp giảm hàng nghìn request tới server bên thứ ba mỗi ngày.
3.  **Surgical Fix**: Backend có thể chủ động parse lại dữ liệu (vd: làm phẳng danh sách wards) để FE dễ sử dụng hơn.

## Hệ quả (Consequences)

### Tích cực
-   FE chỉ cần gọi API nội bộ, code sạch hơn.
-   Hệ thống vẫn hoạt động ổn định kể cả khi API ngoài gặp sự cố tạm thời (nhờ Cache).
-   Tăng điểm hiệu năng (Performance score) cho trang Checkout và Profile.

### Tiêu cực
-   Cần quản lý Redis (connection, error handling).
-   Phải cài đặt thêm thư viện `axios` ở Backend.

## Ghi chú triển khai (Implementation Notes)

-   Sử dụng Key pattern: `location:provinces` và `location:wards:{provinceCode}`.
-   TTL: 86400 giây (24 giờ).
-   Sử dụng API v2 phẳng (`depth=2`) để lấy Wards trực tiếp từ Province.

## Tài liệu liên quan (Related Decisions)

-   [Kiến trúc Location Proxy & Caching](../backend/location/location-caching-design.md)
