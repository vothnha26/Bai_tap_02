import React from 'react';
import { Hash, Calendar, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

const OrderCard = React.forwardRef(({ order, statusConfig, onFollow, onCancel, cancelable, cancelCountdown, index }, ref) => {
  const Config = statusConfig[order.status] || statusConfig.PENDING;
  const Icon = Config.icon;

  return (
    <motion.div 
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 overflow-hidden group"
    >
      <div className="p-8 md:p-10">
        <div className="flex flex-wrap justify-between items-center gap-8 mb-10 pb-8 border-b border-slate-50 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-10">
            <div className="space-y-1.5">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                <Hash className="w-3.5 h-3.5" /> Mã đơn hàng
              </p>
              <p className="text-slate-900 dark:text-white font-mono font-black text-xl tracking-tight">#{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Ngày đặt
              </p>
              <p className="text-slate-900 dark:text-white font-black text-base tracking-tight tabular-nums">
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                <span className="text-slate-200 dark:text-slate-700 mx-3">•</span>
                <span className="text-slate-400 font-bold text-xs">
                  {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {cancelable && (
              <div className="flex items-center text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full px-5 py-2.5">
                <span className="mr-2 uppercase tracking-widest">Hủy đơn trong:</span>
                {cancelCountdown}
              </div>
            )}
            <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border ${Config.bg} ${Config.color} ${Config.border} shadow-sm backdrop-blur-md`}>
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">{Config.label}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex gap-8 items-center">
              <div className="w-20 h-20 shrink-0 rounded-3xl overflow-hidden border border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-500">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 dark:text-slate-200 font-black text-lg line-clamp-1 tracking-tight">{item.name}</p>
                <p className="text-slate-400 text-[10px] font-black mt-2 uppercase tracking-widest">
                  {item.quantity} x {(item.price || 0).toLocaleString()}₫
                </p>
              </div>
              <p className="text-slate-900 dark:text-white font-black text-xl tracking-tighter tabular-nums">{((item.price || 0) * (item.quantity || 0)).toLocaleString()}₫</p>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest pl-28 italic">
              + {order.items.length - 2} sản phẩm khác
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-8 pt-10 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-10">
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-black mb-2 tracking-widest">Tổng thanh toán</p>
              <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter tabular-nums">
                {(order.finalAmount || 0).toLocaleString()}₫
              </p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-slate-100 dark:bg-slate-800" />
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-black mb-2 tracking-widest">Thanh toán</p>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-tight">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={onFollow}
              className="rounded-2xl font-black uppercase tracking-widest text-[9px] px-10 h-14 border-slate-100 dark:border-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
            >
              Theo dõi
            </Button>
            
            {cancelable && (
              <Button
                variant="destructive"
                onClick={onCancel}
                className="rounded-2xl font-black uppercase tracking-widest text-[9px] px-10 h-14 shadow-xl shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Hủy đơn hàng
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default OrderCard;
