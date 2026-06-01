import React, { useEffect, useState } from 'react';
import orderService from '../services/order.service';
import { Package, Clock, Truck, CheckCircle, XCircle, AlertTriangle, CreditCard, X, ChevronRight, ShoppingBag, Calendar, Hash, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';

const statusConfig = {
  PENDING: { label: 'Đơn hàng mới', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle },
  PROCESSING: { label: 'Đang chuẩn bị', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: Package },
  SHIPPING: { label: 'Đang giao hàng', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: Truck },
  DELIVERED: { label: 'Thành công', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
  CANCELLATION_REQUESTED: { label: 'Yêu cầu hủy', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', icon: AlertTriangle },
};

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/20 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-accent rounded-full text-slate-500 hover:text-slate-900 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-primary text-white rounded-3xl shadow-lg shadow-primary/20">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Chi tiết đơn hàng</h2>
              <p className="text-primary font-mono text-sm font-bold mt-1">ID: #{order.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Vận chuyển
              </h3>
              <div className="bg-slate-50 dark:bg-accent/30 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex gap-4">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-bold">{order.phone}</span>
                </div>
                <div className="flex gap-4">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{order.shippingAddress}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Thanh toán
              </h3>
              <div className="bg-slate-50 dark:bg-accent/30 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold uppercase">Phương thức</span>
                  <span className="text-slate-900 dark:text-white text-sm font-black tracking-tight">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold uppercase">Trạng thái</span>
                  <span className="text-green-600 bg-green-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{order.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sản phẩm đã chọn</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-5 p-5 bg-white dark:bg-background rounded-3xl border border-slate-100 items-center hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white text-base font-black truncate">{item.name}</p>
                    <p className="text-slate-400 text-xs font-bold mt-1.5 uppercase tracking-widest">
                      SL: {item.quantity} × {item.price.toLocaleString()}đ
                    </p>
                  </div>
                  <p className="text-slate-900 dark:text-white font-black text-lg">{ (item.price * item.quantity).toLocaleString() }đ</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
            <div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1.5">Tổng thanh toán</p>
              <p className="text-4xl font-black text-primary tracking-tighter">{order.totalAmount.toLocaleString()}đ</p>
            </div>
            <Button variant="default" onClick={onClose} className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest">Đóng</Button>
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
      await orderService.cancelOrder(orderId);
      fetchOrders(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" />
              Quay lại cửa hàng
            </Link>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-5">
              <div className="p-4 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <ShoppingBag className="w-10 h-10 text-primary" />
              </div>
              Lịch sử đơn hàng
            </h1>
          </div>
          <div className="bg-white/60 backdrop-blur-md px-8 py-4 rounded-[2rem] border border-white shadow-lg text-slate-500">
            Bạn có <span className="text-primary font-black text-2xl ml-1">{orders.length}</span> đơn hàng
          </div>
        </div>

        {(!orders || orders.length === 0) ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-white shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
              <Package className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Bạn chưa mua gì?</h2>
            <p className="text-slate-400 mb-12 max-w-md mx-auto font-bold text-lg leading-relaxed">Đừng để lịch sử trống trơn! Rất nhiều sản phẩm tuyệt vời đang chờ bạn.</p>
            <Link to="/">
              <Button size="lg" className="rounded-3xl px-16 h-16 font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                Mua sắm ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {orders.map((order, index) => {
              const Config = statusConfig[order.status] || statusConfig.PENDING;
              const Icon = Config.icon;
              
              return (
                <div 
                  key={order.id} 
                  className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl hover:shadow-2xl hover:bg-white transition-all duration-500 group animate-in fade-in slide-in-from-bottom-12 duration-700"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="p-10">
                    <div className="flex flex-wrap justify-between items-center gap-8 mb-10 pb-8 border-b border-slate-50">
                      <div className="flex flex-wrap items-center gap-10">
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5" /> Mã đơn hàng
                          </p>
                          <p className="text-slate-900 font-mono font-black text-xl tracking-tight">#{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="hidden sm:block w-px h-12 bg-slate-100" />
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Ngày đặt
                          </p>
                          <p className="text-slate-900 font-black text-base tracking-tight">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                            <span className="text-slate-300 mx-2">•</span>
                            <span className="text-slate-400 font-bold uppercase text-xs">
                              {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border ${Config.bg} ${Config.color} ${Config.border} shadow-sm backdrop-blur-sm`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-[0.15em]">{Config.label}</span>
                      </div>
                    </div>

                    <div className="space-y-6 mb-10">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex gap-6 items-center">
                          <div className="w-20 h-20 shrink-0 rounded-3xl overflow-hidden border border-slate-50 shadow-md">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 font-black text-lg line-clamp-1 tracking-tight">{item.name}</p>
                            <p className="text-slate-400 text-xs font-bold mt-1.5 uppercase tracking-widest">
                              SL: {item.quantity} × <span className="text-slate-600">{item.price.toLocaleString()}đ</span>
                            </p>
                          </div>
                          <p className="text-slate-900 font-black text-xl tracking-tighter">{(item.price * item.quantity).toLocaleString()}đ</p>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest pl-[104px] italic">
                          Và {order.items.length - 3} sản phẩm khác...
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-8 pt-10 border-t border-slate-50">
                      <div className="flex items-center gap-10">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">Tổng cộng</p>
                          <p className="text-4xl font-black text-primary tracking-tighter">{order.totalAmount.toLocaleString()}đ</p>
                        </div>
                        <div className="hidden sm:block w-px h-12 bg-slate-100" />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">Thanh toán</p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <p className="text-slate-900 font-black text-sm uppercase tracking-tight">{order.paymentMethod}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] px-8 h-12 border-slate-200 hover:bg-slate-50 hover:text-primary transition-all shadow-sm"
                        >
                          Chi tiết
                        </Button>
                        
                        {(order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.CONFIRMED || order.status === ORDER_STATUS.PROCESSING) && (
                          <Button
                            variant="destructive"
                            onClick={() => handleCancel(order.id)}
                            className="rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-xl shadow-destructive/20 hover:scale-105 transition-transform"
                          >
                            Hủy đơn
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
