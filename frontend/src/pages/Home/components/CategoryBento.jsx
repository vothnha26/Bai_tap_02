import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Package, ChevronRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

export default function CategoryBento({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="mb-32">
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
            Khám Phá Danh Mục
          </h2>
          <div className="w-24 h-1.5 bg-blue-600 rounded-full" />
        </div>
        <Link to="/search" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black uppercase text-[10px] tracking-[0.2em] group">
          Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        {categories.slice(0, 7).map((cat, index) => {
          // Asymmetric Bento Logic
          let gridClass = "col-span-1 row-span-1";
          if (index === 0) gridClass = "col-span-2 row-span-2 min-h-[350px]";
          if (index === 1) gridClass = "col-span-2 row-span-1 min-h-[160px]";
          if (index === 6) gridClass = "col-span-2 row-span-1 min-h-[160px]";

          return (
            <motion.div key={cat.id || cat._id} variants={itemVariants} className={gridClass}>
              <Link
                to={`/search?category=${cat.slug || cat.id || cat._id}`}
                className="group relative flex flex-col items-center justify-center h-full w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] hover:border-blue-500/50 transition-all duration-500 overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                
                <div className={`
                  ${index === 0 ? 'w-24 h-24 mb-8' : 'w-12 h-12 mb-4'}
                  bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-500 relative z-10
                `}>
                  <Package className={`
                    ${index === 0 ? 'w-10 h-10' : 'w-6 h-6'}
                    text-slate-400 group-hover:text-white transition-colors duration-500
                  `} />
                </div>
                
                <h3 className={`
                  ${index === 0 ? 'text-2xl font-black' : 'text-sm font-bold'}
                  text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors relative z-10 text-center px-4
                `}>
                  {cat.name}
                </h3>

                {index === 0 && (
                  <p className="mt-3 text-slate-400 font-medium text-sm text-center px-8 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    Khám phá bộ sưu tập đầy đủ của {cat.name} với công nghệ mới nhất.
                  </p>
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
