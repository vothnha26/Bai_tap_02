import { ShieldCheck, Coins, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderSummaryFocus({ 
  cart, 
  itemCount, 
  onPlaceOrder, 
  isPlacing,
  appliedPromotion
}) {
  const finalAmount = appliedPromotion 
    ? Math.max(0, cart.totalAmount - (appliedPromotion.discountAmount || 0))
    : cart.totalAmount;

  return (
    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sticky top-24 overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      
      <h2 className="text-2xl font-black mb-10 text-slate-900 dark:text-white uppercase tracking-tighter border-b border-slate-50 dark:border-slate-800 pb-6 relative z-10">
        Xác nhận đơn hàng
      </h2>
      
      <div className="space-y-6 mb-10 relative z-10">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" /> {itemCount} Sản phẩm
          </span>
          <span className="text-slate-900 dark:text-white font-black text-sm tabular-nums">{(cart.totalAmount || 0).toLocaleString()}₫</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
            <Truck className="w-3.5 h-3.5" /> Vận chuyển
          </span>
          <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Miễn phí</span>
        </div>

        {appliedPromotion && (
          <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-4 py-3 rounded-2xl animate-in zoom-in-95">
             <span className="text-rose-600 dark:text-rose-400 font-black text-[9px] uppercase tracking-widest">Khuyến mãi ({appliedPromotion.code})</span>
             <span className="text-rose-600 dark:text-rose-400 font-black text-sm tabular-nums">-{(appliedPromotion.discountAmount || 0).toLocaleString()}₫</span>
          </div>
        )}
        
        {cart.totalRewardPoints > 0 && (
          <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl">
            <span className="text-blue-700 dark:text-blue-400 font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-600 animate-pulse" /> +{cart.totalRewardPoints} pts
            </span>
          </div>
        )}
        
        <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="flex justify-between items-end">
            <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Tổng thanh toán</span>
            <span className="text-4xl font-black text-blue-600 dark:text-blue-400 leading-none tracking-tighter tabular-nums">{(finalAmount || 0).toLocaleString()}₫</span>
          </div>
        </div>
      </div>

      <Button 
        size="lg"
        disabled={isPlacing}
        onClick={onPlaceOrder}
        className="w-full h-16 rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-600/20 group/btn relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {isPlacing ? 'Đang xử lý...' : 'Đặt hàng ngay'}
          {!isPlacing && <ShieldCheck className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />}
        </span>
        {isPlacing && <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />}
      </Button>

      <div className="mt-8 text-center">
         <p className="text-[9px] text-slate-400 font-bold leading-relaxed px-4">
           Bằng việc đặt hàng, bạn đồng ý với các <strong className="text-slate-600">Điều khoản dịch vụ</strong> và <strong className="text-slate-600">Chính sách bảo mật</strong> của PubliCast.
         </p>
      </div>
    </div>
  );
}
