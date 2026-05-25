import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import orderService from '../services/order.service';
import { CheckCircle, Package, Truck, CreditCard, AlertTriangle, XCircle } from 'lucide-react';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Không tìm thấy đơn hàng</h2>
        <Link to="/" className="text-blue-500 hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-[#1A1A1A] rounded-2xl p-8 border border-white/10 text-center mb-8">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-400">Cảm ơn bạn đã mua sắm tại ShopVN. Mã đơn hàng của bạn là <span className="text-blue-400 font-mono">#{order.id}</span></p>
      </div>

      {/* Timeline Tracking */}
      <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-white/10 mb-8 overflow-x-auto">
        <div className="flex justify-between min-w-[600px] relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 w-full h-1 bg-white/10 -z-0"></div>
          
          {[
            { key: 'PENDING', label: 'Đặt hàng' },
            { key: 'CONFIRMED', label: 'Xác nhận' },
            { key: 'PROCESSING', label: 'Chuẩn bị' },
            { key: 'SHIPPING', label: 'Giao hàng' },
            { key: 'DELIVERED', label: 'Thành công' }
          ].map((step, index, array) => {
            const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
            const currentIdx = statusOrder.indexOf(order.status);
            const stepIdx = statusOrder.indexOf(step.key);
            const isCompleted = stepIdx <= currentIdx && order.status !== 'CANCELLED';
            const isCurrent = step.key === order.status;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                  isCompleted ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#1A1A1A] border-white/10 text-gray-500'
                } ${isCurrent ? 'ring-4 ring-blue-500/20 scale-110' : ''} transition-all`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span>{index + 1}</span>}
                </div>
                <span className={`mt-3 text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-blue-400' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        {order.status === 'CANCELLED' && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
            <XCircle className="w-5 h-5" />
            <span className="font-bold">Đơn hàng này đã bị hủy</span>
          </div>
        )}
        {order.status === 'CANCELLATION_REQUESTED' && (
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3 text-yellow-500">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold">Đang chờ Shop xác nhận yêu cầu hủy đơn</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1A1A1A] p-6 rounded-xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            Thông tin giao hàng
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-400">Số điện thoại: <span className="text-white">{order.phone}</span></p>
            <p className="text-gray-400">Địa chỉ: <span className="text-white">{order.shippingAddress}</span></p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] p-6 rounded-xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            Thanh toán
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-400">Phương thức: <span className="text-white">{order.paymentMethod}</span></p>
            <p className="text-gray-400">Trạng thái: <span className="text-green-400 font-bold">{order.paymentStatus}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] p-6 rounded-xl border border-white/10 mb-8">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-400" />
          Chi tiết đơn hàng
        </h3>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-gray-300">{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
              <span className="text-white font-bold">{(item.price * item.quantity).toLocaleString()}đ</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-4 flex justify-between items-center text-lg font-bold">
            <span className="text-white">Tổng thanh toán</span>
            <span className="text-blue-400">{order.totalAmount.toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-center hover:bg-blue-700 transition-all">
          Tiếp tục mua sắm
        </Link>
        <Link to="/orders" className="flex-1 border border-white/10 text-white py-3 rounded-xl font-bold text-center hover:bg-white/5 transition-all">
          Xem lịch sử đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
