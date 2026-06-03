import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { productApi } from '../services/product.service';
import { categoryApi } from '../services/category.service';
import { Star, TrendingUp, Zap, Package, ChevronRight, Eye, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';
import { Button } from '../components/ui/button';
import HomeSkeleton from './Home/components/HomeSkeleton';
import HeroSection from './Home/components/HeroSection';
import CategoryBento from './Home/components/CategoryBento';

export default function Home() {
  const [data, setData] = useState({
    promotionProducts: [],
    newProducts: [],
    bestSellers: [],
    mostViewed: [],
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [homeRes, catRes] = await Promise.all([
          productApi.getHomePage(),
          categoryApi.getAll()
        ]);
        
        setData({
          promotionProducts: homeRes.data.promoted || [],
          newProducts: homeRes.data.latest || [],
          bestSellers: homeRes.data.bestSellers || [],
          mostViewed: homeRes.data.mostViewed || [],
        });
        setCategories(catRes.data || []);
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu trang chủ');
      } finally {
        // Giả lập độ trễ nhẹ để Skeleton mượt hơn
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    fetchHomeData();
  }, []);

  if (isLoading) {
    return <HomeSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[80dvh] flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl text-center max-w-lg">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Lỗi kết nối</h2>
          <p className="text-slate-500 font-medium mb-10">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="h-14 px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
          >
            Thử lại ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <AnimatePresence mode="wait">
        <motion.div
          key="home-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section - Asymmetric Design */}
          <HeroSection />

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-20 relative z-20">
            {/* Feature Cards - Diffusion Shadows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
              {[
                { title: "Miễn phí vận chuyển", desc: "Áp dụng cho mọi đơn hàng từ 500.000₫ trên toàn quốc.", icon: Package, color: "blue" },
                { title: "Giao hàng hỏa tốc", desc: "Nhận hàng chỉ trong 2-4 giờ tại các thành phố lớn.", icon: Zap, color: "emerald" },
                { title: "Cam kết chính hãng", desc: "Hoàn tiền 200% nếu phát hiện hàng giả, hàng nhái.", icon: ShieldCheck, color: "orange" }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 flex items-start gap-8 hover:-translate-y-2 transition-all duration-500 group"
                >
                  <div className={`bg-${feature.color}-50 dark:bg-${feature.color}-900/30 p-5 rounded-[1.5rem] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <feature.icon className={`w-8 h-8 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl mb-3 text-slate-900 dark:text-white tracking-tight">{feature.title}</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Categories Bento Grid */}
            <CategoryBento categories={categories} />

            {/* Top Best Sellers */}
            {data.bestSellers.length > 0 && (
              <section className="mb-32">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-4">
                      <TrendingUp className="w-10 h-10 text-orange-500" />
                      Top Bán Chạy
                    </h2>
                    <p className="text-slate-400 font-medium mt-2">Những sản phẩm được săn đón nhất tuần qua</p>
                  </div>
                  <Link to="/search?sortBy=soldCount&order=desc">
                    <Button variant="ghost" className="rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-primary transition-colors">
                      Xem tất cả <ChevronRight className="ml-1 w-3 h-3" />
                    </Button>
                  </Link>
                </div>

                <div className="relative group">
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-6">
                      {data.bestSellers.map((product) => (
                        <CarouselItem key={product._id || product.id} className="pl-6 md:basis-1/2 lg:basis-1/4">
                          <ProductCard product={product} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="flex justify-end gap-3 mt-10">
                      <CarouselPrevious className="static translate-y-0 h-14 w-14 rounded-2xl border-slate-100 hover:bg-slate-50 transition-all shadow-sm" />
                      <CarouselNext className="static translate-y-0 h-14 w-14 rounded-2xl border-slate-100 hover:bg-slate-50 transition-all shadow-sm" />
                    </div>
                  </Carousel>
                </div>
              </section>
            )}

            {/* New Products Section */}
            {data.newProducts.length > 0 && (
              <section className="mb-32">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Mới Lên Kệ</h2>
                    <p className="text-slate-400 font-medium mt-2">Cập nhật công nghệ mới nhất mỗi ngày</p>
                  </div>
                  <Link to="/search?sortBy=createdAt&order=desc">
                    <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest border-slate-200">
                      Xem toàn bộ
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {data.newProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Promotion Banner - High End */}
            <section className="mb-32 rounded-[3.5rem] bg-slate-900 dark:bg-blue-950 overflow-hidden relative p-12 lg:p-24 shadow-2xl shadow-blue-900/20">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
              <div className="relative z-10 grid lg:grid-cols-2 items-center gap-16">
                <div>
                  <span className="inline-block bg-yellow-400 text-slate-950 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-8">
                    Ưu đãi giới hạn
                  </span>
                  <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
                    Giảm Đến 50% <br/>
                    Cho Phụ Kiện
                  </h2>
                  <p className="text-slate-300 text-lg mb-12 max-w-md font-medium leading-relaxed">
                    Áp dụng cho tất cả tai nghe, sạc dự phòng và đồ chơi công nghệ. Chỉ trong tuần này!
                  </p>
                  <Link to="/search?category=phu-kien-cong-nghe">
                    <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-slate-950 hover:bg-blue-50 font-black uppercase text-xs tracking-widest shadow-xl">
                      Nhận ưu đãi ngay
                    </Button>
                  </Link>
                </div>
                <div className="hidden lg:block relative">
                   <div className="aspect-video w-full bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-2xl relative">
                      <Package className="w-32 h-32 text-white/10 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
                   </div>
                </div>
              </div>
            </section>
          </section>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProductCard({ product }) {
  const hasDiscount = product.hasActiveDiscount === true;
  const discount = hasDiscount && product.price
    ? Math.round(((product.price - product.effectivePrice) / product.price) * 100)
    : 0;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full group/card hover:shadow-2xl transition-all duration-500"
    >
      <Link to={`/product/${product._id || product.id}`} className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
        <img
          src={product.images?.[0] || '/placeholder-product.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
        />
        {hasDiscount && (
          <div className="absolute top-6 left-6 bg-rose-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
            -{discount}%
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
          <div className="p-4 bg-white rounded-full text-black scale-50 group-hover/card:scale-100 transition-transform duration-500">
            <Eye className="w-6 h-6" />
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
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã bán {product.soldCount || 0}</span>
            <Link to={`/product/${product._id || product.id}`}>
              <Button size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-primary/10">Mua ngay</Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
