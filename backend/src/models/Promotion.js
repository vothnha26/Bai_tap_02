const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  
  // Hỗ trợ mở rộng: DISCOUNT, GIFT, SHIPPING
  type: { 
    type: String, 
    enum: ['DISCOUNT', 'GIFT', 'SHIPPING'], 
    required: true 
  },

  conditions: {
    minOrderAmount: { type: Number, default: 0, min: 0 },
    applicableProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    matchType: { 
      type: String, 
      enum: ['ANY_COMBINATION', 'SINGLE_PRODUCT_MIN'], 
      default: 'ANY_COMBINATION' 
    },
    minQuantity: { type: Number, default: 1, min: 1 },
    userGroup: { type: String, enum: ['ALL', 'NEW_USER', 'VIP'], default: 'ALL' }
  },

  actions: {
    applyDiscountTo: { 
      type: String, 
      enum: ['ORDER_TOTAL', 'CHEAPEST_ITEM', 'MOST_EXPENSIVE_ITEM', 'SPECIFIC_ITEMS', 'SHIPPING_FEE'],
      default: 'ORDER_TOTAL' 
    },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'] },
    discountValue: { type: Number, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    maxAppliedItems: { type: Number, default: 1, min: 1 },

    giftOptions: {
      selectableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      giftQuantity: { type: Number, default: 1, min: 1 },
      isSameAsPurchase: { type: Boolean, default: false }
    }
  },

  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    timeSlots: [{ start: String, end: String }],
    specificDates: [String],
    excludeDates: [String]
  },

  priority: { type: Number, default: 0, min: 0 },
  isStackable: { type: Boolean, default: false },
  usageLimit: { type: Number, default: null, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// ==========================================
// --- CÁC HÀM VALIDATION ĐƠN NHIỆM (SOLID - SRP) ---
// ==========================================

/**
 * 1. Validate lịch trình tổng thể (startDate < endDate)
 */
function validateScheduleDates(startDate, endDate) {
  if (startDate >= endDate) {
    throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.');
  }
}

/**
 * 2. Validate định dạng và logic của các khung giờ (timeSlots)
 */
function validateTimeSlots(timeSlots) {
  if (!timeSlots || timeSlots.length === 0) return;
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/; // Format HH:mm (00:00 - 23:59)

  for (const slot of timeSlots) {
    if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
      throw new Error(`Định dạng khung giờ không hợp lệ: ${slot.start} - ${slot.end}. Định dạng đúng là HH:mm (Ví dụ: 09:30).`);
    }
    if (slot.start >= slot.end) {
      throw new Error(`Khung giờ không hợp lệ: ${slot.start} - ${slot.end}. Giờ bắt đầu phải nhỏ hơn giờ kết thúc.`);
    }
  }
}

/**
 * 3. Validate sự tồn tại thực tế của ngày (Tránh bẫy cuộn ngày 31/02 trong JS Date)
 */
