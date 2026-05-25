import React, { useEffect, useState } from 'react';
import orderService from '../services/order.service';
import { Package, Clock, Truck, CheckCircle, XCircle, AlertTriangle, CreditCard, X } from 'lucide-react';
import { Link } from 'react-router';

const statusConfig = {
  PENDING: { label: 'Đơn hàng mới', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle },
  PROCESSING: { label: 'Đang chuẩn bị hàng', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Package },
  SHIPPING: { label: 'Đang giao hàng', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Truck },
  DELIVERED: { label: 'Giao thành công', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
  CANCELLATION_REQUESTED: { label: 'Yêu cầu hủy', color: 'text-gray-400', bg: 'bg-gray-400/10', icon: AlertTriangle },
};

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Chi tiết đơn hàng</h2>
              <p className="text-blue-400 font-mono text-sm">#{order.id}</p>
            </div>
          </div>

          {/* Timeline Tracking */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/5 mb-8 overflow-x-auto">
            <div className="flex justify-between min-w-[500px] relative">
              <div className="absolute top-4 left-0 w-full h-0.5 bg-white/10 -z-0"></div>
              
              {[
                { key: 'PENDING', label: 'Đặt hàng' },
                { key: 'CONFIRMED', label: 'Xác nhận' },
                { key: 'PROCESSING', label: 'Chuẩn bị' },
                { key: 'SHIPPING', label: 'Giao hàng' },
                { key: 'DELIVERED', label: 'Thành công' }
              ].map((step, index) => {
                const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
                const currentIdx = statusOrder.indexOf(order.status);
                const stepIdx = statusOrder.indexOf(step.key);
                const isCompleted = stepIdx <= currentIdx && order.status !== 'CANCELLED';
                const isCurrent = step.key === order.status;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isCompleted ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#1A1A1A] border-white/10 text-gray-500'
                    } ${isCurrent ? 'ring-4 ring-blue-500/20' : ''} transition-all`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
                    </div>
                    <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-blue-400' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {order.status === 'CANCELLED' && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-bold">Đơn hàng này đã bị hủy</span>
              </div>
            )}
            {order.status === 'CANCELLATION_REQUESTED' && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3 text-yellow-500">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-bold">Đang chờ Shop xác nhận yêu cầu hủy đơn</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Thông tin giao hàng
              </h3>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                <p className="text-white text-sm"><span className="text-gray-500">Số điện thoại:</span> {order.phone}</p>
                <p className="text-white text-sm"><span className="text-gray-500">Địa chỉ:</span> {order.shippingAddress}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Thanh toán
              </h3>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                <p className="text-white text-sm"><span className="text-gray-500">Phương thức:</span> {order.paymentMethod}</p>
                <p className="text-white text-sm"><span className="text-gray-500">Trạng thái:</span> <span className="text-green-400">{order.paymentStatus}</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sản phẩm đã chọn</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-gray-500 text-xs">x{item.quantity}</p>
                  </div>
                  <p className="text-white font-bold">{(item.price * item.quantity).toLocaleString()}đ</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="text-gray-400 font-bold uppercase text-sm">Tổng thanh toán</span>
            <span className="text-2xl font-black text-blue-400">{order.totalAmount.toLocaleString()}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getUserOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    try {
      const result = await orderService.cancelOrder(orderId);
      alert(result.message);
      fetchOrders(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
        <Package className="w-8 h-8 text-blue-500" />
        Lịch sử đơn hàng
      </h1>

      {(!orders || orders.length === 0) ? (
        <div className="bg-[#1A1A1A] rounded-2xl p-12 text-center border border-white/10">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Bạn chưa có đơn hàng nào</h2>
          <p className="text-gray-400 mb-6">Bắt đầu mua sắm để lấp đầy lịch sử của bạn!</p>
          <Link to="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const Config = statusConfig[order.status] || statusConfig.PENDING;
            const Icon = Config.icon;
            
            return (
              <div key={order.id} className="bg-[#1A1A1A] rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mã đơn hàng</p>
                      <p className="text-blue-400 font-mono font-bold">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ngày đặt</p>
                      <p className="text-white">{new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${Config.bg} ${Config.color}`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-bold uppercase">{Config.label}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <p className="text-white font-medium line-clamp-1">{item.name}</p>
                          <p className="text-gray-400 text-sm">x{item.quantity}</p>
                        </div>
                        <p className="text-white font-bold">{(item.price * item.quantity).toLocaleString()}đ</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Tổng thanh toán</p>
                        <p className="text-2xl font-black text-blue-400">{order.totalAmount.toLocaleString()}đ</p>
                      </div>
                      <div className="h-10 w-px bg-white/10"></div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Thanh toán</p>
                        <p className="text-white font-bold">{order.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="px-6 py-2 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-all text-sm font-bold"
                      >
                        Chi tiết
                      </button>
                      
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          className="px-6 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm font-bold flex flex-col items-center leading-none justify-center"
                        >
                          <span>{order.status === 'PENDING' ? 'Hủy đơn ngay' : 'Gửi yêu cầu hủy'}</span>
                          {order.status === 'PENDING' && <span className="text-[10px] opacity-70 mt-1">(Dưới 30 phút)</span>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default Orders;
