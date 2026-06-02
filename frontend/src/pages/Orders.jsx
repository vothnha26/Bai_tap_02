import React, { useEffect, useState } from 'react';
import orderService from '../services/order.service';
import { Package, Clock, Truck, CheckCircle, XCircle, AlertTriangle, CreditCard, X, ChevronRight, ShoppingBag, Calendar, Hash, MapPin, Phone, ArrowLeft, Tag, Gift, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { ORDER_STATUS } from '../utils/constants';
import { formatAddress } from '../utils/utils';

const statusConfig = {
  PENDING: { label: 'Đơn hàng mới', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle },
  PROCESSING: { label: 'Đang chuẩn bị', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: Package },
  SHIPPING: { label: 'Đang giao hàng', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: Truck },
  DELIVERED: { label: 'Thành công', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
  CANCELLATION_REQUESTED: { label: 'Yêu cầu hủy', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', icon: AlertTriangle },
};

// Component Countdown Timer cho việc hủy đơn
const OrderCancelCountdown = ({ createdAt, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const createdTime = new Date(createdAt).getTime();
      const endTime = createdTime + 30 * 60 * 1000; // 30 phút
      const remaining = endTime - Date.now();
      return remaining > 0 ? remaining : 0;
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      const remaining = calculateTime();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        if (onTimeout) onTimeout();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt, onTimeout]);

  if (timeLeft <= 0) return null;

  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <span className="text-red-500 font-mono font-black ml-1.5 px-2 py-0.5 bg-red-50 rounded-lg text-xs border border-red-100">
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
};

// Component Thanh tiến trình trạng thái
const OrderProgressBar = ({ status }) => {
  const steps = [
    { key: 'PENDING', label: 'Đơn mới', icon: Clock },
    { key: 'CONFIRMED', label: 'Xác nhận', icon: CheckCircle },
    { key: 'PROCESSING', label: 'Chuẩn bị', icon: Package },
    { key: 'SHIPPING', label: 'Đang giao', icon: Truck },
    { key: 'DELIVERED', label: 'Thành công', icon: CheckCircle },
  ];

  const statusIndexMap = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPING: 3,
    DELIVERED: 4,
  };

  const currentIndex = statusIndexMap[status] !== undefined ? statusIndexMap[status] : -1;

  if (status === 'CANCELLED') {
    return (
      <div className="bg-red-50/50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 mb-8">
        <XCircle className="w-10 h-10 text-red-500 shrink-0" />
        <div>
          <h4 className="text-base font-black text-red-950 uppercase tracking-tight">Đơn hàng đã bị hủy</h4>
          <p className="text-red-500/80 text-xs font-bold mt-1">Đơn hàng không thể tiếp tục xử lý hoặc đã được hoàn trả.</p>
        </div>
      </div>
    );
  }

  if (status === 'CANCELLATION_REQUESTED') {
    return (
      <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl flex items-center gap-4 mb-8">
        <AlertTriangle className="w-10 h-10 text-amber-500 shrink-0 animate-pulse" />
        <div>
          <h4 className="text-base font-black text-amber-950 uppercase tracking-tight">Đang yêu cầu hủy đơn</h4>
          <p className="text-amber-500/80 text-xs font-bold mt-1">Yêu cầu hủy đơn hàng của bạn đã gửi tới shop và đang chờ xét duyệt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 px-2">
      <div className="flex items-center justify-between relative">
        {/* Line đằng sau */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-accent -translate-y-1/2 z-0 rounded-full" />
        
        {/* Line tiến trình sáng */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-700" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isCurrent 
                    ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20' 
                    : isActive 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider mt-3 whitespace-nowrap ${
                isCurrent ? 'text-primary' : isActive ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Modal Lý do Hủy đơn
const CancelReasonModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hủy đơn hàng.');
      return;
    }
    onSubmit(reason);
    setReason('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card w-full max-w-md p-8 rounded-[2rem] border border-slate-100 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Lý do hủy đơn hàng</h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Đơn hàng của bạn đang được chuẩn bị. Vui lòng nhập lý do để shop xét duyệt yêu cầu hủy của bạn.
        </p>
        
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (e.target.value.trim()) setError('');
          }}
          placeholder="Ví dụ: Tôi muốn chọn sản phẩm khác, trùng đơn hàng..."
          className="w-full h-32 p-4 rounded-2xl border border-slate-200 dark:border-accent bg-slate-50 dark:bg-background text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
        {error && <p className="text-red-500 text-xs font-bold mt-2">{error}</p>}

        <div className="flex gap-4 mt-8">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl h-12 font-black uppercase text-xs tracking-wider">Hủy bỏ</Button>
          <Button onClick={handleSubmit} className="flex-1 rounded-2xl h-12 font-black uppercase text-xs tracking-wider">Gửi yêu cầu</Button>
        </div>
      </div>
    </div>
  );
};

// Modal Chi tiết Đơn hàng
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
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Theo dõi đơn hàng</h2>
              <p className="text-primary font-mono text-sm font-bold mt-1">ID: #{order.id}</p>
            </div>
          </div>

          {/* Thanh Tiến trình trạng thái */}
          <OrderProgressBar status={order.status} />

          {order.cancellationReason && (
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl mb-8 flex gap-3.5 items-start">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Lý do hủy đơn hàng / Yêu cầu</p>
                <p className="text-sm text-slate-700 font-bold mt-1 leading-relaxed">{order.cancellationReason}</p>
              </div>
            </div>
          )}

          {order.cancellationRejectionReason && (
            <div className="bg-rose-50/70 border border-rose-100 p-5 rounded-3xl mb-8 flex gap-3.5 items-start animate-fade-in">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-rose-600 font-black uppercase tracking-wider">Yêu cầu hủy bị Shop từ chối</p>
                <p className="text-sm text-rose-950 font-black mt-1 leading-relaxed">"{order.cancellationRejectionReason}"</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1.5">
                  Đơn hàng của bạn đang được tiếp tục chuẩn bị để vận chuyển.
                </p>
              </div>
            </div>
          )}

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
                  <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {formatAddress(order.shippingAddress)}
                  </span>
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

          {/* Hiển thị quà tặng kèm */}
          {order.giftItems && order.giftItems.length > 0 && (
            <div className="space-y-4 mb-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-500 animate-bounce" />
                Quà tặng kèm khuyến mãi
              </h3>
              <div className="space-y-4">
                {order.giftItems.map((gift, idx) => (
                  <div key={idx} className="flex gap-5 p-5 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-3xl border border-emerald-100/50 items-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-emerald-100 shadow-sm shrink-0">
                      <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white text-base font-black truncate">{gift.name}</p>
                      <p className="text-slate-400 text-xs font-bold mt-1.5 uppercase tracking-widest">
                        Số lượng: {gift.quantity}
                      </p>
                    </div>
                    <span className="text-[10px] bg-emerald-500 text-white px-4 py-2 rounded-2xl font-black uppercase tracking-wider shadow-md shadow-emerald-500/20">Quà tặng</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hiển thị voucher */}
          {order.promotionCode && (
            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/70 dark:border-rose-900/30 p-6 rounded-[2rem] mb-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-wider">Voucher: {order.promotionCode}</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-0.5 uppercase tracking-wider">Khuyến mãi đã áp dụng</p>
                </div>
              </div>
              {order.discountAmount > 0 && (
                <p className="text-rose-600 dark:text-rose-400 font-black text-lg">-{order.discountAmount.toLocaleString()}đ</p>
              )}
            </div>
          )}

          <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
            <div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1.5">
                {order.discountAmount > 0 ? "Tổng thanh toán" : "Tổng cộng"}
              </p>
              <p className="text-4xl font-black text-primary tracking-tighter">
                {(order.finalAmount !== undefined ? order.finalAmount : (order.totalAmount - (order.discountAmount || 0))).toLocaleString()}đ
              </p>
              {order.discountAmount > 0 && (
                <p className="text-slate-400 font-bold text-xs mt-1 line-through">
                  Tạm tính: {order.totalAmount.toLocaleString()}đ
                </p>
              )}
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
  
  // State quản lý việc Hủy đơn
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getUserOrders();
      setOrders(Array.isArray(data) ? data : []);
      
      // Sử dụng callback của state để tránh trigger loop và closure stale state
      setSelectedOrder(prev => {
        if (!prev) return null;
        const updatedSelected = data.find(o => o.id === prev.id || o._id === prev._id);
        if (!updatedSelected) return prev;
        // Chỉ cập nhật nếu thực sự có thay đổi trạng thái
        if (
          updatedSelected.status !== prev.status ||
          updatedSelected.cancellationRejectionReason !== prev.cancellationRejectionReason ||
          updatedSelected.paymentStatus !== prev.paymentStatus
        ) {
          return updatedSelected;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Tự động làm mới dữ liệu sau mỗi 30 giây để cập nhật trạng thái đơn hàng (nhất là Auto-Confirm)
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []); // Đã fix lỗi lặp vô hạn bằng cách để dependency array là []

  const handleFollowOrder = async (order) => {
    setSelectedOrder(order); // Mở modal ngay
    try {
      const freshOrder = await orderService.getOrderById(order.id || order._id);
      setSelectedOrder(freshOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleCancelClick = (order) => {
    // Nếu ở trạng thái PROCESSING, bắt buộc phải mở modal lý do
    if (order.status === ORDER_STATUS.PROCESSING) {
      setCancellingOrderId(order.id || order._id);
      setIsCancelModalOpen(true);
    } else {
      // PENDING / CONFIRMED: Hủy trực tiếp không cần lý do hoặc có thể xác nhận
      if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
      executeCancel(order.id || order._id, '');
    }
  };

  const executeCancel = async (orderId, reason) => {
    try {
      const result = await orderService.cancelOrder(orderId, reason);
      alert(result.message || 'Đã xử lý yêu cầu hủy đơn');
      setIsCancelModalOpen(false);
      setCancellingOrderId(null);
      fetchOrders(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  const isCancelable = (order) => {
    // Nếu shop đã từ chối yêu cầu hủy của đơn hàng này, không cho phép tiếp tục hủy
    if (order.cancellationRejectionReason) return false;

    const allowed = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING];
    if (!allowed.includes(order.status)) return false;

    // Phải dưới 30 phút
    const createdTime = new Date(order.createdAt).getTime();
    const diffMins = (Date.now() - createdTime) / 1000 / 60;
    return diffMins < 30;
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
              const cancelable = isCancelable(order);
              
              return (
                <div 
                  key={order.id || order._id} 
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
                      
                      <div className="flex items-center gap-3">
                        {cancelable && (
                          <div className="flex items-center text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-4 py-2 select-none">
                            <span>Thời hạn hủy:</span>
                            <OrderCancelCountdown createdAt={order.createdAt} onTimeout={fetchOrders} />
                          </div>
                        )}
                        <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border ${Config.bg} ${Config.color} ${Config.border} shadow-sm backdrop-blur-sm`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-[0.15em]">{Config.label}</span>
                        </div>
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

                      {/* Hiển thị quà tặng kèm */}
                      {order.giftItems && order.giftItems.length > 0 && (
                        <div className="mt-6 p-4 bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/20 rounded-[1.5rem] flex flex-col gap-2">
                          <p className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-[0.15em] flex items-center gap-1.5">
                            <Gift className="w-3.5 h-3.5 animate-bounce" /> Quà tặng kèm khuyến mãi:
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {order.giftItems.map((gift, gIdx) => (
                              <div key={gIdx} className="flex items-center gap-2 bg-white dark:bg-card px-3 py-1.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10 shadow-sm">
                                {gift.imageUrl && (
                                  <img src={gift.imageUrl} alt={gift.name} className="w-6 h-6 object-cover rounded-md" />
                                )}
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{gift.name}</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-black">x{gift.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hiển thị voucher */}
                      {order.promotionCode && (
                        <div className="mt-4 p-4 bg-rose-50/40 dark:bg-rose-950/15 border border-rose-100/50 dark:border-rose-900/20 rounded-[1.5rem] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-xl font-mono text-xs font-black uppercase tracking-wider shadow-md shadow-rose-500/20">
                              <Tag className="w-3.5 h-3.5" /> {order.promotionCode}
                            </div>
                            {order.discountAmount > 0 && (
                              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">
                                Đã giảm <span className="text-rose-600 dark:text-rose-400 font-black">-{order.discountAmount.toLocaleString()}đ</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-8 pt-10 border-t border-slate-50">
                      <div className="flex items-center gap-10">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">
                            {order.discountAmount > 0 ? "Tổng thanh toán" : "Tổng cộng"}
                          </p>
                          <p className="text-4xl font-black text-primary tracking-tighter">
                            {(order.finalAmount !== undefined ? order.finalAmount : (order.totalAmount - (order.discountAmount || 0))).toLocaleString()}đ
                          </p>
                          {order.discountAmount > 0 && (
                            <p className="text-[10px] text-slate-400 font-bold mt-1 line-through">
                              {order.totalAmount.toLocaleString()}đ
                            </p>
                          )}
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
                          onClick={() => handleFollowOrder(order)}
                          className="rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] px-8 h-12 border-slate-200 hover:bg-slate-50 hover:text-primary transition-all shadow-sm"
                        >
                          Theo dõi
                        </Button>
                        
                        {cancelable && (
                          <Button
                            variant="destructive"
                            onClick={() => handleCancelClick(order)}
                            className="rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-xl shadow-destructive/20 hover:scale-105 transition-transform"
                          >
                            {order.status === ORDER_STATUS.PROCESSING ? 'Yêu cầu hủy' : 'Hủy đơn'}
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

      {/* Modal chi tiết & tiến trình đơn hàng */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}

      {/* Modal nhập lý do hủy đơn */}
      <CancelReasonModal 
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancellingOrderId(null);
        }}
        onSubmit={(reason) => executeCancel(cancellingOrderId, reason)}
      />
    </div>
  );
};

export default Orders;
