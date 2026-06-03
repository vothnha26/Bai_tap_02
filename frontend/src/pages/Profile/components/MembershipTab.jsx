import { motion, AnimatePresence } from 'motion/react';
import { Award, Zap, Trophy, Coins, History, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import TierProgressBar from '../TierProgressBar';
import RewardHistory from '../RewardHistory';
import MembershipSkeleton from './MembershipSkeleton';

export default function MembershipTab({ membership, tiers, logs, isLoading, error }) {
  if (isLoading) return <MembershipSkeleton />;

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] border border-rose-100 text-center shadow-xl">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
           <Zap className="w-10 h-10 text-rose-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Hệ thống đang bảo trì</h3>
        <p className="text-slate-500 mb-8 font-medium">Chúng tôi không thể lấy dữ liệu hạng thành viên lúc này. Vui lòng thử lại sau.</p>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Tải lại trang</button>
      </div>
    );
  }

  const currentTier = membership?.tierId;
  const nextTier = tiers?.find(t => t.minPoints > (membership?.rollingPoints || 0));

  return (
    <div className="space-y-12 pb-12">
      {/* Tier Progress Card - Liquid Glass */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 relative z-10">
          <div>
             <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100/50 mb-4">
               <Award className="w-3 h-3" /> Cấp độ hiện tại
             </span>
             <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-4">
                {currentTier?.name || 'Khách hàng mới'}
                <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
             </h2>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 text-center min-w-[200px]">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Điểm khả dụng</p>
             <div className="flex items-center justify-center gap-3">
                <Coins className="w-6 h-6 text-emerald-500" />
                <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{(membership?.currentPoints || 0).toLocaleString()}</span>
             </div>
          </div>
        </div>

        <TierProgressBar 
          currentPoints={membership?.rollingPoints || 0} 
          tiers={tiers} 
          currentTier={currentTier} 
        />
      </motion.div>

      {/* Benefits Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-emerald-50 dark:bg-emerald-950/20 p-10 rounded-[2.5rem] border border-emerald-100/50 dark:border-emerald-900/30 group"
        >
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-8 group-hover:rotate-6 transition-transform">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight mb-4 uppercase">Đặc quyền hạng {currentTier?.name || ''}</h3>
          <ul className="space-y-3">
             {currentTier?.benefits?.map((b, idx) => (
               <li key={idx} className="flex items-center gap-2 text-sm font-bold text-emerald-800/70 dark:text-emerald-400/80">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {b.benefitId?.name}
               </li>
             )) || <li className="text-sm font-bold text-emerald-800/50 italic">Đang cập nhật đặc quyền...</li>}
          </ul>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-blue-50 dark:bg-blue-950/20 p-10 rounded-[2.5rem] border border-blue-100/50 dark:border-blue-900/30 group md:col-span-2 relative overflow-hidden"
        >
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full -mr-24 -mb-24 blur-2xl" />
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 mb-8 group-hover:-rotate-6 transition-transform">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-blue-950 dark:text-blue-100 tracking-tight mb-4 uppercase">Mục tiêu tiếp theo</h3>
          {nextTier ? (
            <div className="space-y-6 relative z-10">
               <p className="text-blue-800/70 dark:text-blue-300 font-medium">
                 Bạn cần tích lũy thêm <strong className="text-blue-600 dark:text-blue-400 font-black text-lg">{((nextTier.minPoints || 0) - (membership?.rollingPoints || 0)).toLocaleString()}</strong> điểm để thăng hạng <strong className="font-black text-blue-900 dark:text-white">{nextTier.name}</strong>.
               </p>
               <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {nextTier.benefits?.map((b, idx) => (
                    <div key={idx} className="bg-white/50 dark:bg-slate-900/50 px-5 py-3 rounded-2xl border border-blue-200/30 shrink-0">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Đặc quyền mới</p>
                       <p className="text-xs font-bold text-blue-900 dark:text-white">{b.benefitId?.name}</p>
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <p className="text-blue-800/70 dark:text-blue-300 font-black text-lg">Chúc mừng! Bạn đã đạt hạng cao nhất.</p>
          )}
        </motion.div>
      </div>

      {/* History Section */}
      <div className="pt-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 flex items-center gap-4">
               <History className="w-8 h-8 text-slate-400" />
               Lịch sử tích điểm
            </h3>
            <div className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
        
        <RewardHistory logs={logs} />
      </div>
    </div>
  );
}
