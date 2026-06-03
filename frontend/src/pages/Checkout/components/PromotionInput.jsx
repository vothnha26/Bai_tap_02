import { Tag, Loader2, X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PromotionInput({ 
  code, 
  setCode, 
  onApply, 
  isLoading, 
  error, 
  applied, 
  onRemove,
  applicablePromotions,
  onQuickApply
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
        <Tag className="w-5 h-5 text-rose-500" /> Khuyến mãi
      </h3>
      
      <div className="flex gap-3">
        <div className="flex-1 relative">
           <input
             type="text"
             value={code}
             disabled={applied || isLoading}
             onChange={(e) => setCode(e.target.value.toUpperCase())}
             placeholder="Nhập mã giảm giá..."
             className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-bold uppercase tracking-widest placeholder:text-slate-400 placeholder:normal-case"
           />
           {applied && (
             <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-1 rounded-full">
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
             </div>
           )}
        </div>
        {!applied ? (
          <Button 
            onClick={onApply} 
            disabled={!code || isLoading}
            className="px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
          </Button>
        ) : (
          <Button 
            variant="outline"
            onClick={onRemove}
            className="px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest border-rose-100 text-rose-500 hover:bg-rose-50"
          >
            <X className="w-4 h-4 mr-2" /> Gỡ bỏ
          </Button>
        )}
      </div>

      {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest pl-2">{error}</p>}

      {applicablePromotions?.length > 0 && !applied && (
        <div className="space-y-3 pt-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã giảm giá dành cho bạn</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {applicablePromotions.map((promo) => (
              <button
                key={promo._id}
                onClick={() => onQuickApply(promo.code)}
                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-200 transition-all shrink-0 group text-left"
              >
                <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                 <p className="text-xs font-black text-slate-900 dark:text-white">{promo.code}</p>
                 <p className="text-[9px] font-bold text-slate-400">
                   {promo.discountType === 'PERCENTAGE'
                     ? `Giảm ${promo.discountValue}% trên tổng đơn`
                     : `Giảm ${Number(promo.discountValue).toLocaleString('vi-VN')}₫`
                   }
                 </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Check({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
