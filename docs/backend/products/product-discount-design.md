# Thiết kế Hệ thống Giảm giá Trực tiếp Sản phẩm (Product Discount - L1)

Tài liệu này mô tả chi tiết cách thức thiết lập và tính toán giảm giá trực tiếp cấp 1 (L1) trên sản phẩm, bao gồm trải nghiệm tương tác hai chiều tại giao diện Admin và cơ chế đồng bộ dữ liệu.

---

## 1. Thiết kế Giao diện cấu hình Giảm giá (UI UX)

Trang Thêm và Chỉnh sửa sản phẩm (`AddProduct.jsx` & `EditProduct.jsx`) được tích hợp các trường cấu hình giảm giá trực quan:
* **Loại giảm giá (`discountType`):** `PERCENTAGE` (Phần trăm) hoặc `FIXED_AMOUNT` (Số tiền cố định).
* **Giá trị giảm (`discountValue`):** Nhập mức giảm tương ứng.
* **Thời gian áp dụng:** Ngày bắt đầu (`startDate`) và Ngày kết thúc (`endDate`).
* **Cộng dồn Voucher (`isStackable`):** Cờ cho phép áp dụng voucher L2 chung với sản phẩm này hay không.
* **Giá sau giảm mong muốn (`salePrice` - Ô nhập ảo):** Hiển thị và tính toán giá bán thực tế tạm thời để Admin dễ hình dung.

---

## 2. Logic Tính toán và Đồng bộ Hai chiều (Bidirectional Pricing Sync)

Để tối ưu hóa trải nghiệm quản trị, hệ thống tự động đồng bộ giá trị giữa các ô nhập theo thời gian thực:

### Công thức đồng bộ:

* **Trường hợp Loại PERCENTAGE (%):**
  * *Hướng xuôi (Nhập %):* $\text{Giá sau giảm} = \text{Giá gốc} \times (1 - \frac{\text{Phần trăm giảm}}{100})$
  * *Hướng ngược (Nhập Giá sau giảm):* $\text{Phần trăm giảm} = \text{Round}\left( \frac{\text{Giá gốc} - \text{Giá sau giảm}}{\text{Giá gốc}} \times 100 \right)$

* **Trường hợp Loại FIXED_AMOUNT (₫):**
  * *Hướng xuôi (Nhập số tiền giảm):* $\text{Giá sau giảm} = \text{Giá gốc} - \text{Số tiền giảm}$
  * *Hướng ngược (Nhập Giá sau giảm):* $\text{Số tiền giảm} = \text{Giá gốc} - \text{Giá sau giảm}$

Mã nguồn xử lý đồng bộ được đặt trong `useEffect` và trình bắt sự kiện `onChange` tại các component form, giúp loại bỏ việc Admin phải tự bấm máy tính bên ngoài để tính toán.

---

## 3. Quy trình lưu trữ tại Backend

Khi gửi request lên server:
1. Dữ liệu giảm giá (`discountType`, `discountValue`, `startDate`, `endDate`, `isStackable`) được gửi cùng body của sản phẩm.
2. Tại `ProductService.js`, hệ thống kiểm tra nếu có thông tin giảm giá hợp lệ, sẽ tiến hành tạo mới hoặc cập nhật bản ghi trong bảng `ProductDiscount` liên kết với `productId`.
3. Nếu các trường giảm giá trống hoặc đợt giảm giá bị tắt, hệ thống sẽ xóa hoặc hủy kích hoạt đợt giảm giá cũ của sản phẩm đó trong database.

Sơ đồ chi tiết luồng xử lý: [product-discount-sequence.puml](./product-discount-sequence.puml)
