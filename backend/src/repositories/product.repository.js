const Product = require('../models/Product');
const Category = require('../models/Category'); // Đảm bảo Category được đăng ký

class ProductRepository {
  async getPromotedProducts() {
    return await Product.find({ isPromoted: true, isActive: true })
      .populate('categories', 'name slug')
      .limit(5);
  }

  async getLatestProducts(limit = 8) {
    return await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('categories', 'name slug')
      .limit(limit);
  }

  async getBestSellers(limit = 10) {
    return await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .populate('categories', 'name slug')
      .limit(limit);
  }

  async getMostViewed(limit = 10) {
    return await Product.find({ isActive: true })
      .sort({ viewCount: -1 })
      .populate('categories', 'name slug')
      .limit(limit);
  }

  async incrementViewCount(idOrSlug) {
    const mongoose = require('mongoose');
    const query = {};
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      query._id = idOrSlug;
    } else {
      query.slug = idOrSlug;
    }
    return await Product.findOneAndUpdate(query, { $inc: { viewCount: 1 } }, { new: true });
  }

  async findById(id) {
    return await Product.findById(id).populate('categories', 'name slug');
  }

  async findBySlug(slug) {
    const mongoose = require('mongoose');
    const query = { isActive: true };
    
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query._id = slug;
    } else {
      query.slug = slug;
    }
    
    return await Product.findOne(query).populate('categories', 'name slug');
  }

  async getSimilarProducts(productId, categoryIds, limit = 4) {
    return await Product.find({
      categories: { $in: categoryIds },
      _id: { $ne: productId },
      isActive: true
    }).limit(limit).populate('categories', 'name slug');
  }

  async searchAndFilter(filters, sort = { createdAt: -1 }, skip = 0, limit = 20) {
    const query = { isActive: true };

    // Tìm kiếm theo tên (dùng regex linh hoạt hơn $text)
    if (filters.search && filters.search.trim()) {
      query.name = { $regex: filters.search.trim(), $options: 'i' };
    }

    // Lọc theo nhiều danh mục
    if (filters.category) {
      const categoryInputs = Array.isArray(filters.category) 
        ? filters.category 
        : filters.category.split(',').filter(Boolean);
      
      if (categoryInputs.length > 0) {
        const mongoose = require('mongoose');
        const categoryIds = [];
        const slugInputs = [];
        
        for (const input of categoryInputs) {
          if (mongoose.Types.ObjectId.isValid(input)) {
            categoryIds.push(input);
          } else if (input === 'khuyen-mai') {
            // Xử lý slug ảo: Khuyến mãi (lọc các sp có giá giảm)
            query.discountPrice = { $exists: true, $ne: null };
          } else if (input === 'ban-chay') {
            // Xử lý slug ảo: Bán chạy (thay đổi sort mặc định nếu chưa có sort cụ thể)
            if (!filters.sortBy) {
              sort = { soldCount: -1 };
            }
          } else {
            // Gom các slug thực tế lại để query 1 lần
            slugInputs.push(input);
          }
        }

        if (slugInputs.length > 0) {
          const categories = await Category.find({ slug: { $in: slugInputs } });
          categories.forEach(cat => categoryIds.push(cat._id));
        }

        if (categoryIds.length > 0) {
          query.categories = { $in: categoryIds };
        }
      }
    }

    // Lọc theo tags
    if (filters.tags) {
      const tags = Array.isArray(filters.tags)
        ? filters.tags
        : filters.tags.split(',').filter(Boolean);
      
      if (tags.length > 0) {
        // Tìm các sản phẩm có chứa ít nhất một trong các tag (dùng $in) 
        // hoặc chứa tất cả các tag (dùng $all). Ở đây dùng $in cho linh hoạt.
        query.tags = { $in: tags.map(t => t.toLowerCase()) };
      }
    }

    // Lọc theo đánh giá tối thiểu
    if (filters.rating && !isNaN(parseFloat(filters.rating))) {
      query.rating = { $gte: parseFloat(filters.rating) };
    }

    // Lọc theo khoảng giá (chỉ thêm nếu có giá trị thực)
    const minPrice = parseFloat(filters.minPrice);
    const maxPrice = parseFloat(filters.maxPrice);

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      query.price = {};
      if (!isNaN(minPrice)) query.price.$gte = minPrice;
      if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
    }

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('categories', 'name slug');

    const total = await Product.countDocuments(query);

    return { products, total };
  }

  async create(data) {
    const product = new Product(data);
    return await product.save();
  }

  async update(idOrSlug, data) {
    const mongoose = require('mongoose');
    const query = {};
    
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      query._id = idOrSlug;
    } else {
      query.slug = idOrSlug;
    }
    
    return await Product.findOneAndUpdate(query, data, { new: true });
  }

  async delete(idOrSlug) {
    const mongoose = require('mongoose');
    const query = {};
    
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      query._id = idOrSlug;
    } else {
      query.slug = idOrSlug;
    }
    
    return await Product.findOneAndDelete(query);
  }
}

module.exports = new ProductRepository();
