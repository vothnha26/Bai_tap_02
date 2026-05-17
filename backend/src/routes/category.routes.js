const express = require('express');
const categoryController = require('../controllers/category.controller');
const { verifyAuth, verifyAdmin } = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/', categoryController.getAllCategories);

// Admin routes
router.post('/', verifyAuth, verifyAdmin, categoryController.createCategory);
router.put('/:id', verifyAuth, verifyAdmin, categoryController.updateCategory);
router.delete('/:id', verifyAuth, verifyAdmin, categoryController.deleteCategory);

module.exports = router;
