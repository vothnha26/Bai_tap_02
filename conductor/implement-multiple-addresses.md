# Conductor Task: Implement Multiple Addresses

## 1. Objective
Cho phép mỗi người dùng quản lý nhiều địa chỉ (Multiple Addresses) trong Profile, đặt một địa chỉ làm mặc định, và chọn nhanh địa chỉ khi thanh toán ở trang Checkout.

## 2. Key Files & Context
* Modify: [backend/src/models/User.js](file:///D:/Fullit/tutorials/PubliCast/backend/src/models/User.js) (Thêm addressSchema sub-document)
* Modify: [backend/src/repositories/user.repository.js](file:///D:/Fullit/tutorials/PubliCast/backend/src/repositories/user.repository.js) (Thêm các hàm CRUD & default address)
* Modify: [backend/src/utils/constants.js](file:///D:/Fullit/tutorials/PubliCast/backend/src/utils/constants.js) (Tránh magic strings)
* Create: [backend/src/controllers/userAddress.controller.js](file:///D:/Fullit/tutorials/PubliCast/backend/src/controllers/userAddress.controller.js) (Các API controller)
* Modify: [backend/src/routes/user.routes.js](file:///D:/Fullit/tutorials/PubliCast/backend/src/routes/user.routes.js) (Đăng ký routes)
* Modify: [frontend/src/services/user.service.js](file:///D:/Fullit/tutorials/PubliCast/frontend/src/services/user.service.js) (Thêm API Client)
* Modify: [frontend/src/pages/Profile.jsx](file:///D:/Fullit/tutorials/PubliCast/frontend/src/pages/Profile.jsx) (Tách tab Địa chỉ nhận hàng, thiết kế giao diện Card quản lý)
* Modify: [frontend/src/pages/Checkout.jsx](file:///D:/Fullit/tutorials/PubliCast/frontend/src/pages/Checkout.jsx) (Tích hợp radio select chọn địa chỉ đã lưu hoặc điền mới)
* Create Docs: [docs/multiple_addresses.md](file:///D:/Fullit/tutorials/PubliCast/docs/multiple_addresses.md) (Tài liệu kiến trúc)

## 3. Implementation Steps & Status

- [x] **Giai đoạn 1: Schema & Repository**
  - Đã thêm `addressSchema` và trường `addresses` dạng mảng trong User Schema.
  * Cài đặt các hàm repository cho Address: `addAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`.
  * Viết & Chạy test repository: [user_address.test.js](file:///D:/Fullit/tutorials/PubliCast/backend/src/tests/user_address.test.js) (PASS 5/5).

- [x] **Giai đoạn 2: API Controller & Route**
  * Cài đặt controller `UserAddressController` đầy đủ validation.
  * Đăng ký các route `/addresses` dưới sự bảo vệ của `verifyAuth`.
  * Viết & Chạy test API: [user_address_api.test.js](file:///D:/Fullit/tutorials/PubliCast/backend/src/tests/user_address_api.test.js) (PASS 5/5).

- [x] **Giai đoạn 3: Frontend Profile Integration**
  * Bổ sung API client trong `user.service.js`.
  * Tách biệt tab "Địa chỉ nhận hàng" trên giao diện Profile, tích hợp Modal thêm/sửa, danh sách dạng Card và nút Đặt mặc định/Sửa/Xóa.

- [x] **Giai đoạn 4: Frontend Checkout Integration**
  * Tải danh sách địa chỉ và chọn mặc định lúc khởi chạy Checkout.
  * Hiển thị Radio list chọn địa chỉ nhanh, ẩn/hiện form nhập mới dựa theo lựa chọn của người dùng.

## 4. Verification & Testing
* Unit Tests Repository: `npx jest src/tests/user_address.test.js` -> **PASS**
* Integration Tests API: `npx jest src/tests/user_address_api.test.js` -> **PASS**
