const productRepository = require('../../repositories/product.repository');
const priceService = require('../promotion/price.service');
const { generateSlug } = require('../../utils/utils');
const logger = require('../../utils/logger');

class ProductService {
  async getHomePageData() {
    const [promoted, latest, bestSellers, mostViewed] = await Promise.all([
      productRepository.getPromotedProducts(),
      productRepository.getLatestProducts(10),
      productRepository.getBestSellers(10),
      productRepository.getMostViewed(10)
    ]);

    const [promotedWithPrice, latestWithPrice, bestSellersWithPrice, mostViewedWithPrice] = await Promise.all([
      priceService.getEffectivePrices(promoted),
      priceService.getEffectivePrices(latest),
      priceService.getEffectivePrices(bestSellers),
      priceService.getEffectivePrices(mostViewed)
    ]);

    return {
      promoted: promotedWithPrice,
      latest: latestWithPrice,
      bestSellers: bestSellersWithPrice,
      mostViewed: mostViewedWithPrice
    };
  }

  async getProductDetail(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new Error('Product not found');
    }

    // Tăng lượt xem bất đồng bộ (không đợi)
    productRepository.incrementViewCount(slug).catch(err => logger.error('View increment error:', err));

    const similarProducts = await productRepository.getSimilarProducts(
      product._id,
      product.categories.map(c => c._id || c),
      4
    );

    const [productWithPrice, similarProductsWithPrice] = await Promise.all([
      priceService.getEffectivePrices(product),
      priceService.getEffectivePrices(similarProducts)
    ]);

    // Tìm các chương trình khuyến mãi mua kèm áp dụng cho sản phẩm chính này
    const Promotion = require('../../models/Promotion');
    const now = new Date();
    const activeAddOnPromotions = await Promotion.find({
      isActive: true,
      'schedule.startDate': { $lte: now },
      'schedule.endDate': { $gte: now },
      'actions.applyDiscountTo': 'ADD_ON_ITEMS',
      'conditions.applicableProductIds': product._id
    }).populate('actions.addOnProductIds');

    // Tính toán giá phụ kiện khi mua kèm
    const addOnPromotionsWithPrices = await Promise.all(activeAddOnPromotions.map(async (promo) => {
      const rawAddOnProducts = promo.actions.addOnProductIds || [];
      const addOnProductsWithBasePrice = await priceService.getEffectivePrices(rawAddOnProducts);

      const addOnProductsWithAddOnPrice = addOnProductsWithBasePrice.map(p => {
        let addOnPrice = p.effectivePrice;
        if (promo.actions.discountType === 'PERCENTAGE') {
          addOnPrice = Math.max(0, p.price * (1 - promo.actions.discountValue / 100));
        } else if (promo.actions.discountType === 'FIXED_AMOUNT') {
          addOnPrice = Math.max(0, p.price - promo.actions.discountValue);
        }
        
        // Chuyển mongoose doc sang object và đính kèm addOnPrice, saving
        const pObj = typeof p.toObject === 'function' ? p.toObject() : p;
        return {
          ...pObj,
          addOnPrice,
          saving: p.price - addOnPrice
        };
      });

      return {
        _id: promo._id,
        code: promo.code,
        name: promo.name,
        discountType: promo.actions.discountType,
        discountValue: promo.actions.discountValue,
        maxAddOnQuantity: promo.actions.maxAddOnQuantity,
        addOnProducts: addOnProductsWithAddOnPrice
      };
    }));

    // Find if there is a reward rule for the main product
    const ProductRewardRule = require('../../models/ProductRewardRule');
    const rewardRule = await ProductRewardRule.findOne({ productId: product._id, isActive: true });
    
    // Ensure product is an object and assign rewardPoints
    const productWithReward = typeof productWithPrice.toObject === 'function' 
      ? productWithPrice.toObject() 
      : JSON.parse(JSON.stringify(productWithPrice));
      
    productWithReward.rewardPoints = rewardRule ? rewardRule.rewardPoints : 0;

    return {
      product: productWithReward,
      similarProducts: similarProductsWithPrice,
      addOnPromotions: addOnPromotionsWithPrices
    };
  }

  async searchProducts(filters, sort, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const data = await productRepository.searchAndFilter(filters, sort, skip, limit);
    data.products = await priceService.getEffectivePrices(data.products);
    return data;
  }

  async createProduct(productData) {
    const { stock, ...productRest } = productData;
    // Tự động tạo slug từ tên nếu chưa có
    if (!productRest.slug) {
      productRest.slug = generateSlug(productRest.name);
    }
    const product = await productRepository.create(productRest);
    const inventoryRepository = require('../../repositories/inventory.repository');
    await inventoryRepository.updateStock(product._id, stock !== undefined ? stock : 0);
    return product;
  }

  async updateProduct(id, productData) {
    const { stock, ...productRest } = productData;
    if (productRest.name && !productRest.slug) {
      productRest.slug = generateSlug(productRest.name);
    }
    const product = await productRepository.update(id, productRest);
    if (stock !== undefined && product) {
      const inventoryRepository = require('../../repositories/inventory.repository');
      await inventoryRepository.updateStock(product._id, stock);
    }
    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.delete(id);
    if (product) {
      const Inventory = require('../../models/Inventory');
      await Inventory.deleteOne({ productId: product._id });
    }
    return product;
  }
}

module.exports = new ProductService();
