import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import orderService from '../../services/order.service';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  ShoppingBag, 
  TrendingUp, 
  LayoutDashboard, 
  LogOut,
  Percent
} from 'lucide-react';
import { Link } from 'react-router';
import { formatAddress } from '../../utils/utils';

const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  CANCELLATION_REQUESTED: 'CANCELLATION_REQUESTED',
};

const statusConfig = {
  PENDING: { label: 'Chờ duyệt', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle },
  PROCESSING: { label: 'Đang chuẩn bị', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Package },
  SHIPPING: { label: 'Đang giao hàng', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Truck },
  DELIVERED: { label: 'Thành công', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
  CANCELLATION_REQUESTED: { label: 'Yêu cầu hủy', color: 'text-red-400', bg: 'bg-red-400/10', icon: AlertTriangle },
};

const ManageOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrdersAdmin();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchAllOrders();
  }, [navigate]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatusAdmin(orderId, newStatus);
      alert('Cập nhật trạng thái thành công');
      fetchAllOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        // Cập nhật dữ liệu trong Modal nếu đang mở
        const latestOrder = (Array.isArray(orders) ? orders : []).find(o => o.id === orderId);
        if (latestOrder) setSelectedOrder({...latestOrder, status: newStatus});
      }
    } catch (error) {
      alert(error.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleRejectCancellation = async () => {
    if (!rejectionReasonInput.trim()) {
      alert('Vui lòng nhập lý do từ chối hủy đơn hàng');
      return;
    }
    try {
      await orderService.updateOrderStatusAdmin(rejectOrder.id, ORDER_STATUS.PROCESSING, rejectionReasonInput);
      alert('Đã từ chối yêu cầu hủy đơn hàng');
      setRejectOrder(null);
      setRejectionReasonInput('');
      fetchAllOrders();
    } catch (error) {
      alert(error.message || 'Lỗi khi từ chối yêu cầu hủy');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const renderTimeline = (order) => {
    const steps = [
      { key: 'PENDING', label: 'Đặt hàng' },
      { key: 'CONFIRMED', label: 'Xác nhận' },
      { key: 'PROCESSING', label: 'Chuẩn bị' },
      { key: 'SHIPPING', label: 'Giao hàng' },
      { key: 'DELIVERED', label: 'Thành công' }
    ];
    
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    const currentIdx = statusOrder.indexOf(order.status);

    return (
      <div className="py-6 border-b border-gray-50 mb-6">
        <div className="flex justify-between relative px-4">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
          {steps.map((step, index) => {
            const stepIdx = statusOrder.indexOf(step.key);
            const isCompleted = stepIdx <= currentIdx && order.status !== 'CANCELLED';
            const isCurrent = step.key === order.status;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-blue-100' : ''} transition-all`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                </div>
                <span className={`mt-2 text-[10px] font-black uppercase tracking-tighter ${isCompleted ? 'text-blue-600' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              Quản lý đơn hàng
            </h1>
            <p className="text-gray-500 mt-1">Duyệt và theo dõi trạng thái đơn hàng toàn hệ thống</p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 shadow-sm font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.keys(statusConfig).map(key => (
                <option key={key} value={key}>{statusConfig[key].label}</option>
              ))}
            </select>
            <button onClick={fetchAllOrders} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200">
              Làm mới
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-200">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-xl">Không tìm thấy đơn hàng nào</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const Config = statusConfig[order.status] || statusConfig.PENDING;
              const Icon = Config.icon;

              return (
                <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                  <div className="p-8">
                    <div className="flex flex-wrap justify-between items-start gap-6 mb-8">
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-[20px] ${Config.bg} ${Config.color} shadow-sm`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-blue-600 font-black font-mono text-lg">#{order.id.slice(-8).toUpperCase()}</span>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${Config.bg} ${Config.color}`}>
                              {Config.label}
                            </span>
                          </div>
                          <p className="text-gray-900 font-black text-lg mt-1">{order.userId?.fullName || 'Khách hàng ẩn danh'}</p>
                          <p className="text-xs text-gray-400 font-medium">{order.userId?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Tổng cộng</p>
                        <p className="text-3xl font-black text-gray-900">{order.totalAmount.toLocaleString()}₫</p>
                        <p className="text-[10px] text-blue-500 font-bold mt-2 bg-blue-50 px-2 py-1 rounded w-fit ml-auto">
                          {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3">Giao hàng đến</p>
                        <p className="text-sm font-bold text-gray-900">{order.phone}</p>
                        <p className="text-sm text-gray-500 mt-1 italic">"{formatAddress(order.shippingAddress)}"</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3">Sản phẩm ({order.items?.length || 0})</p>
                        <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-gray-50/50 p-2 rounded-2xl">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white flex-shrink-0">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase">
                                  SL: <span className="text-blue-600">{item.quantity}</span> × {item.price.toLocaleString()}₫
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {order.cancellationReason && (
                      <div className="mt-6 p-5 bg-red-50/50 rounded-2xl border border-red-100/50">
                        <p className="text-[10px] text-red-500 uppercase font-black tracking-widest mb-1">
                          Lý do yêu cầu hủy từ khách
                        </p>
                        <p className="text-sm font-bold text-red-950">"{order.cancellationReason}"</p>
                        {order.cancellationRejectionReason && (
                          <div className="mt-3 pt-3 border-t border-red-200/50">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">
                              Lý do Shop từ chối hủy
                            </p>
                            <p className="text-sm font-bold text-gray-700">"{order.cancellationRejectionReason}"</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-6 mt-8">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all text-xs font-black uppercase tracking-widest"
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </button>

                      <div className="flex flex-wrap gap-3">
                        {order.status === ORDER_STATUS.CANCELLATION_REQUESTED && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.CANCELLED)} 
                              className="px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-red-100"
                            >
                              Đồng ý hủy
                            </button>
                            <button 
                              onClick={() => setRejectOrder(order)} 
                              className="px-6 py-3 bg-gray-800 text-white rounded-2xl hover:bg-gray-900 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-gray-200"
                            >
                              Từ chối hủy
                            </button>
                          </>
                        )}
                        {order.status === ORDER_STATUS.PENDING && (
                          <button onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.CONFIRMED)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                            Xác nhận
                          </button>
                        )}
                        {order.status === ORDER_STATUS.CONFIRMED && (
                          <button onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.PROCESSING)} className="px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-100">
                            Chuẩn bị
                          </button>
                        )}
                        {order.status === ORDER_STATUS.PROCESSING && (
                          <button onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.SHIPPING)} className="px-6 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-100">
                            Giao hàng
                          </button>
                        )}
                        {order.status === ORDER_STATUS.SHIPPING && (
                          <button onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.DELIVERED)} className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-green-100">
                            Thành công
                          </button>
                        )}
                        {[ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(order.status) && (
                          <button onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.CANCELLED)} className="px-6 py-3 border-2 border-red-50 text-red-500 rounded-2xl hover:bg-red-50 transition-all text-xs font-black uppercase tracking-widest">
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-gray-400 font-mono text-sm mt-1 font-bold">#{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {renderTimeline(selectedOrder)}

              {selectedOrder.cancellationReason && (
                <div className="mb-6 p-5 bg-red-50 rounded-2xl border border-red-100/50">
                  <p className="text-[10px] text-red-500 uppercase font-black tracking-widest mb-1">
                    Lý do yêu cầu hủy từ khách
                  </p>
                  <p className="text-sm font-bold text-red-950">"{selectedOrder.cancellationReason}"</p>
                  {selectedOrder.cancellationRejectionReason && (
                    <div className="mt-3 pt-3 border-t border-red-200/50">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">
                        Lý do Shop từ chối hủy
                      </p>
                      <p className="text-sm font-bold text-gray-700">"{selectedOrder.cancellationRejectionReason}"</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                   <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Khách hàng</p>
                   <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                      <p className="font-black text-gray-900">{selectedOrder.userId?.fullName}</p>
                      <p className="text-gray-500 mt-1">{selectedOrder.phone}</p>
                      <p className="text-gray-500 mt-2 italic">"{formatAddress(selectedOrder.shippingAddress)}"</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Thanh toán</p>
                   <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                      <p className="text-gray-500">Hình thức: <span className="text-gray-900 font-black">{selectedOrder.paymentMethod}</span></p>
                      <p className="text-gray-500 mt-2">Trạng thái: 
                        <span className={`ml-2 font-black ${selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>
                          {selectedOrder.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </span>
                      </p>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Sản phẩm</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 border-b border-gray-50 pb-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 text-sm">
                        <p className="font-black text-gray-900 truncate">{item.name}</p>
                        <p className="text-gray-400 font-bold">SL: {item.quantity} × {item.price.toLocaleString()}₫</p>
                      </div>
                      <p className="font-black text-gray-900">{(item.price * item.quantity).toLocaleString()}₫</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-gray-900 font-black text-xl">Tổng thanh toán</span>
                    <span className="text-blue-600 font-black text-2xl">{selectedOrder.totalAmount.toLocaleString()}₫</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-gray-50/30 flex justify-end">
               <button onClick={() => setSelectedOrder(null)} className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">
                 Đóng lại
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Cancellation Reason Modal */}
      {rejectOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-900 mb-2">Từ chối yêu cầu hủy đơn</h3>
            <p className="text-gray-500 text-sm mb-6">
              Vui lòng nhập lý do từ chối yêu cầu hủy của đơn hàng <span className="font-mono font-bold text-blue-600">#{rejectOrder.id.slice(-8).toUpperCase()}</span>. Đơn hàng sẽ quay về trạng thái <span className="font-bold text-purple-600">Đang chuẩn bị</span> để tiếp tục giao dịch.
            </p>
            
            <textarea
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none h-32"
              placeholder="Nhập lý do từ chối hủy (ví dụ: Hàng đã đóng gói và bàn giao cho đơn vị vận chuyển)..."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
            />
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setRejectOrder(null);
                  setRejectionReasonInput('');
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-700 text-xs font-black uppercase tracking-widest transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRejectCancellation}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-200"
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
