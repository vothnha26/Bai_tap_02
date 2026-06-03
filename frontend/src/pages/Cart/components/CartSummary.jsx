import { Link } from 'react-router';
import { CreditCard, ShieldCheck, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartSummary({ cart, itemCount }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sticky top-24 overflow-hidden group">
      {/* Liquid Glass refraction elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl transition-transform duration-1000 group-hover:scale-150" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-600/5 rounded-full -ml-12 -mb-12 blur-2xl" />
      
      <h2 className="text-2xl font-black mb-10 text-slate-900 dark:text-white uppercase tracking-tighter border-b border-slate-50 dark:border-slate-800 pb-6 relative z-10">
        Tóm tắt đơn hàng
      </h2>
      
      <div className="space-y-6 mb-10 relative z-10">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Tạm tính ({itemCount} món)</span>
          <span className="text-slate-900 dark:text-white font-black text-lg tabular-nums">{(cart.totalAmount || 0).toLocaleString()}₫</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Vận chuyển</span>
          <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-100/50">Miễn phí</span>
        </div>
        
        {cart.totalRewardPoints > 0 && (
          <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-5 rounded-[1.5rem] shadow-sm">
            <span className="text-blue-700 dark:text-blue-400 font-black text-[9px] uppercase tracking-[0.15em] flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-600 animate-pulse" />
              Ví điểm dự kiến
            </span>
            <span className="text-blue-800 dark:text-blue-300 font-black text-lg">+{cart.totalRewardPoints} pts</span>
          </div>
        )}
        
        <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Tổng cộng</span>
            <span className="text-4xl font-black text-blue-600 dark:text-blue-400 leading-none tracking-tighter tabular-nums">{(cart.totalAmount || 0).toLocaleString()}₫</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 italic text-right mt-2">(Giá đã bao gồm các loại thuế phí)</p>
        </div>
      </div>

      <Link to="/checkout" className="block group/btn relative z-10">
        <Button className="w-full h-16 rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-600/20 relative overflow-hidden group-hover/btn:scale-[1.02] active:scale-95 transition-all">
          <span className="relative z-10 flex items-center justify-center gap-3">
            Thanh toán ngay
            <CreditCard className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
          </span>
        </Button>
      </Link>

      <div className="mt-10 pt-8 border-t border-dashed border-slate-100 dark:border-slate-800 space-y-4 relative z-10">
        <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-emerald-200">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Giao dịch an toàn</p>
            <p className="text-[9px] text-slate-500 leading-relaxed font-medium">Hệ thống bảo mật đa tầng, bảo vệ thông tin cá nhân tuyệt đối.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
