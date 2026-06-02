const OrderHandler = require('./OrderHandler');
const cartService = require('../../cart/cart.service');

class CartClearHandler extends OrderHandler {
  async handle(context) {
    await cartService.clearCart(context.userId);
    return await super.handle(context);
  }
}

module.exports = CartClearHandler;
