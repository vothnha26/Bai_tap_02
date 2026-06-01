const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');
const Product = require('../models/Product');
const promotionCalculator = require('../services/promotion/promotion.facade');

describe('Add-on Discount Promotion Testing', () => {
  const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_promotion_test?authSource=admin';

  let primaryProduct;
  let addOnProduct1;
  let addOnProduct2;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }
    await Product.deleteMany({});
    await Promotion.deleteMany({});

    // Tạo sản phẩm giả lập
    primaryProduct = await Product.create({
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      sku: 'IP15-PM01',
      description: 'Flagship phone from Apple',
      price: 30000000,
      stock: 10
    });

    addOnProduct1 = await Product.create({
      name: 'Ốp lưng Silicon MagSafe',
      slug: 'op-lung-silicon-magsafe',
      sku: 'CASE-MS01',
      description: 'Silicon case with MagSafe',
      price: 1500000,
      stock: 20
    });

    addOnProduct2 = await Product.create({
      name: 'Củ sạc nhanh 20W',
      slug: 'cu-sac-nhanh-20w',
      sku: 'CHARGER-20W',
      description: 'Fast charger 20W USB-C',
      price: 500000,
      stock: 15
    });
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await Promotion.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Promotion.deleteMany({});
  });

  describe('1. Model Schema Validation', () => {
    it('nên báo lỗi nếu loại ADD_ON_ITEMS thiếu sản phẩm chính (applicableProductIds)', async () => {
      const promo = new Promotion({
        code: 'ADDON_ERR_PRIMARY',
        name: 'Mua kèm giảm sâu thiếu sản phẩm chính',
        type: 'DISCOUNT',
        schedule: {
          startDate: new Date('2026-06-01T00:00:00'),
          endDate: new Date('2026-06-30T23:59:59')
        },
        actions: {
          applyDiscountTo: 'ADD_ON_ITEMS',
          discountType: 'PERCENTAGE',
          discountValue: 50,
          addOnProductIds: [addOnProduct1._id],
          maxAddOnQuantity: 1
        }
      });

      await expect(promo.save()).rejects.toThrow('Khuyến mãi mua kèm (ADD_ON_ITEMS) yêu cầu phải thiết lập sản phẩm chính');
    });

    it('nên báo lỗi nếu loại ADD_ON_ITEMS thiếu sản phẩm phụ mua kèm (addOnProductIds)', async () => {
      const promo = new Promotion({
        code: 'ADDON_ERR_ADDON',
        name: 'Mua kèm giảm sâu thiếu sản phẩm phụ',
        type: 'DISCOUNT',
        schedule: {
          startDate: new Date('2026-06-01T00:00:00'),
          endDate: new Date('2026-06-30T23:59:59')
        },
        actions: {
          applyDiscountTo: 'ADD_ON_ITEMS',
          discountType: 'PERCENTAGE',
          discountValue: 50,
          addOnProductIds: [], // Rỗng
          maxAddOnQuantity: 1
        },
        conditions: {
          applicableProductIds: [primaryProduct._id]
        }
      });

      await expect(promo.save()).rejects.toThrow('Khuyến mãi mua kèm (ADD_ON_ITEMS) yêu cầu phải thiết lập sản phẩm phụ mua kèm');
    });

    it('nên lưu thành công khuyến mãi mua kèm hợp lệ', async () => {
      const promo = new Promotion({
        code: 'IPHONE_ADDON',
        name: 'Mua iPhone kèm phụ kiện giảm 50%',
        type: 'DISCOUNT',
        schedule: {
          startDate: new Date('2026-06-01T00:00:00'),
          endDate: new Date('2026-06-30T23:59:59')
        },
        actions: {
          applyDiscountTo: 'ADD_ON_ITEMS',
          discountType: 'PERCENTAGE',
          discountValue: 50,
          addOnProductIds: [addOnProduct1._id, addOnProduct2._id],
          maxAddOnQuantity: 1
        },
        conditions: {
          applicableProductIds: [primaryProduct._id]
        }
      });

      const saved = await promo.save();
      expect(saved.code).toBe('IPHONE_ADDON');
      expect(saved.actions.addOnProductIds.length).toBe(2);
      expect(saved.actions.maxAddOnQuantity).toBe(1);
    });
  });

  describe('2. Promotion Application Logic (Facade & Strategy Integration)', () => {
    let promotion;

    beforeEach(async () => {
      promotion = await Promotion.create({
        code: 'IPHONE_ADDON',
        name: 'Mua iPhone kèm phụ kiện giảm 50%',
        type: 'DISCOUNT',
        schedule: {
          startDate: new Date('2026-06-01T00:00:00'),
          endDate: new Date('2026-06-30T23:59:59')
        },
        actions: {
          applyDiscountTo: 'ADD_ON_ITEMS',
          discountType: 'PERCENTAGE',
          discountValue: 50,
          addOnProductIds: [addOnProduct1._id, addOnProduct2._id],
          maxAddOnQuantity: 1
        },
        conditions: {
          applicableProductIds: [primaryProduct._id]
        }
      });
    });

    it('không giảm giá nếu giỏ hàng chỉ có sản phẩm phụ mà không có sản phẩm chính', async () => {
      const items = [
        {
          productId: addOnProduct1._id,
          quantity: 1,
          price: addOnProduct1.price
        }
      ];

      const result = await promotionCalculator.calculate(promotion, items, null);
      expect(result.isValid).toBe(false);
      expect(result.discountAmount).toBeUndefined();
    });

    it('không giảm giá nếu giỏ hàng chỉ có sản phẩm chính mà không có sản phẩm phụ', async () => {
      const items = [
        {
          productId: primaryProduct._id,
          quantity: 1,
          price: primaryProduct.price
        }
      ];

      const result = await promotionCalculator.calculate(promotion, items, null);
      // Giỏ hàng có sản phẩm chính nhưng không chứa sản phẩm phụ để giảm giá
      expect(result.isValid).toBe(true);
      expect(result.discountAmount).toBe(0);
    });

    it('giảm giá chính xác 50% cho 1 sản phẩm phụ khi mua kèm 1 sản phẩm chính', async () => {
      const items = [
        {
          productId: primaryProduct._id,
          quantity: 1,
          price: primaryProduct.price
        },
        {
          productId: addOnProduct1._id,
          quantity: 1,
          price: addOnProduct1.price // 1,500,000
        }
      ];

      const result = await promotionCalculator.calculate(promotion, items, null);
      expect(result.isValid).toBe(true);
      expect(result.discountAmount).toBe(750000); // 50% của 1,500,000
    });

    it('chỉ giảm giá tối đa 1 sản phẩm phụ (maxAddOnQuantity = 1) đắt tiền nhất khi mua kèm 1 sản phẩm chính', async () => {
      const items = [
        {
          productId: primaryProduct._id,
          quantity: 1,
          price: primaryProduct.price
        },
        {
          productId: addOnProduct1._id,
          quantity: 1,
          price: addOnProduct1.price // 1,500,000 (đắt hơn)
        },
        {
          productId: addOnProduct2._id,
          quantity: 1,
          price: addOnProduct2.price // 500,000 (rẻ hơn)
        }
      ];

      const result = await promotionCalculator.calculate(promotion, items, null);
      expect(result.isValid).toBe(true);
      // Chỉ ốp lưng được giảm 50% (750,000), củ sạc 500,000 giữ nguyên giá gốc
      expect(result.discountAmount).toBe(750000);
    });

    it('giảm giá 2 sản phẩm phụ khi mua kèm 2 sản phẩm chính (maxAddOnQuantity = 1, slots = 2)', async () => {
      const items = [
        {
          productId: primaryProduct._id,
          quantity: 2, // Mua 2 điện thoại
          price: primaryProduct.price
        },
        {
          productId: addOnProduct1._id,
          quantity: 1,
          price: addOnProduct1.price // 1,500,000 -> Giảm 750,000
        },
        {
          productId: addOnProduct2._id,
          quantity: 1,
          price: addOnProduct2.price // 500,000 -> Giảm 250,000
        }
      ];

      const result = await promotionCalculator.calculate(promotion, items, null);
      expect(result.isValid).toBe(true);
      // Cả 2 phụ kiện đều được giảm giá (Tổng giảm = 750,000 + 250,000 = 1,000,000)
      expect(result.discountAmount).toBe(1000000);
    });
  });
});
