import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Star, Eye, TrendingUp, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';

const ProductCard = React.forwardRef(({ product }, ref) => {
  const hasDiscount = product.hasActiveDiscount === true;
  const discount = hasDiscount && product.price
    ? Math.round(((product.price - product.effectivePrice) / product.price) * 100)
    : 0;

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -12 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full group/card hover:shadow-2xl transition-all duration-500"
    >
      <Link to={`/product/${product._id || product.id}`} className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
        <img
          src={product.images?.[0] || '/placeholder-product.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-6 left-6 bg-rose-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
            -{discount}%
          </div>
        )}

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
          <div className="flex gap-3 scale-50 group-hover/card:scale-100 transition-transform duration-500">
             <div className="p-4 bg-white rounded-2xl text-black hover:bg-blue-600 hover:text-white transition-colors">
               <Eye className="w-6 h-6" />
             </div>
             <div className="p-4 bg-white rounded-2xl text-black hover:bg-emerald-600 hover:text-white transition-colors">
               <ShoppingCart className="w-6 h-6" />
             </div>
          </div>
        </div>
      </Link>

      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/product/${product._id || product.id}`}>
            <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg mb-3 line-clamp-1 hover:text-blue-600 transition-colors tracking-tight">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < (product.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
            ))}
            <span className="text-[10px] font-bold text-slate-400 ml-1">({product.reviews || 0})</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">
              {(product.effectivePrice || 0).toLocaleString()}₫
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-300 line-through font-bold">
                {(product.price || 0).toLocaleString()}₫
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Bán {product.soldCount || 0}</span>
            </div>
            <Link to={`/product/${product._id || product.id}`}>
              <Button size="sm" variant="outline" className="rounded-xl font-black uppercase text-[9px] tracking-widest px-4 border-slate-100">
                Chi tiết
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
