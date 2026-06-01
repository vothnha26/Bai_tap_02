# Thiết kế Hệ thống Giảm giá 2 Lớp (Double-Layer Discount)

Tài liệu này mô tả chi tiết thiết kế kỹ thuật của hệ thống giảm giá 2 lớp (Double-Layer Discount) được áp dụng trong ứng dụng TMĐT PubliCast, đảm bảo tính mở rộng (OCP), dễ bảo trì và tối ưu trải nghiệm khách hàng.

---

## 1. Tổng quan Kiến trúc Giảm giá

Hệ thống kết hợp hai lớp giảm giá độc lập nhằm tối ưu hóa các chiến dịch tiếp thị:

1. **Lớp 1 (Direct Product Discount - Giá Sale):** 
   * Áp dụng trực tiếp lên từng sản phẩm riêng lẻ.
   * Khách hàng thấy ngay giá gốc bị gạch đi và hiển thị giá bán thực tế (`effectivePrice`).
   * Quản lý bởi model `ProductDiscount` có cấu hình thời gian hiệu lực và loại giảm giá (phần trăm hoặc số tiền cố định).
2. **Lớp 2 (Cart Voucher/Promotion - Giảm giá giỏ hàng):**
   * Áp dụng trên tổng giỏ hàng hoặc các sản phẩm thỏa mãn điều kiện khi nhập mã Voucher.
   * Quản lý bởi model `Promotion`.

### Công thức tính toán giá cuối cùng:
$$\text{Giá cuối cùng của sản phẩm} = \text{Giá Sale L1 của sản phẩm (Effective Price)} - \text{Giảm giá từ Voucher L2 (nếu thỏa mãn)}$$

---

## 2. Thiết kế Cơ sở Dữ liệu

### Model `ProductDiscount`
Lưu trữ thông tin giảm giá trực tiếp cho sản phẩm.

```javascript
{
  productId: ObjectId,       // Liên kết tới Product
  discountType: String,      // PERCENTAGE | FIXED_AMOUNT
  discountValue: Number,     // Giá trị giảm (ví dụ: 10% hoặc 50,000₫)
  startDate: Date,           // Ngày bắt đầu áp dụng
  endDate: Date,             // Ngày kết thúc áp dụng
  isStackable: Boolean,      // Cho phép cộng dồn với Voucher L2 hay không
  isActive: Boolean          // Trạng thái kích hoạt thủ công
}
```

---

## 3. Quy tắc Cộng dồn (Stackable Rules)

Khi khách hàng nhập mã Voucher L2, hệ thống sẽ kiểm tra cờ `isStackable` của đợt giảm giá L1 đang áp dụng trên sản phẩm:

* **Trường hợp `isStackable = true` (Được cộng dồn):** 
  * Sản phẩm đó sẽ được tiếp tục giảm giá bởi Voucher L2. Giá trị giảm của Voucher L2 sẽ được tính toán trên giá đã sale (`effectivePrice`) chứ không phải giá gốc.
* **Trường hợp `isStackable = false` (Không được cộng dồn):** 
  * Sản phẩm đó sẽ bị loại trừ khỏi phạm vi giảm giá của Voucher L2. Khách hàng chỉ được hưởng giá sale L1, Voucher L2 không có tác dụng trên sản phẩm này.

---

## 4. Áp dụng Design Patterns

### A. Facade Pattern (`PromotionCalculatorFacade`)
Để tránh việc các controller (như `CartController`, `OrderController`) phải gọi trực tiếp nhiều service phức tạp và tự tính toán logic khuyến mãi, hệ thống sử dụng một lớp **Facade** làm cổng giao tiếp duy nhất:
* Gộp các bước: Lấy thông tin sản phẩm -> Tính giá Sale thực tế (`PriceService`) -> Kiểm tra điều kiện Voucher L2 -> Áp dụng quy tắc Stackable -> Tính toán tổng tiền cuối cùng.

### B. Strategy Pattern (Cách tính toán giảm giá)
Được triển khai ngầm định thông qua các bộ xử lý tính toán dựa trên loại giảm giá (`PERCENTAGE`, `FIXED_AMOUNT`) để tính toán số tiền giảm thực tế độc lập, giúp dễ dàng bổ sung các loại giảm giá mới trong tương lai (như đồng giá, mua 1 tặng 1) mà không làm ảnh hưởng đến luồng code chính.

---

## 5. Luồng hoạt động (Sequence Diagram)

Xem chi tiết sơ đồ tuần tự tại file: [double-layer-discount-sequence.puml](./double-layer-discount-sequence.puml)
