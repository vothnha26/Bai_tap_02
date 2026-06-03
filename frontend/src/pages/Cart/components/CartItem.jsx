import React from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, Coins } from 'lucide-react';

const CartItem = React.forwardRef(({ item, updateQuantity, removeFromCart, index }, ref) => {
  return (
    <motion.div 
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.05 }}
      className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-8 border border-slate-100 dark:border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-blue-200 transition-all duration-500 group"
    >
      <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-3xl overflow-hidden border border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-500">
        <img
          src={item.imageUrl || '/placeholder-product.png'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 w-full text-center sm:text-left space-y-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer">{item.name}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
            <span className="text-blue-600 dark:text-blue-400 font-black text-lg tracking-tight">{(item.price || 0).toLocaleString()}₫</span>
            {item.rewardPoints > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-lg border border-emerald-100/50 w-fit self-center sm:self-auto">
                <Coins className="w-3.5 h-3.5" />
                +{item.rewardPoints} pts / sp
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6">
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-black text-slate-900 dark:text-white text-lg tabular-nums">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm hover:bg-blue-600 hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => removeFromCart(item.productId)}
            className="flex items-center gap-2 text-slate-400 hover:text-rose-500 font-black uppercase text-[9px] tracking-widest transition-colors py-2 px-4 rounded-xl hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa khỏi giỏ
          </button>
        </div>
      </div>

      <div className="text-right shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50 w-full sm:w-auto">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thành tiền</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{((item.price || 0) * (item.quantity || 0)).toLocaleString()}₫</p>
      </div>
    </motion.div>
  );
});

export default CartItem;
