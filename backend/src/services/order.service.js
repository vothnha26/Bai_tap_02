const orderRepository = require('../repositories/order.repository');
const cartService = require('./cart.service');
const productRepository = require('../repositories/product.repository');

class OrderService {
  async createOrder(userId, orderInfo) {
    const { shippingAddress, phone, note, paymentMethod = 'COD' } = orderInfo;

    // 1. Get Cart Data
    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // 2. Validate Stock & Prepare Items
    const orderItems = [];
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

      // Update stock
      await productRepository.update(item.productId, {
        stock: product.stock - item.quantity,
        soldCount: (product.soldCount || 0) + item.quantity
      });
    }

    // 3. Create Order
    const orderData = {
      userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress,
      phone,
      note,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID', // Simplified for now
      status: 'PENDING'
    };

    const order = await orderRepository.create(orderData);

    // 4. Clear Cart
    await cartService.clearCart(userId);

    return order;
  }

  async getUserOrders(userId) {
    const orders = await orderRepository.findByUserId(userId);
    // Check auto-confirmation
    const updatedOrders = await Promise.all(orders.map(order => this._checkAutoConfirm(order)));
    return updatedOrders;
  }

  async getOrderById(orderId, userId) {
    let order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    // Check ownership
    if (order.userId._id.toString() !== userId && order.userId.toString() !== userId) {
      throw new Error('Unauthorized access to order');
    }
    
    return await this._checkAutoConfirm(order);
  }

  async cancelOrder(orderId, userId) {
    const order = await this.getOrderById(orderId, userId);
    
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const diffMins = Math.floor((now - createdAt) / 1000 / 60);

    // 1. Dưới 30 phút và đang PENDING -> Hủy trực tiếp
    if (diffMins < 30 && order.status === 'PENDING') {
      const updatedOrder = await orderRepository.updateStatus(orderId, 'CANCELLED');
      
      // Hoàn lại kho
      for (const item of order.items) {
        const product = await productRepository.findById(item.productId);
        if (product) {
          await productRepository.update(item.productId, {
            stock: product.stock + item.quantity,
            soldCount: Math.max(0, (product.soldCount || 0) - item.quantity)
          });
        }
      }
      return { order: updatedOrder, message: 'Hủy đơn hàng thành công' };
    }

    // 2. Trên 30 phút HOẶC đang chuẩn bị hàng -> Gửi yêu cầu hủy
    if (order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') {
      const updatedOrder = await orderRepository.updateStatus(orderId, 'CANCELLATION_REQUESTED');
      return { order: updatedOrder, message: 'Đã gửi yêu cầu hủy đơn hàng cho Shop' };
    }

    // 3. Đang giao hoặc đã giao -> Không được hủy
    throw new Error('Đơn hàng đang giao hoặc đã giao, không thể hủy');
  }

  async getAllOrders() {
    return await orderRepository.findAll();
  }

  async updateOrderStatus(orderId, status) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Nếu chuyển sang trạng thái CANCELLED, thực hiện hoàn kho
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        const product = await productRepository.findById(item.productId);
        if (product) {
          await productRepository.update(item.productId, {
            stock: product.stock + item.quantity,
            soldCount: Math.max(0, (product.soldCount || 0) - item.quantity)
          });
        }
      }
    }

    // Nếu chuyển sang trạng thái DELIVERED và là COD, tự động chuyển paymentStatus sang PAID
    if (status === 'DELIVERED' && order.paymentMethod === 'COD') {
      await orderRepository.updatePaymentStatus(orderId, 'PAID');
    }

    return await orderRepository.updateStatus(orderId, status);
  }

  async _checkAutoConfirm(order) {
    if (order.status === 'PENDING') {
      const now = new Date();
      const createdAt = new Date(order.createdAt);
      const diffMins = Math.floor((now - createdAt) / 1000 / 60);

      if (diffMins >= 30) {
        const updated = await orderRepository.updateStatus(order.id || order._id, 'CONFIRMED');
        return updated;
      }
    }
    return order;
  }
}

module.exports = new OrderService();
