const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');

describe('Promotion Model Validation', () => {
  const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_promotion_test?authSource=admin';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }
  });

  afterAll(async () => {
    await Promotion.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Promotion.deleteMany({});
  });

  // 1. Test trường hợp hợp lệ
  it('nên lưu thành công một promotion hợp lệ loại DISCOUNT', async () => {
    const promo = new Promotion({
      code: 'PROMO10',
      name: 'Giảm giá 10%',
      type: 'DISCOUNT',
      schedule: {
        startDate: new Date('2026-06-01T00:00:00'),
        endDate: new Date('2026-06-30T23:59:59'),
        timeSlots: [{ start: '09:00', end: '22:00' }],
        specificDates: ['2026-06-15', '06-20']
      },
      actions: {
        applyDiscountTo: 'ORDER_TOTAL',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 50000
      }
    });

    const saved = await promo.save();
    expect(saved.code).toBe('PROMO10');
    expect(saved.actions.applyDiscountTo).toBe('ORDER_TOTAL');
  });

  // 2. Test Lịch trình bắt đầu >= kết thúc
  it('nên báo lỗi nếu ngày bắt đầu lớn hơn hoặc bằng ngày kết thúc', async () => {
    const promo = new Promotion({
      code: 'PROMO_ERR_DATE',
      name: 'Lỗi lịch trình',
      type: 'DISCOUNT',
      schedule: {
        startDate: new Date('2026-06-30T00:00:00'),
        endDate: new Date('2026-06-01T00:00:00')
      },
      actions: {
        discountType: 'FIXED_AMOUNT',
        discountValue: 20000
      }
    });

    await expect(promo.save()).rejects.toThrow('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.');
  });

  // 3. Test Định dạng TimeSlot không hợp lệ
  it('nên báo lỗi nếu định dạng giờ của timeSlots sai cấu trúc HH:mm', async () => {
    const promo = new Promotion({
      code: 'PROMO_ERR_TIME',
      name: 'Lỗi khung giờ',
      type: 'DISCOUNT',
      schedule: {
        startDate: new Date('2026-06-01T00:00:00'),
        endDate: new Date('2026-06-30T23:59:59'),
        timeSlots: [{ start: '9:00', end: '22:00' }] // Phải là '09:00'
      },
      actions: {
        discountType: 'FIXED_AMOUNT',
        discountValue: 20000
      }
    });

    await expect(promo.save()).rejects.toThrow('Định dạng khung giờ không hợp lệ');
  });

  // 4. Test logic TimeSlot bắt đầu >= kết thúc
  it('nên báo lỗi nếu giờ bắt đầu lớn hơn hoặc bằng giờ kết thúc', async () => {
    const promo = new Promotion({
      code: 'PROMO_ERR_TIME_LOGIC',
      name: 'Lỗi khung giờ bắt đầu sau kết thúc',
      type: 'DISCOUNT',
      schedule: {
        startDate: new Date('2026-06-01T00:00:00'),
        endDate: new Date('2026-06-30T23:59:59'),
        timeSlots: [{ start: '22:00', end: '09:00' }]
      },
      actions: {
        discountType: 'FIXED_AMOUNT',
        discountValue: 20000
      }
    });

    await expect(promo.save()).rejects.toThrow('Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
  });

  // 5. Test bẫy cuộn ngày (ví dụ: ngày 30/02/2026 không tồn tại)
  it('nên báo lỗi khi cấu hình ngày cụ thể không tồn tại trong lịch pháp (Bẫy 30/02)', async () => {
    const promo = new Promotion({
      code: 'PROMO_ERR_REAL_DATE',
      name: 'Lỗi ngày ảo',
      type: 'DISCOUNT',
      schedule: {
        startDate: new Date('2026-06-01T00:00:00'),
        endDate: new Date('2026-06-30T23:59:59'),
        specificDates: ['2026-02-30'] // 30/02 không tồn tại
      },
      actions: {
        discountType: 'FIXED_AMOUNT',
        discountValue: 20000
      }
    });

    await expect(promo.save()).rejects.toThrow('Ngày không tồn tại trong lịch pháp: 2026-02-30 (Lỗi ngày không thực tế).');
  });

  // 6. Test định dạng ngày đặc biệt hợp lệ (ví dụ: năm nhuận 29-02)
  it('nên lưu thành công ngày 29-02 khi kiểm tra định dạng MM-DD cho năm nhuận', async () => {
    const promo = new Promotion({
      code: 'PROMO_LEAP_YEAR',
      name: 'Năm nhuận 29-02',
      type: 'DISCOUNT',
      schedule: {
        startDate: new Date('2026-06-01T00:00:00'),
        endDate: new Date('2026-06-30T23:59:59'),
        specificDates: ['02-29'] // Năm nhuận mặc định là 2024 nên sẽ pass
      },
      actions: {
        discountType: 'FIXED_AMOUNT',
        discountValue: 20000
      }
    });

    const saved = await promo.save();
    expect(saved.code).toBe('PROMO_LEAP_YEAR');
  });

  // 7. Test các ràng buộc logic của loại GIFT
  it('nên báo lỗi đối với loại GIFT khi không chọn sản phẩm quà tặng', async () => {
    const promo = new Promotion({
      code: 'PROMO_GIFT_ERR',
      name: 'Lỗi quà tặng',
      type: 'GIFT',
      schedule: {
        startDate: new Date('2026-06-01T00:00:00'),
        endDate: new Date('2026-06-30T23:59:59')
      },
      actions: {
        giftOptions: {
          selectableProducts: [], // Rỗng
          giftQuantity: 1
        }
      }
    });

    await expect(promo.save()).rejects.toThrow('Loại khuyến mãi GIFT yêu cầu phải chọn ít nhất một sản phẩm quà tặng');
  });

  // 8. Test các ràng buộc logic của loại DISCOUNT phần trăm > 100%
  it('nên báo lỗi khi loại DISCOUNT theo phần trăm vượt quá 100%', async () => {
    const promo = new Promotion({
      code: 'PROMO_PERCENT_ERR',
      name: 'Lỗi phần trăm',
      type: 'DISCOUNT',
      schedule: {
        startDate: new Date('2026-06-01T00:00:00'),
        endDate: new Date('2026-06-30T23:59:59')
      },
      actions: {
        discountType: 'PERCENTAGE',
        discountValue: 120
      }
    });

    await expect(promo.save()).rejects.toThrow('Giá trị giảm giá theo phần trăm không được vượt quá 100%');
  });
});
