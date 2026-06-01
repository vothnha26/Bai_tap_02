const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/mongoose');
const Promotion = require('../models/Promotion');
const Product = require('../models/Product');
const Category = require('../models/Category');

class PromotionSeeder {
  async run() {
    try {
      console.log('Connecting to database for PromotionSeeder...');
      await connectDB();

      await this.clearData();
      await this.seedData();

      await mongoose.disconnect();
      console.log('Disconnected from MongoDB. PromotionSeeder completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Error in PromotionSeeder:', error);
      process.exit(1);
    }
  }

  async clearData() {
    await Promotion.deleteMany({});
    console.log('Cleared existing Promotion data.');
  }

  async seedData() {
    // Lấy các sản phẩm và danh mục thực tế từ DB để liên kết điều kiện
    const products = await Product.find({});
    const categories = await Category.find({});

    if (products.length === 0 || categories.length === 0) {
      console.error('⚠️ [Warning] Products or Categories collection is empty. Please run product seeder first (npm run seed:product).');
      return;
    }

    const phoneCat = categories.find(c => c.slug === 'dien-thoai-tablet') || categories[0];
    const accessoryCat = categories.find(c => c.slug === 'phu-kien-cong-nghe') || categories[0];

    const iphone = products.find(p => p.name.includes('iPhone')) || products[0];
    const airpods = products.find(p => p.name.includes('AirPods')) || products[1];
    const laptop = products.find(p => p.name.includes('MacBook') || p.name.includes('Dell')) || products[2];
    const mouse = products.find(p => p.name.includes('Logitech') || p.name.includes('Razer')) || products[3];

    const now = new Date();
    const startYear = now.getFullYear();

    const promotions = [
      // Case 1: Giảm giá phần trăm cho toàn bộ đơn hàng
      {
        code: 'SUMMER10',
        name: 'Ưu đãi hè rực rỡ - Giảm 10% tổng đơn',
        type: 'DISCOUNT',
        conditions: {
          minOrderAmount: 500000, // Đơn từ 500.000đ
          applicableProductIds: [],
          applicableCategoryIds: [],
          matchType: 'ANY_COMBINATION',
          minQuantity: 1,
          userGroup: 'ALL'
        },
        actions: {
          applyDiscountTo: 'ORDER_TOTAL',
          discountType: 'PERCENTAGE',
          discountValue: 10, // Giảm 10%
          maxDiscountAmount: 150000 // Tối đa giảm 150.000đ
        },
        schedule: {
          startDate: new Date(`${startYear}-01-01T00:00:00`),
          endDate: new Date(`${startYear}-12-31T23:59:59`),
          daysOfWeek: [], // Áp dụng tất cả các ngày
          timeSlots: [],   // Áp dụng 24/24
          specificDates: [],
          excludeDates: []
        },
        priority: 10,
        isStackable: true,
        usageLimit: 1000,
        usedCount: 0,
        isActive: true
      },

      // Case 2: Giảm giá tiền mặt cố định cho đơn hàng
      {
        code: 'WELCOME50',
        name: 'Chào mừng bạn mới - Giảm ngay 50.000đ',
        type: 'DISCOUNT',
        conditions: {
          minOrderAmount: 200000,
          applicableProductIds: [],
          applicableCategoryIds: [],
          matchType: 'ANY_COMBINATION',
          minQuantity: 1,
          userGroup: 'NEW_USER' // Chỉ áp dụng cho khách mới
        },
        actions: {
          applyDiscountTo: 'ORDER_TOTAL',
          discountType: 'FIXED_AMOUNT',
          discountValue: 50000 // Giảm 50k
        },
        schedule: {
          startDate: new Date(`${startYear}-01-01T00:00:00`),
          endDate: new Date(`${startYear}-12-31T23:59:59`),
          daysOfWeek: [],
          timeSlots: [],
          specificDates: [],
          excludeDates: []
        },
        priority: 5,
        isStackable: false,
        usageLimit: 500,
        usedCount: 0,
        isActive: true
      },

      // Case 3: Flash Sale Giờ Vàng (Thời gian áp dụng 12:00 - 14:00 và 20:00 - 22:00)
      {
        code: 'GOLDENHOUR',
        name: 'Giờ Vàng Săn Deal - Giảm 20% cho Phụ kiện',
        type: 'DISCOUNT',
        conditions: {
          minOrderAmount: 0,
          applicableProductIds: [],
          applicableCategoryIds: [accessoryCat._id], // Chỉ áp dụng cho phụ kiện
          matchType: 'ANY_COMBINATION',
          minQuantity: 1,
          userGroup: 'ALL'
        },
        actions: {
          applyDiscountTo: 'SPECIFIC_ITEMS',
          discountType: 'PERCENTAGE',
          discountValue: 20, // Giảm 20%
          maxDiscountAmount: 50000
        },
        schedule: {
          startDate: new Date(`${startYear}-01-01T00:00:00`),
          endDate: new Date(`${startYear}-12-31T23:59:59`),
          daysOfWeek: [],
          timeSlots: [
            { start: '12:00', end: '14:00' },
            { start: '20:00', end: '22:00' }
          ],
          specificDates: [],
          excludeDates: []
        },
        priority: 20,
        isStackable: true,
        usageLimit: 200,
        usedCount: 0,
        isActive: true
      },

      // Case 4: Mua Điện thoại / iPhone tặng kèm AirPods (Khuyến mãi quà tặng GIFT)
      {
        code: 'PHONEGIFT',
        name: 'Mua Điện thoại xịn - Nhận ngay AirPods Pro',
        type: 'GIFT',
        conditions: {
          minOrderAmount: 0,
          applicableProductIds: [iphone._id], // Khi mua iPhone
          applicableCategoryIds: [],
          matchType: 'SINGLE_PRODUCT_MIN',
          minQuantity: 1,
          userGroup: 'ALL'
        },
        actions: {
          applyDiscountTo: 'ORDER_TOTAL',
          discountType: 'PERCENTAGE',
          discountValue: 0,
          giftOptions: {
            selectableProducts: [airpods._id], // Tặng AirPods Pro
            giftQuantity: 1,
            isSameAsPurchase: false
          }
        },
        schedule: {
          startDate: new Date(`${startYear}-01-01T00:00:00`),
          endDate: new Date(`${startYear}-12-31T23:59:59`),
          daysOfWeek: [],
          timeSlots: [],
          specificDates: [],
          excludeDates: []
        },
        priority: 15,
        isStackable: true,
        usageLimit: 50,
        usedCount: 0,
        isActive: true
      },

      // Case 5: Mua Laptop tặng Chuột (Khuyến mãi Mua A tặng B)
      {
        code: 'LAPTOPCOMBO',
        name: 'Đồng hành mùa tựu trường - Mua Laptop tặng Chuột cực chất',
        type: 'GIFT',
        conditions: {
          minOrderAmount: 0,
          applicableProductIds: [laptop._id],
          applicableCategoryIds: [],
          matchType: 'SINGLE_PRODUCT_MIN',
          minQuantity: 1,
          userGroup: 'ALL'
        },
        actions: {
          applyDiscountTo: 'ORDER_TOTAL',
          discountType: 'PERCENTAGE',
          discountValue: 0,
          giftOptions: {
            selectableProducts: [mouse._id],
            giftQuantity: 1,
            isSameAsPurchase: false
          }
        },
        schedule: {
          startDate: new Date(`${startYear}-01-01T00:00:00`),
          endDate: new Date(`${startYear}-12-31T23:59:59`),
          daysOfWeek: [],
          timeSlots: [],
          specificDates: [],
          excludeDates: []
        },
        priority: 14,
        isStackable: true,
        usageLimit: 100,
        usedCount: 0,
        isActive: true
      },

      // Case 6: Miễn phí vận chuyển (SHIPPING)
      {
        code: 'FREESHIP',
        name: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 1.000.000đ',
        type: 'SHIPPING',
        conditions: {
          minOrderAmount: 1000000,
          applicableProductIds: [],
          applicableCategoryIds: [],
          matchType: 'ANY_COMBINATION',
          minQuantity: 1,
          userGroup: 'ALL'
        },
        actions: {
          applyDiscountTo: 'ORDER_TOTAL',
          discountType: 'PERCENTAGE',
          discountValue: 100 // Giảm 100% phí ship
        },
        schedule: {
          startDate: new Date(`${startYear}-01-01T00:00:00`),
          endDate: new Date(`${startYear}-12-31T23:59:59`),
          daysOfWeek: [],
          timeSlots: [],
          specificDates: [],
          excludeDates: []
        },
        priority: 2,
        isStackable: true,
        usageLimit: 5000,
        usedCount: 0,
        isActive: true
      },

      // Case 7: Giảm 50% cho sản phẩm RẺ NHẤT trong giỏ hàng (áp dụng khi giỏ có từ 3 sản phẩm trở lên)
      {
        code: 'SAVEHALF',
        name: 'Ngày hội mua sắm - Giảm 50% cho sản phẩm có giá trị thấp nhất',
        type: 'DISCOUNT',
        conditions: {
          minOrderAmount: 0,
          applicableProductIds: [],
          applicableCategoryIds: [],
          matchType: 'ANY_COMBINATION',
          minQuantity: 3, // Giỏ có từ 3 món trở lên
          userGroup: 'ALL'
        },
        actions: {
          applyDiscountTo: 'CHEAPEST_ITEM', // Giảm món rẻ nhất
          discountType: 'PERCENTAGE',
          discountValue: 50 // Giảm 50%
        },
        schedule: {
          startDate: new Date(`${startYear}-01-01T00:00:00`),
          endDate: new Date(`${startYear}-12-31T23:59:59`),
          daysOfWeek: [],
          timeSlots: [],
          specificDates: [],
          excludeDates: []
        },
        priority: 12,
        isStackable: true,
        usageLimit: 300,
        usedCount: 0,
        isActive: true
      },

      // Case 8: Cuối tuần vui vẻ - Giảm 15% (Chỉ áp dụng vào Thứ 7 và Chủ nhật)
      {
        code: 'WEEKEND15',
        name: 'Weekend Party - Giảm 15% tổng đơn vào cuối tuần',
        type: 'DISCOUNT',
        conditions: {
          minOrderAmount: 400000,
          applicableProductIds: [],
          applicableCategoryIds: [],
          matchType: 'ANY_COMBINATION',
          minQuantity: 1,
          userGroup: 'ALL'
        },
        actions: {
          applyDiscountTo: 'ORDER_TOTAL',
          discountType: 'PERCENTAGE',
          discountValue: 15,
          maxDiscountAmount: 100000
        },
        schedule: {
          startDate: new Date(`${startYear}-01-01T00:00:00`),
          endDate: new Date(`${startYear}-12-31T23:59:59`),
          daysOfWeek: [0, 6], // Chủ nhật (0) và Thứ Bảy (6)
          timeSlots: [],
          specificDates: [],
          excludeDates: []
        },
        priority: 8,
        isStackable: true,
        usageLimit: 1000,
        usedCount: 0,
        isActive: true
      },

      // Case 9: Mua iPhone kèm phụ kiện giảm 50% (ADDON50)
      {
        code: 'ADDON50',
        name: 'Mua iPhone kèm phụ kiện giảm 50%',
        type: 'DISCOUNT',
        conditions: {
          minOrderAmount: 0,
          applicableProductIds: [iphone._id],
          applicableCategoryIds: [],
          matchType: 'ANY_COMBINATION',
          minQuantity: 1,
          userGroup: 'ALL'
        },
        actions: {
          applyDiscountTo: 'ADD_ON_ITEMS',
          discountType: 'PERCENTAGE',
          discountValue: 50,
          addOnProductIds: [airpods._id, mouse._id], // AirPods hoặc Chuột
          maxAddOnQuantity: 1
        },
        schedule: {
          startDate: new Date(`${startYear}-01-01T00:00:00`),
          endDate: new Date(`${startYear}-12-31T23:59:59`),
          daysOfWeek: [],
          timeSlots: [],
          specificDates: [],
          excludeDates: []
        },
        priority: 15,
        isStackable: true,
        usageLimit: 500,
        usedCount: 0,
        isActive: true
      }
    ];

    const created = await Promotion.insertMany(promotions);
    console.log(`Successfully seeded ${created.length} diverse promotion templates into MongoDB!`);
  }
}

new PromotionSeeder().run();
