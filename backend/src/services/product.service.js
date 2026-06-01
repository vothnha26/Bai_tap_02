const productRepository = require('../repositories/product.repository');
const priceService = require('./price.service');
const { generateSlug } = require('../utils/utils');

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
    productRepository.incrementViewCount(slug).catch(err => console.error('View increment error:', err));

    const similarProducts = await productRepository.getSimilarProducts(
      product._id,
      product.categories.map(c => c._id || c),
      4
    );

    const [productWithPrice, similarProductsWithPrice] = await Promise.all([
      priceService.getEffectivePrices(product),
      priceService.getEffectivePrices(similarProducts)
    ]);

    return {
      product: productWithPrice,
      similarProducts: similarProductsWithPrice
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
    const inventoryRepository = require('../repositories/inventory.repository');
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
      const inventoryRepository = require('../repositories/inventory.repository');
      await inventoryRepository.updateStock(product._id, stock);
    }
    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.delete(id);
    if (product) {
      const Inventory = require('../models/Inventory');
      await Inventory.deleteOne({ productId: product._id });
    }
    return product;
  }
}

module.exports = new ProductService();
