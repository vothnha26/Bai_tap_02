const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { verifyAuth, verifyAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Tất cả các route inventory đều yêu cầu quyền Admin
router.use(verifyAuth, verifyAdmin);

router.get('/', inventoryController.getInventoryList);
router.get('/low-stock', inventoryController.getLowStockInventory);
router.get('/transactions', inventoryController.getTransactionsList);
router.put('/:productId', inventoryController.updateInventory);
router.post('/:productId/stock-take', inventoryController.submitStockTake);

module.exports = router;
