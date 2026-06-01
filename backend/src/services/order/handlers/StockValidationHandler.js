const OrderHandler = require('./OrderHandler');
const productRepository = require('../../../repositories/product.repository');

class StockValidationHandler extends OrderHandler {
  async handle(context) {
    const { cart, orderItems } = context;
    
    const priceService = require('../../price.service');

    for (const item of cart.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Product ${item.name} is out of stock`);
      }

      const productWithPrice = await priceService.getEffectivePrices(product);

      orderItems.push({
        productId: item.productId,
        name: item.name,
        price: productWithPrice.effectivePrice,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        hasActiveDiscount: productWithPrice.hasActiveDiscount,
        discountIsStackable: productWithPrice.discountIsStackable
      });
    }

    context.finalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return await super.handle(context);
  }
}

module.exports = StockValidationHandler;
