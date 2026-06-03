import { Package, X, Phone, MapPin, Truck, CreditCard, Gift, Tag, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import OrderStepper from './OrderStepper';
import { formatAddress } from '@/utils/utils';

export default function OrderDetailView({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] border border-white/20 shadow-2xl relative custom-scrollbar"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10 md:p-12">
          <div className="flex items-center gap-6 mb-12">
            <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-600/20">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Chi tiết đơn hàng</h2>
              <p className="text-blue-600 font-mono text-sm font-black mt-1">Mã: #{order.id}</p>
            </div>
          </div>

          <OrderStepper status={order.status} />

          {order.status === 'CANCELLED' && (
            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 p-6 rounded-[2rem] flex items-center gap-5 mb-10">
              <XCircle className="w-10 h-10 text-rose-500 shrink-0" />
              <div>
                <h4 className="text-sm font-black text-rose-950 dark:text-rose-200 uppercase tracking-widest">Đơn hàng đã bị hủy</h4>
                <p className="text-rose-600 dark:text-rose-400/80 text-[10px] font-bold mt-1 uppercase tracking-wider">{order.cancellationReason || 'Lý do hệ thống'}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                <Truck className="w-3.5 h-3.5" /> Thông tin nhận hàng
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex gap-4">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-black tabular-nums">{order.phone}</span>
                </div>
                <div className="flex gap-4">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed">
                    {formatAddress(order.shippingAddress)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                <CreditCard className="w-3.5 h-3.5" /> Hình thức thanh toán
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Phương thức</span>
                  <span className="text-slate-900 dark:text-white text-xs font-black uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Trạng thái</span>
                  <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">{order.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-12">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 text-center">Danh sách sản phẩm</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-6 p-5 bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 items-center transition-all hover:border-blue-200">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-50 dark:border-slate-600 shrink-0 shadow-sm">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white text-sm font-black truncate tracking-tight">{item.name}</p>
                    <p className="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">
                      {item.quantity} x {(item.price || 0).toLocaleString()}₫
                    </p>
                  </div>
                  <p className="text-slate-900 dark:text-white font-black text-sm tabular-nums">{((item.price || 0) * (item.quantity || 0)).toLocaleString()}₫</p>
                </div>
              ))}
            </div>
          </div>

          {order.promotionCode && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100/70 dark:border-rose-900/30 p-6 rounded-[2rem] mb-12 flex items-center justify-between group transition-all hover:scale-[1.01]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:rotate-6 transition-transform">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest">Voucher: {order.promotionCode}</p>
                  <p className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-widest">Ưu đãi đã áp dụng</p>
                </div>
              </div>
              {(order.discountAmount || 0) > 0 && (
                <p className="text-rose-600 dark:text-rose-400 font-black text-lg tabular-nums">-{(order.discountAmount || 0).toLocaleString()}₫</p>
              )}
            </div>
          )}

          <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-between items-end">
            <div>
              <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em] mb-2">Tổng quyết toán</p>
              <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter tabular-nums">
                {(order.finalAmount || 0).toLocaleString()}₫
              </p>
            </div>
            <Button size="lg" onClick={onClose} className="rounded-2xl px-12 h-14 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Đóng</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
