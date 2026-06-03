import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative min-h-[80dvh] flex items-center overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Orbs - Liquid Glass aesthetic */}
      <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Side: Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-8 border border-blue-100 dark:border-blue-800">
                <Sparkles className="w-3 h-3" /> New Season 2026
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-8">
                Khai Phá <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Công Nghệ</span> <br />
                Đẳng Cấp Việt
              </h1>
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl mb-12 leading-relaxed mx-auto lg:mx-0">
                PubliCast mang đến những thiết bị công nghệ tiên phong, kết hợp hoàn hảo giữa công năng và thẩm mỹ tinh tế.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/search">
                  <Button size="lg" className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.1em] text-xs shadow-2xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto">
                    Khám phá ngay <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/search?category=khuyen-mai">
                  <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.1em] text-xs border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all w-full sm:w-auto">
                    Xem khuyến mãi
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Abstract Asset (Liquid Glass) */}
          <motion.div 
            className="flex-1 relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.2 }}
          >
            <div className="relative aspect-square w-full max-w-[500px] mx-auto">
              {/* Glass Card 1 */}
              <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] rounded-[3rem] bg-gradient-to-br from-white/40 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl z-20 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img 
                  src="https://picsum.photos/seed/tech-hero/800/800" 
                  alt="Tech Hero" 
                  className="w-full h-full object-cover mix-blend-overlay grayscale contrast-125 opacity-50"
                />
              </div>
              
              {/* Decorative Floating Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-32 h-32 rounded-3xl bg-blue-600 shadow-xl shadow-blue-600/40 z-30 flex items-center justify-center text-white"
              >
                <Sparkles className="w-12 h-12" />
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-10 left-0 w-40 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl z-30 flex items-center px-6 gap-3"
              >
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Innovation</span>
              </motion.div>

              {/* Background Shapes */}
              <div className="absolute top-[-5%] left-[-5%] w-[110%] h-[110%] rounded-full border-2 border-dashed border-slate-100 dark:border-slate-800 animate-[spin_60s_linear_infinite]" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
