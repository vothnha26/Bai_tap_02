const orderService = require('../services/order.service');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const order = await orderService.createOrder(userId, req.body);
      res.status(201).json(order);
    } catch (error) {
      if (error.message === 'Cart is empty') {
        return res.status(400).json({ message: error.message });
      }
      if (error.message.includes('out of stock') || error.message.includes('not found')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async getUserOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const orders = await orderService.getUserOrders(userId);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const order = await orderService.getOrderById(id, userId);
      res.status(200).json(order);
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized access to order') {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await orderService.cancelOrder(id, userId);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('không thể hủy')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(id, status);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
