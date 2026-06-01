const productDiscountRepository = require('../repositories/productDiscount.repository');

class ProductDiscountController {
  async getDiscountByProductId(req, res) {
    try {
      const { productId } = req.params;
      const discounts = await productDiscountRepository.findByProductId(productId);
      
      // Trả về discount đầu tiên (mới nhất) hoặc null
      res.json({
        status: 'success',
        data: discounts.length > 0 ? discounts[0] : null
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async upsertDiscount(req, res) {
    try {
      const { productId } = req.params;
      const { discountType, discountValue, startDate, endDate, isStackable, isActive } = req.body;

      if (!discountType || discountValue === undefined || !startDate || !endDate) {
        return res.status(400).json({
          status: 'error',
          message: 'Thiếu các thông tin bắt buộc: discountType, discountValue, startDate, endDate'
        });
      }

      // Xóa tất cả các discount cũ của sản phẩm này để đảm bảo mỗi sản phẩm chỉ có tối đa 1 đợt giảm giá được cấu hình
      await productDiscountRepository.deleteByProductId(productId);

      // Tạo mới discount
      const newDiscount = await productDiscountRepository.create({
        productId,
        discountType,
        discountValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isStackable: isStackable === true,
        isActive: isActive !== false
      });

      res.status(201).json({
        status: 'success',
        data: newDiscount
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async deleteDiscount(req, res) {
    try {
      const { productId } = req.params;
      await productDiscountRepository.deleteByProductId(productId);
      
      res.json({
        status: 'success',
        message: 'Xóa giảm giá sản phẩm thành công'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new ProductDiscountController();
