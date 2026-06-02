const categoryRepository = require('../../repositories/category.repository');
const { generateSlug } = require('../../utils/utils');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async createCategory(categoryData) {
    if (!categoryData.slug) {
      categoryData.slug = generateSlug(categoryData.name);
    }
    return await categoryRepository.create(categoryData);
  }

  async updateCategory(id, data) {
    return await categoryRepository.update(id, data);
  }

  async deleteCategory(id) {
    return await categoryRepository.delete(id);
  }
}

module.exports = new CategoryService();