function validateRealDates(dates) {
  if (!dates || dates.length === 0) return;
  const dateRegex = /^(\d{4}-)?(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  for (const dateStr of dates) {
    if (!dateRegex.test(dateStr)) {
      throw new Error(`Định dạng ngày không hợp lệ: ${dateStr}. Dùng YYYY-MM-DD hoặc MM-DD.`);
    }

    const parts = dateStr.split('-');
    const monthStr = parts[parts.length - 2];
    const dayStr = parts[parts.length - 1];
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    // Dùng năm 2024 làm năm nhuận mặc định để kiểm tra MM-DD (như 29-02)
    const checkYear = parts.length === 3 ? parts[0] : '2024';
    
    // Thêm T00:00:00 để ép hiểu theo giờ Local, tránh bẫy lệch múi giờ UTC
    const checkDate = new Date(`${checkYear}-${monthStr}-${dayStr}T00:00:00`);

    if (isNaN(checkDate.getTime())) {
      throw new Error(`Ngày không tồn tại trong lịch pháp: ${dateStr}`);
    }

    // Kiểm tra xem JS Date có tự động cuộn (roll over) ngày sang tháng sau hay không
    if (checkDate.getMonth() + 1 !== month || checkDate.getDate() !== day) {
      throw new Error(`Ngày không tồn tại trong lịch pháp: ${dateStr} (Lỗi ngày không thực tế).`);
    }
  }
}

/**
 * 4. Validate ràng buộc logic theo loại hình khuyến mãi (Promotion Type Rules)
 */
function validateTypeSpecificRules(p) {
  if (p.type === 'GIFT') {
    // Ép kiểu áp dụng và dọn dẹp các trường giảm giá tiền mặt/phần trăm
    p.actions.applyDiscountTo = 'SPECIFIC_ITEMS';
    p.actions.discountType = undefined;
    p.actions.discountValue = undefined;
    p.actions.maxDiscountAmount = undefined;

    // Bắt buộc phải có thông tin quà tặng hợp lệ
    const gift = p.actions.giftOptions;
    if (!gift || !gift.selectableProducts || gift.selectableProducts.length === 0) {
      throw new Error('Loại khuyến mãi GIFT yêu cầu phải chọn ít nhất một sản phẩm quà tặng (selectableProducts).');
    }
    if (gift.giftQuantity < 1) {
      throw new Error('Số lượng quà tặng (giftQuantity) phải tối thiểu là 1.');
    }
  } 
  
  else if (p.type === 'SHIPPING') {
    p.actions.applyDiscountTo = 'SHIPPING_FEE';
    p.actions.giftOptions = undefined;

    // Giảm phí vận chuyển vẫn cần giá trị giảm
    if (!p.actions.discountType || p.actions.discountValue === undefined) {
      throw new Error('Loại khuyến mãi SHIPPING yêu cầu phải cấu hình discountType và discountValue.');
    }
    validateDiscountValues(p.actions.discountType, p.actions.discountValue, p.actions.maxDiscountAmount);
  } 
  
  else if (p.type === 'DISCOUNT') {
    p.actions.giftOptions = undefined;

    // Giảm giá đơn hàng/sản phẩm bắt buộc phải có giá trị giảm
    if (!p.actions.discountType || p.actions.discountValue === undefined) {
      throw new Error('Loại khuyến mãi DISCOUNT yêu cầu phải cấu hình discountType và discountValue.');
    }
    validateDiscountValues(p.actions.discountType, p.actions.discountValue, p.actions.maxDiscountAmount);
  }
}

/**
 * Helper validate giá trị giảm giá dựa trên loại giảm giá
 */
function validateDiscountValues(discountType, discountValue, maxDiscountAmount) {
  if (discountValue <= 0) {
    throw new Error('Giá trị giảm giá (discountValue) phải lớn hơn 0.');
  }

  if (discountType === 'PERCENTAGE') {
    if (discountValue > 100) {
      throw new Error('Giá trị giảm giá theo phần trăm không được vượt quá 100%.');
    }
  } else if (discountType === 'FIXED_AMOUNT') {
    if (maxDiscountAmount !== undefined && maxDiscountAmount !== null) {
      throw new Error('Không cần thiết lập số tiền giảm tối đa (maxDiscountAmount) khi chọn loại giảm giá cố định (FIXED_AMOUNT).');
    }
  }
}

/**
 * 5. Validate các giới hạn số lượng và lượt sử dụng
 */
function validateLimits(p) {
  if (p.usageLimit !== null && p.usageLimit !== undefined) {
    if (p.usedCount > p.usageLimit) {
      throw new Error(`Số lượt đã sử dụng (${p.usedCount}) vượt quá giới hạn cho phép (${p.usageLimit}).`);
    }
  }
}

// --- MONGOOSE PRE-SAVE HOOK ---
promotionSchema.pre('save', function(next) {
  try {
    const p = this;

    // 1. Kiểm tra lịch trình tổng thể
    validateScheduleDates(p.schedule.startDate, p.schedule.endDate);

    // 2. Kiểm tra khung giờ hoạt động
    validateTimeSlots(p.schedule.timeSlots);

    // 3. Kiểm tra ngày thực tế (Tránh bẫy ngày 30/02, 31/04...)
    const allDates = [...(p.schedule.specificDates || []), ...(p.schedule.excludeDates || [])];
    validateRealDates(allDates);

    // 4. Kiểm tra các ràng buộc theo từng loại Promotion
    validateTypeSpecificRules(p);

    // 5. Kiểm tra giới hạn sử dụng
    validateLimits(p);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Promotion', promotionSchema);
