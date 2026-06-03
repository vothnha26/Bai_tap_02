import { motion } from 'motion/react';
import { Clock, CheckCircle, Package, Truck } from 'lucide-react';

export default function OrderStepper({ status }) {
  const steps = [
    { key: 'PENDING', label: 'Đơn mới', icon: Clock },
    { key: 'CONFIRMED', label: 'Xác nhận', icon: CheckCircle },
    { key: 'PROCESSING', label: 'Chuẩn bị', icon: Package },
    { key: 'SHIPPING', label: 'Đang giao', icon: Truck },
    { key: 'DELIVERED', label: 'Thành công', icon: CheckCircle },
  ];

  const statusIndexMap = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPING: 3,
    DELIVERED: 4,
  };

  const currentIndex = statusIndexMap[status] !== undefined ? statusIndexMap[status] : -1;

  return (
    <div className="mb-12 px-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
        
        <motion.div 
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 rounded-full" 
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1, type: "spring", stiffness: 50 }}
        />

        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <motion.div 
                animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                  isCurrent 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : isActive 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300'
                }`}
              >
                <StepIcon className="w-5 h-5" />
              </motion.div>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-4 whitespace-nowrap transition-colors ${
                isCurrent ? 'text-blue-600' : isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
