const OrderHandler = require('./OrderHandler');
const cartService = require('../../cart/cart.service');

class CartValidationHandler extends OrderHandler {
  async handle(context) {
    const cart = await cartService.getCart(context.userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    context.cart = cart;
    return await super.handle(context);
  }
}

module.exports = CartValidationHandler;
