const CartValidationHandler = require('./handlers/CartValidationHandler');
const AddressResolutionHandler = require('./handlers/AddressResolutionHandler');
const StockValidationHandler = require('./handlers/StockValidationHandler');
const PromotionHandler = require('./handlers/PromotionHandler');
const OrderSaveHandler = require('./handlers/OrderSaveHandler');
const CartClearHandler = require('./handlers/CartClearHandler');

class OrderChainFactory {
  static create() {
    const cartValidation = new CartValidationHandler();
    const addressResolution = new AddressResolutionHandler();
    const stockValidation = new StockValidationHandler();
    const promotion = new PromotionHandler();
    const orderSave = new OrderSaveHandler();
    const cartClear = new CartClearHandler();

    // Kết nối các mắt xích của chuỗi trách nhiệm
    cartValidation
      .setNext(addressResolution)
      .setNext(stockValidation)
      .setNext(promotion)
      .setNext(orderSave)
      .setNext(cartClear);

    return cartValidation; // Trả về mắt xích đầu tiên
  }
}

module.exports = { OrderChainFactory };
