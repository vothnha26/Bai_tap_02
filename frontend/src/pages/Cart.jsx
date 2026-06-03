import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router';
import { Trash2, ShoppingCart, ArrowLeft, ChevronRight, Package, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import CartSkeleton from './Cart/components/CartSkeleton';
import CartItem from './Cart/components/CartItem';
import CartSummary from './Cart/components/CartSummary';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, itemCount } = useCart();

  if (loading) {
    return <CartSkeleton />;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-32 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="bg-white dark:bg-slate-900 p-20 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner border border-slate-100 dark:border-slate-700">
            <ShoppingCart className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">Giỏ hàng đang trống</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-12 max-w-sm mx-auto font-medium leading-relaxed">
            Có vẻ như bạn chưa chọn được món đồ ưng ý. Đừng lo, hàng ngàn sản phẩm công nghệ tuyệt vời đang chờ bạn khám phá!
          </p>
          <Link to="/search">
            <Button size="lg" className="rounded-2xl px-12 h-16 font-black uppercase tracking-[0.15em] text-xs shadow-2xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">
              Bắt đầu mua sắm ngay
            </Button>
          </Link>
        </motion.div>
        
        <div className="mt-20">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-8">Có thể bạn quan tâm</p>
           {/* Section này có thể render SimilarProducts hoặc Trending items */}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-12 overflow-hidden whitespace-nowrap">
        <Link to="/" className="hover:text-blue-600 transition-colors shrink-0">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="text-slate-900 dark:text-white">Giỏ hàng</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="space-y-4">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-6"
          >
            <div className="p-5 bg-blue-600 text-white rounded-[2rem] shadow-xl shadow-blue-600/20">
              <ShoppingCart className="w-10 h-10" />
            </div>
            Giỏ hàng
          </motion.h1>
          <div className="flex items-center gap-3 pl-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
               <Package className="w-3.5 h-3.5" />
               {itemCount} Sản phẩm
            </span>
            <span className="text-slate-300 text-xs font-medium italic">Sẵn sàng để thanh toán</span>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearCart}
          className="text-slate-400 hover:text-rose-500 font-black uppercase text-[9px] tracking-widest flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl transition-all border border-slate-100 dark:border-slate-800"
        >
          <Trash2 className="w-4 h-4" />
          Làm trống túi hàng
        </motion.button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item, index) => (
                <CartItem 
                  key={item.productId} 
                  item={item} 
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
          
          <Link to="/search" className="inline-flex items-center gap-4 text-slate-400 hover:text-blue-600 transition-all font-black uppercase text-[10px] tracking-[0.2em] group mt-12 py-4 px-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            Tiếp tục khám phá sản phẩm
          </Link>
        </div>

        <aside className="lg:col-span-1">
          <CartSummary cart={cart} itemCount={itemCount} />
          
          {/* Support / Help card */}
          <div className="mt-8 p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group cursor-pointer">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
             <div className="relative z-10">
                <Sparkles className="w-8 h-8 mb-4 opacity-80" />
                <h3 className="font-black text-lg mb-2 tracking-tight">Cần hỗ trợ?</h3>
                <p className="text-white/70 text-xs font-medium leading-relaxed">Đội ngũ của chúng tôi luôn sẵn sàng giúp bạn hoàn tất đơn hàng 24/7.</p>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
