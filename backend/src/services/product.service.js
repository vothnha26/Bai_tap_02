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
    // Tự động tạo slug từ tên nếu chưa có
    if (!productData.slug) {
      productData.slug = generateSlug(productData.name);
    }
    return await productRepository.create(productData);
  }

  async updateProduct(id, productData) {
    if (productData.name && !productData.slug) {
      productData.slug = generateSlug(productData.name);
    }
    return await productRepository.update(id, productData);
  }

  async deleteProduct(id) {
    return await productRepository.delete(id);
  }
}

module.exports = new ProductService();
