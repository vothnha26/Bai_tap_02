# Kiến trúc Giao diện Admin chung (AdminLayout)

Tài liệu này mô tả thiết kế và luồng điều hướng tập trung của phân hệ Quản trị (Admin) sử dụng cấu trúc `AdminLayout` trong ứng dụng React frontend.

---

## 1. Vấn đề trước khi Tái cấu trúc

Trước khi tối ưu hóa, các trang admin (như `AdminDashboard`, `ManageOrders`, `ManageCategories`, `ManagePromotions`, `Statistics`) hoạt động hoàn toàn độc lập:
* Mỗi file page đều tự render một thanh Sidebar (`<aside>`) riêng.
* Khi Admin điều hướng sang các route con như "Thêm sản phẩm" (`/admin/add-product`) hoặc "Sửa sản phẩm" (`/admin/edit-product/:id`), giao diện bị đứt gãy và **mất hoàn toàn Sidebar điều hướng**.
* Trùng lặp code Sidebar ở nhiều nơi, gây khó khăn cho việc bảo trì, cập nhật menu hoặc đổi quyền truy cập.

---

## 2. Giải pháp: AdminLayout & Outlet Pattern

Hệ thống đã chuyển đổi sang cấu trúc Layout tập trung bằng cách tạo Component `AdminLayout.jsx` làm bộ khung bao bọc (Wrapper).

### Sơ đồ cấu trúc Layout:
```text
+-------------------------------------------------------------+
|                         AdminLayout                         |
|  +--------------------+  +-------------------------------+  |
|  |                    |  |            Outlet             |  |
|  |      Sidebar       |  |  (Nội dung trang con động)    |  |
|  |                    |  |                               |  |
|  | - Quản lý Sản phẩm |  | * Ví dụ: Danh sách sản phẩm   |  |
|  | - Quản lý Đơn hàng |  | * Ví dụ: Tạo khuyến mãi mới   |  |
|  | - Thống kê doanh số|  | * Ví dụ: Form Thêm sản phẩm   |  |
|  | - Quản lý Danh mục |  |                               |  |
|  | - Đăng xuất        |  |                               |  |
|  |                    |  |                               |  |
|  +--------------------+  +-------------------------------+  |
+-------------------------------------------------------------+
```

---

## 3. Cấu hình Routing (`routes.jsx`)

Cấu trúc định tuyến mới nhóm toàn bộ các route bảo vệ của admin vào làm con của `AdminLayout`:

```javascript
{
  path: '/admin',
  element: <AdminLayout />,
  children: [
    { path: 'dashboard', element: <AdminDashboard /> },
    { path: 'add-product', element: <AddProduct /> },
    { path: 'edit-product/:id', element: <EditProduct /> },
    { path: 'orders', element: <ManageOrders /> },
    { path: 'categories', element: <ManageCategories /> },
    { path: 'promotions', element: <ManagePromotions /> },
    { path: 'statistics', element: <Statistics /> }
  ]
}
```

---

## 4. Các điểm tối ưu kỹ thuật

1. **Phân quyền tập trung:** `AdminLayout` thực hiện kiểm tra trạng thái đăng nhập và cờ `isAdmin` ngay từ tầng gốc. Nếu không phải Admin, tự động điều hướng về `/login`, loại bỏ sự trùng lặp kiểm tra quyền tại từng trang con.
2. **NavLink tự động highlight:** Menu Sidebar sử dụng `NavLink` của `react-router` để tự động kích hoạt class CSS `active` (nền xanh, chữ trắng) khi URL hiện tại khớp với đường dẫn menu.
3. **Tối ưu hóa mã nguồn (DRY):** Các trang chức năng con chỉ tập trung render nội dung nghiệp vụ của mình (nằm trong thẻ `div` đệm padding đơn giản) thay vì phải tự quản lý Sidebar và thẻ container `<main className="ml-64">`.
