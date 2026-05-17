const productService = require('../services/product.service');

class ProductController {
  async getHomePageData(req, res) {
    try {
      const data = await productService.getHomePageData();
      res.json({
        status: 'success',
        data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getProductDetail(req, res) {
    try {
      const { slug } = req.params;
      const data = await productService.getProductDetail(slug);
      res.json({
        status: 'success',
        data
      });
    } catch (error) {
      const statusCode = error.message === 'Product not found' ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async searchProducts(req, res) {
    try {
      const { search, category, minPrice, maxPrice, tags, rating, sortBy, order, page, limit } = req.query;
      
      const filters = {
        search,
        category,
        tags,
        rating: rating ? parseFloat(rating) : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
      };

      const sort = {};
      if (sortBy) {
        sort[sortBy] = order === 'asc' ? 1 : -1;
      } else {
        sort.createdAt = -1;
      }

      const data = await productService.searchProducts(
        filters,
        sort,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );

      res.json({
        status: 'success',
        data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async createProduct(req, res) {
    try {
      const data = await productService.createProduct(req.body);
      res.status(201).json({
        status: 'success',
        data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const data = await productService.updateProduct(id, req.body);
      res.json({
        status: 'success',
        data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);
      res.json({
        status: 'success',
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new ProductController();
