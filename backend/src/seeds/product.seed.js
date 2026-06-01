const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const connectDB = require('../config/mongoose');
const { generateSlug } = require('../utils/utils');

/**
 * BaseSeeder Class - Template Method Pattern
 */
class BaseSeeder {
  async run() {
    try {
      await this.connect();
      await this.clearData();
      await this.seedData();
      await this.disconnect();
      console.log(`${this.constructor.name} completed successfully!`);
      process.exit(0);
    } catch (error) {
      console.error(`Error in ${this.constructor.name}:`, error);
      process.exit(1);
    }
  }

  async connect() {
    console.log(`Connecting to database for ${this.constructor.name}...`);
    await connectDB();
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }

  async clearData() {
    throw new Error('Method clearData() must be implemented');
  }

  async seedData() {
    throw new Error('Method seedData() must be implemented');
  }
}

/**
 * ProductSeeder Class
 */
class ProductSeeder extends BaseSeeder {
  constructor() {
    super();
    // CHỈ CÓ CÁC DANH MỤC THỰC TẾ
    this.categories = [
      { name: 'Điện thoại & Tablet', slug: 'dien-thoai-tablet', description: 'Điện thoại di động, máy tính bảng' },
      { name: 'Laptop & PC', slug: 'laptop-pc', description: 'Máy tính xách tay và máy tính để bàn' },
      { name: 'Phụ kiện công nghệ', slug: 'phu-kien-cong-nghe', description: 'Tai nghe, chuột, bàn phím, sạc dự phòng' },
      { name: 'Thời trang Nam', slug: 'thoi-trang-nam', description: 'Quần áo, giày dép nam' },
      { name: 'Thời trang Nữ', slug: 'thoi-trang-nu', description: 'Quần áo, váy vóc nữ' },
      { name: 'Gia dụng & Đời sống', slug: 'gia-dung-doi-song', description: 'Đồ dùng nhà bếp, trang trí nhà cửa' },
      { name: 'Sách & Văn phòng phẩm', slug: 'sach-van-phong-pham', description: 'Sách giáo khoa, tiểu thuyết, dụng cụ học tập' }
    ];
  }

  async clearData() {
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    console.log('Cleared existing Category, Product and Inventory data.');
  }

  generateProducts(createdCategories) {
    const products = [];
    const catMap = {};
    createdCategories.forEach(c => catMap[c.slug] = c._id);

    const images = [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      'https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=800',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800'
    ];

    const productNames = [
      'iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra', 'MacBook Pro M3', 'Dell XPS 13', 
      'AirPods Pro 2', 'Sony WH-1000XM5', 'Logitech MX Master 3S', 'Razer DeathAdder V3',
      'Áo thun Cotton Premium', 'Quần Jean Slim Fit', 'Váy lụa sang trọng', 'Áo khoác Blazer',
      'Bàn phím cơ Custom', 'Màn hình 4K 144Hz', 'Nồi chiên không dầu', 'Máy hút bụi cầm tay',
      'Sách Đắc Nhân Tâm', 'Tiểu thuyết Nhà Giả Kim', 'Máy ảnh Sony A7IV', 'Lens 35mm f1.4',
      'Giá đỡ Laptop', 'Chuột không dây Silent', 'Tai nghe Gaming 7.1', 'Sạc dự phòng 20000mAh',
      'Balo chống nước', 'Đèn bàn thông minh', 'Máy massage cổ', 'Gối công thái học',
      'Bộ dao nhà bếp', 'Thớt gỗ Teak', 'Bình giữ nhiệt 1L', 'Cốc giữ nhiệt',
      'Sổ tay bìa da', 'Bút ký cao cấp', 'Kệ sách mini', 'Hộp cơm điện',
      'Máy xay sinh tố', 'Lò vi sóng 25L', 'Quạt đứng Inverter', 'Bàn là hơi nước',
      'Dép đi trong nhà', 'Khăn mặt cao cấp', 'Thảm trải sàn', 'Gương để bàn',
      'Hộp đựng giày', 'Móc treo đa năng', 'Kẹp tóc thủ công', 'Túi tote vải',
      'Ví da cầm tay', 'Thắt lưng da bò'
    ];

    for (let i = 0; i < 50; i++) {
      const name = productNames[i] || `Sản phẩm mẫu số ${i + 1}`;
      const slug = generateSlug(name) + `-${i + 1}`;

      const basePrice = 200000 + Math.floor(Math.random() * 20000000);

      // Đảm bảo ít nhất 15 sản phẩm đầu tiên có giảm giá để test mục Khuyến mãi
      const isDiscount = i < 15 || Math.random() > 0.5;
      const discountPrice = isDiscount ? Math.floor(basePrice * 0.8) : null;

      const rating = (4 + Math.random()).toFixed(1);

      // LOGIC ÉP DATA ĐỂ HIỂN THỊ TOP 10
      let soldCount, viewCount;

      if (i < 10) {
        // 10 sản phẩm đầu tiên là TOP BÁN CHẠY
        soldCount = 800 + (10 - i) * 20; // Giảm dần từ 1000 xuống
        viewCount = Math.floor(Math.random() * 500);
      } else if (i >= 10 && i < 20) {
        // 10 sản phẩm tiếp theo là TOP XEM NHIỀU
        soldCount = Math.floor(Math.random() * 100);
        viewCount = 4000 + (20 - i) * 100; // Giảm dần từ 5000 xuống
      } else {
        // Các sản phẩm còn lại ngẫu nhiên thấp hơn
        soldCount = Math.floor(Math.random() * 50);
        viewCount = Math.floor(Math.random() * 1000);
      }

      let cats = [];
      const mainCatIndex = Math.floor(i / (50 / this.categories.length));
      if (this.categories[mainCatIndex]) {
        cats.push(catMap[this.categories[mainCatIndex].slug]);
      }

      const initials = name.split(' ').map(w => w.charAt(0).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()).join('').substring(0, 4);
      const rand = Math.floor(1000 + Math.random() * 9000);
      const sku = `${initials || 'PROD'}-${rand}`;

      products.push({
        name,
        slug,
        sku,
        description: `Đây là mô tả chi tiết cho sản phẩm ${name}. Sản phẩm chất lượng cao, bảo hành 12 tháng, đổi trả trong 7 ngày nếu có lỗi từ nhà sản xuất.`,
        price: basePrice,
        discountPrice,
        images: [images[i % images.length]],
        stock: 10 + Math.floor(Math.random() * 100),
        soldCount,
        viewCount,
        rating: parseFloat(rating),
        reviews: Math.floor(Math.random() * 200),
        tags: isDiscount ? ['khuyến mãi', 'mới'] : ['mới'],
        isPromoted: i < 5,
        promotionText: i < 5 ? 'Giảm giá cực sốc hôm nay' : null,
        isActive: true,
        categories: cats
      });
    }
    return products;
  }

  async seedData() {
    const createdCategories = await Category.insertMany(this.categories);
    console.log(`Seeded ${createdCategories.length} REAL categories.`);

    const products = this.generateProducts(createdCategories);
    const createdProducts = await Product.insertMany(products);
    console.log(`Seeded ${createdProducts.length} products with stats (soldCount, viewCount).`);

    // Tạo bản ghi Inventory tương ứng cho mỗi sản phẩm mẫu
    const inventories = createdProducts.map(p => ({
      productId: p._id,
      stock: p.stock ?? 10,
      lowStockThreshold: 10,
      warehouseLocation: `Khu vực ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 10) + 1}`
    }));
    await Inventory.insertMany(inventories);
    console.log(`Seeded ${inventories.length} inventory records for products.`);
  }
}

new ProductSeeder().run();
