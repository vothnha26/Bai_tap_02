const productRepository = require('../repositories/product.repository');

class ProductService {
  async getHomePageData() {
    const [promoted, latest, bestSellers] = await Promise.all([
      productRepository.getPromotedProducts(),
      productRepository.getLatestProducts(8),
      productRepository.getBestSellers(8)
    ]);

    return {
      promoted,
      latest,
      bestSellers
    };
  }

  async getProductDetail(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new Error('Product not found');
    }

    const similarProducts = await productRepository.getSimilarProducts(
      product._id,
      product.categories.map(c => c._id || c),
      4
    );

    return {
      product,
      similarProducts
    };
  }

  async searchProducts(filters, sort, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await productRepository.searchAndFilter(filters, sort, skip, limit);
  }

  async createProduct(productData) {
    // Tự động tạo slug từ tên nếu chưa có
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
    }
    return await productRepository.create(productData);
  }

  async updateProduct(id, productData) {
    if (productData.name && !productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
    }
    return await productRepository.update(id, productData);
  }

  async deleteProduct(id) {
    return await productRepository.delete(id);
  }
}

module.exports = new ProductService();
