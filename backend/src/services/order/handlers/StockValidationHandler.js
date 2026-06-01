const OrderHandler = require('./OrderHandler');
const productRepository = require('../../../repositories/product.repository');

class StockValidationHandler extends OrderHandler {
  async handle(context) {
    const { cart, orderItems } = context;
    
    for (const item of cart.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Product ${item.name} is out of stock`);
      }

      orderItems.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      });

      // Trừ tồn kho chính
      await productRepository.update(item.productId, {
        stock: product.stock - item.quantity,
        soldCount: (product.soldCount || 0) + item.quantity
      });
    }

    context.finalAmount = cart.totalAmount; // Khởi tạo giá trị mặc định cho finalAmount
    return await super.handle(context);
  }
}

module.exports = StockValidationHandler;
