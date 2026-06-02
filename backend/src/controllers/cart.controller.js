const cartService = require('../services/cart/cart.service');

class CartController {
  async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCart(userId);
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;
      
      if (!productId || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
      }

      const cart = await cartService.addToCart(userId, productId, parseInt(quantity, 10));
      res.status(200).json(cart);
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async updateQuantity(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined) {
        return res.status(400).json({ message: 'Quantity is required' });
      }

      const cart = await cartService.updateQuantity(userId, productId, parseInt(quantity, 10));
      res.status(200).json(cart);
    } catch (error) {
      if (error.message === 'Product not found in cart') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async removeFromCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      const cart = await cartService.removeFromCart(userId, productId);
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const userId = req.user.id;
      const cart = await cartService.clearCart(userId);
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
