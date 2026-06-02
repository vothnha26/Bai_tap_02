const categoryService = require('../services/product/category.service');

class CategoryController {
  async getAllCategories(req, res) {
    try {
      const data = await categoryService.getAllCategories();
      res.json({ status: 'success', data });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const data = await categoryService.createCategory(req.body);
      res.status(201).json({ status: 'success', data });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const data = await categoryService.updateCategory(id, req.body);
      res.json({ status: 'success', data });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);
      res.json({ status: 'success', message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new CategoryController();
