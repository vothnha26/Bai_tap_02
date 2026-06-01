const inventoryRepository = require('../repositories/inventory.repository');
const inventoryTransactionRepository = require('../repositories/inventoryTransaction.repository');
const inventoryService = require('../services/inventory/InventoryService');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

class InventoryController {
  // Lấy danh sách tồn kho cho admin
  async getInventoryList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const lowStockOnly = req.query.lowStockOnly === 'true';
      const skip = (page - 1) * limit;

      let query = {};

      // Nếu có tìm kiếm theo tên sản phẩm
      if (search) {
        const matchingProducts = await Product.find({
          name: { $regex: search, $options: 'i' }
        }, '_id');
        const productIds = matchingProducts.map(p => p._id);
        query.productId = { $in: productIds };
      }

      // Nếu chỉ lọc các sản phẩm tồn kho thấp
      if (lowStockOnly) {
        query.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
      }

      // Tổng số bản ghi thỏa mãn điều kiện
      const totalItems = await Inventory.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limit);

      // Lấy danh sách inventory và populate thông tin sản phẩm
      const inventoryList = await Inventory.find(query)
        .populate('productId', 'name images sku price slug')
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 });

      res.status(200).json({
        success: true,
        data: {
          inventory: inventoryList,
          pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit
          }
        }
      });
    } catch (error) {
      console.error('Error in getInventoryList:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Lấy danh sách sản phẩm tồn kho thấp
  async getLowStockInventory(req, res) {
    try {
      const lowStockItems = await inventoryRepository.getLowStockItems();
      res.status(200).json({
        success: true,
        data: lowStockItems
      });
    } catch (error) {
      console.error('Error in getLowStockInventory:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Cập nhật thông tin tồn kho
  async updateInventory(req, res) {
    try {
      const { productId } = req.params;
      const { stock, lowStockThreshold, warehouseLocation } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'Thiếu productId' });
      }

      const currentInventory = await inventoryRepository.findByProductId(productId);
      const previousStock = currentInventory ? currentInventory.stock : 0;

      const updatedInventory = await inventoryRepository.updateStock(
        productId,
        stock,
        lowStockThreshold,
        warehouseLocation
      );

      // Nếu số lượng stock thay đổi, tự động ghi log SYSTEM_UPDATE
      if (stock !== undefined && stock !== null && stock !== previousStock) {
        const inventoryTransactionFactory = require('../services/inventory/InventoryTransactionFactory');
        const transactionDescriptor = inventoryTransactionFactory.createDescriptor('SYSTEM_UPDATE', {
          productId,
          previousStock,
          newStock: stock,
          reason: 'Cập nhật nhanh thông tin kho',
          executedBy: req.user ? req.user.email : 'System'
        });
        await inventoryTransactionRepository.createTransaction(transactionDescriptor);
      }

      // Populate product info before returning
      const populatedInventory = await Inventory.findById(updatedInventory._id).populate('productId', 'name images sku price');

      res.status(200).json({
        success: true,
        message: 'Cập nhật tồn kho thành công',
        data: populatedInventory
      });
    } catch (error) {
      console.error('Error in updateInventory:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Thực hiện phiên kiểm kho (Stock-take) qua Facade Service
  async submitStockTake(req, res) {
    try {
      const { productId } = req.params;
      const { actualStock, reason } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'Thiếu productId' });
      }
      if (actualStock === undefined || actualStock === null || actualStock < 0) {
        return res.status(400).json({ success: false, message: 'Số lượng thực tế không hợp lệ' });
      }

      const adminEmail = req.user ? req.user.email : 'admin@shopvn.com';

      // Gọi Facade Service
      const updatedInventory = await inventoryService.submitStockTake(
        productId,
        actualStock,
        reason || 'Kiểm kho định kỳ',
        adminEmail
      );

      const populatedInventory = await Inventory.findById(updatedInventory._id).populate('productId', 'name images sku price');

      res.status(200).json({
        success: true,
        message: 'Xác nhận kiểm kho và điều chỉnh số lượng thành công',
        data: populatedInventory
      });
    } catch (error) {
      console.error('Error in submitStockTake:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Lấy lịch sử biến động kho
  async getTransactionsList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const type = req.query.type || '';
      const productId = req.query.productId || '';

      const result = await inventoryTransactionRepository.getTransactionsList({
        productId,
        type,
        search,
        page,
        limit
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getTransactionsList:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new InventoryController();
