const redisClient = require('../config/redis');
const productRepository = require('../repositories/product.repository');

class CartService {
  constructor() {
    this.keyPrefix = 'cart:';
    this.ttl = 60 * 60 * 24 * 7; // 7 days
  }

  async getCart(userId) {
    const cartData = await redisClient.get(`${this.keyPrefix}${userId}`);
    if (!cartData) {
      return { items: [], totalAmount: 0 };
    }
    const cart = JSON.parse(cartData);

    if (cart.items && cart.items.length > 0) {
      const priceService = require('./price.service');
      const productIds = cart.items.map(item => item.productId);
      const products = await Promise.all(productIds.map(id => productRepository.findById(id)));
      
      const validProducts = products.filter(p => p !== null);
      const productsWithPrices = await priceService.getEffectivePrices(validProducts);
      
      const priceMap = {};
      productsWithPrices.forEach(p => {
        priceMap[p.id.toString()] = p;
      });
      
      let cartChanged = false;
      cart.items = cart.items.map(item => {
        const dbProduct = priceMap[item.productId];
        if (dbProduct) {
          if (item.price !== dbProduct.effectivePrice || 
              item.hasActiveDiscount !== dbProduct.hasActiveDiscount ||
              item.discountIsStackable !== dbProduct.discountIsStackable) {
            item.price = dbProduct.effectivePrice;
            item.hasActiveDiscount = dbProduct.hasActiveDiscount;
            item.discountIsStackable = dbProduct.discountIsStackable;
            cartChanged = true;
          }
          return item;
        }
        cartChanged = true;
        return null;
      }).filter(Boolean);
      
      if (cartChanged) {
        this._calculateTotal(cart);
        await this._saveCart(userId, cart);
      }
    }

    return cart;
  }

  async addToCart(userId, productId, quantity) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const priceService = require('./price.service');
    const productWithPrice = await priceService.getEffectivePrices(product);

    let cart = await this.getCart(userId);
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = productWithPrice.effectivePrice;
      cart.items[existingItemIndex].hasActiveDiscount = productWithPrice.hasActiveDiscount;
      cart.items[existingItemIndex].discountIsStackable = productWithPrice.discountIsStackable;
    } else {
      cart.items.push({
        productId: product._id.toString(),
        name: product.name,
        price: productWithPrice.effectivePrice,
        quantity: quantity,
        imageUrl: product.images && product.images.length > 0 ? product.images[0] : '',
        hasActiveDiscount: productWithPrice.hasActiveDiscount,
        discountIsStackable: productWithPrice.discountIsStackable
      });
    }

    this._calculateTotal(cart);
    await this._saveCart(userId, cart);
    return cart;
  }

  async updateQuantity(userId, productId, quantity) {
    let cart = await this.getCart(userId);
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      throw new Error('Product not found in cart');
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    this._calculateTotal(cart);
    await this._saveCart(userId, cart);
    return cart;
  }

  async removeFromCart(userId, productId) {
    let cart = await this.getCart(userId);
    cart.items = cart.items.filter(item => item.productId !== productId);

    this._calculateTotal(cart);
    await this._saveCart(userId, cart);
    return cart;
  }

  async clearCart(userId) {
    await redisClient.del(`${this.keyPrefix}${userId}`);
    return { items: [], totalAmount: 0 };
  }

  _calculateTotal(cart) {
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  async _saveCart(userId, cart) {
    await redisClient.setEx(
      `${this.keyPrefix}${userId}`,
      this.ttl,
      JSON.stringify(cart)
    );
  }
}

module.exports = new CartService();
