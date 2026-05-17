const categoryRepository = require('../repositories/category.repository');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async createCategory(categoryData) {
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
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
