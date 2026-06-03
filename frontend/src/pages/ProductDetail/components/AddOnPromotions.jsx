import { motion } from 'motion/react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddOnPromotions({ addOns, selectedIds, onToggle }) {
  if (!addOns || addOns.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="flex items-center gap-3 mb-8">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Mua kèm deal hời</h3>
        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addOns.map((addon) => {
          const isSelected = selectedIds.includes(addon.targetProductId?._id || addon.targetProductId);
          
          return (
            <motion.div
              key={addon._id}
              whileHover={{ y: -5 }}
              className={`relative p-5 rounded-[2rem] border transition-all duration-500 cursor-pointer group ${
                isSelected 
                  ? 'bg-blue-50/50 border-blue-600 dark:bg-blue-900/10' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200'
              }`}
              onClick={() => onToggle(addon.targetProductId?._id || addon.targetProductId)}
            >
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-800">
                  <img src={addon.targetProductId?.images?.[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">
                    Tiết kiệm {(addon.saving || 0).toLocaleString()}₫
                  </p>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mb-1">{addon.targetProductId?.name}</h4>
                  <div className="flex items-center gap-2">
                     <span className="text-blue-600 dark:text-blue-400 font-black text-sm">{(addon.addOnPrice || 0).toLocaleString()}₫</span>
                     <span className="text-slate-300 dark:text-slate-600 text-[10px] line-through font-bold">{(addon.targetProductId?.price || 0).toLocaleString()}₫</span>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}>
                  {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
