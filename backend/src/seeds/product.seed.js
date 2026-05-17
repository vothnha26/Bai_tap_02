const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');
const Product = require('../models/Product');
const connectDB = require('../config/mongoose');

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
    this.categories = [
      { name: 'Điện tử', slug: 'electronics', description: 'Thiết bị công nghệ cao' },
      { name: 'Thời trang', slug: 'clothing', description: 'Quần áo và phụ kiện' },
      { name: 'Đồ gia dụng', slug: 'home-kitchen', description: 'Tiện nghi cho gia đình' },
      { name: 'Sách', slug: 'books', description: 'Tri thức cho mọi người' },
      { name: 'Khuyến mãi', slug: 'khuyen-mai', description: 'Các sản phẩm đang giảm giá hot' },
      { name: 'Bán chạy', slug: 'ban-chay', description: 'Sản phẩm được yêu thích nhất' }
    ];

    this.products = [
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'iPhone mới nhất với khung viền Titanium và chip A17 Pro siêu mạnh mẽ.',
        price: 28990000,
        discountPrice: 26500000,
        images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800'],
        stock: 50,
        soldCount: 120,
        rating: 4.8,
        reviews: 45,
        tags: ['mới', 'khuyến mãi', 'bán chạy'],
        isPromoted: true,
        promotionText: 'Flash Sale - Giảm ngay 2.5 triệu',
        isActive: true
      },
      {
        name: 'MacBook Air M2',
        slug: 'macbook-air-m2',
        description: 'Thiết kế mỏng nhẹ đẳng cấp, hiệu năng vượt trội với chip Apple M2.',
        price: 32990000,
        discountPrice: 27900000,
        images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800'],
        stock: 30,
        soldCount: 85,
        rating: 4.9,
        reviews: 32,
        tags: ['mới', 'khuyến mãi'],
        isPromoted: true,
        promotionText: 'Ưu đãi mùa hè - Tặng kèm túi chống sốc',
        isActive: true
      },
      {
        name: 'Sony WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        description: 'Tai nghe chống ồn hàng đầu thế giới với âm thanh chân thực nhất.',
        price: 8490000,
        images: ['https://images.unsplash.com/photo-1670057037325-1011689df96c?auto=format&fit=crop&q=80&w=800'],
        stock: 100,
        soldCount: 245,
        rating: 4.7,
        reviews: 128,
        tags: ['bán chạy'],
        isPromoted: false,
        isActive: true
      },
      {
        name: 'Áo khoác da Bomber',
        slug: 'leather-jacket',
        description: 'Chất liệu da cao cấp, kiểu dáng thời thượng cho nam giới.',
        price: 1500000,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800'],
        stock: 25,
        soldCount: 15,
        rating: 4.5,
        reviews: 8,
        tags: ['mới'],
        isPromoted: false,
        isActive: true
      },
      {
        name: 'Máy pha Cà phê Espresso',
        slug: 'coffee-maker',
        description: 'Tự động pha espresso tại nhà với lớp bọt sữa hoàn hảo.',
        price: 4500000,
        discountPrice: 3900000,
        images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&q=80&w=800'],
        stock: 40,
        soldCount: 60,
        rating: 4.3,
        reviews: 24,
        tags: ['khuyến mãi'],
        isPromoted: false,
        isActive: true
      },
      {
        name: 'Smart Watch Series 9',
        slug: 'smart-watch-s9',
        description: 'Theo dõi sức khỏe nâng cao và hỗ trợ tập luyện chuyên nghiệp.',
        price: 10500000,
        images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800'],
        stock: 5,
        soldCount: 500,
        rating: 4.9,
        reviews: 312,
        tags: ['bán chạy', 'mới'],
        isPromoted: false,
        isActive: true
      }
    ];
  }

  async clearData() {
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing Category and Product data.');
  }

  async seedData() {
    const createdCategories = await Category.insertMany(this.categories);
    console.log(`Seeded ${createdCategories.length} categories.`);

    const productsToSeed = this.products.map((product, index) => {
      let categoryIds = [];
      
      // Phân bổ danh mục
      if (index < 3) categoryIds.push(createdCategories[0]._id); // Điện tử
      else if (index === 3) categoryIds.push(createdCategories[1]._id); // Thời trang
      else if (index === 4) categoryIds.push(createdCategories[2]._id); // Gia dụng
      else categoryIds.push(createdCategories[0]._id);

      // Thêm danh mục đặc biệt dựa trên tags
      if (product.tags.includes('khuyến mãi')) categoryIds.push(createdCategories[4]._id);
      if (product.tags.includes('bán chạy')) categoryIds.push(createdCategories[5]._id);

      return { ...product, categories: categoryIds };
    });

    const createdProducts = await Product.insertMany(productsToSeed);
    console.log(`Seeded ${createdProducts.length} products.`);
  }
}

new ProductSeeder().run();
