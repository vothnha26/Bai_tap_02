const Category = require('../models/Category');

class CategoryRepository {
  async findAll() {
    return await Category.find().sort({ name: 1 });
  }

  async findById(id) {
    return await Category.findById(id);
  }

  async findBySlug(slug) {
    return await Category.findOne({ slug });
  }

  async create(data) {
    const category = new Category(data);
    return await category.save();
  }

  async update(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Category.findByIdAndDelete(id);
  }
}

module.exports = new CategoryRepository();
