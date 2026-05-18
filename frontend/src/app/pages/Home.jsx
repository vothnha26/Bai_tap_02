import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { productApi, categoryApi } from '../utils/api';
import { Star, TrendingUp, Zap, Package, Loader2, ChevronRight, Eye } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';

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
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <p className="font-bold mb-1">Lỗi tải dữ liệu</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-6xl font-black mb-6 leading-tight">
              Khai Phá Công Nghệ <br/>
              <span className="text-yellow-400 italic">Đẳng Cấp</span> Việt
            </h1>
            <p className="text-xl mb-10 text-blue-100 font-medium max-w-xl">
              Chào mừng đến với PubliCast - Nơi hội tụ những thiết bị công nghệ hàng đầu với mức giá ưu đãi nhất thị trường.
            </p>
            <div className="flex gap-4">
              <Link
                to="/search"
                className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center gap-2"
              >
                Mua sắm ngay <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to="/search?category=khuyen-mai"
                className="bg-blue-500/30 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95"
              >
                Xem khuyến mãi
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-start gap-6 hover:-translate-y-1 transition-all">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 text-gray-900">Miễn phí vận chuyển</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Áp dụng cho mọi đơn hàng từ 500.000đ trên toàn quốc.</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-start gap-6 hover:-translate-y-1 transition-all">
            <div className="bg-green-50 p-4 rounded-2xl">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 text-gray-900">Giao hàng hỏa tốc</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Nhận hàng chỉ trong 2-4 giờ tại các thành phố lớn.</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-start gap-6 hover:-translate-y-1 transition-all">
            <div className="bg-purple-50 p-4 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 text-gray-900">Cam kết chính hãng</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Hoàn tiền 200% nếu phát hiện hàng giả, hàng nhái.</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">Khám Phá Danh Mục</h2>
                <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
              </div>
              <Link to="/search" className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 group">
                Xem tất cả <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id || cat._id}
                  to={`/search?category=${cat.slug || cat.id || cat._id}`}
                  className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 text-center group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-all duration-500 group-hover:rotate-6 relative z-10">
                    <Package className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors relative z-10">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top Best Sellers - Horizontal Pagination */}
        {data.bestSellers.length > 0 && (
          <section className="mb-24 bg-gray-50 -mx-4 sm:-mx-8 lg:-mx-20 px-4 sm:px-8 lg:px-20 py-20 border-y border-gray-100">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  <TrendingUp className="w-10 h-10 text-orange-500" />
                  Top Bán Chạy Nhất
                </h2>
                <p className="text-gray-500 font-medium">Những sản phẩm được săn đón nhiều nhất tuần qua</p>
              </div>
              <div className="hidden sm:flex gap-2">
                <Link to="/search?sortBy=soldCount&order=desc" className="bg-white border border-gray-200 px-6 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                  Xem thêm
                </Link>
              </div>
            </div>

            <div className="px-12">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {data.bestSellers.map((product) => (
                    <CarouselItem key={product.id || product._id} className="md:basis-1/2 lg:basis-1/4 xl:basis-1/5">
                      <ProductCard product={product} variant="minimal" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-14 size-12 bg-white shadow-xl hover:bg-blue-600 hover:text-white transition-all border-none" />
                <CarouselNext className="-right-14 size-12 bg-white shadow-xl hover:bg-blue-600 hover:text-white transition-all border-none" />
              </Carousel>
            </div>
          </section>
        )}

        {/* Top Most Viewed - Horizontal Pagination */}
        {data.mostViewed.length > 0 && (
          <section className="mb-24 px-4 sm:px-0">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  <Eye className="w-10 h-10 text-blue-500" />
                  Sản Phẩm Xem Nhiều
                </h2>
                <p className="text-gray-500 font-medium">Được cộng đồng quan tâm và đánh giá cao</p>
              </div>
            </div>

            <div className="relative group/carousel">
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-6">
                  {data.mostViewed.map((product) => (
                    <CarouselItem key={product.id || product._id} className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <ProductCard product={product} showViews />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden group-hover/carousel:flex -left-6 bg-blue-600 text-white hover:bg-blue-700 size-12 border-none shadow-xl" />
                <CarouselNext className="hidden group-hover/carousel:flex -right-6 bg-blue-600 text-white hover:bg-blue-700 size-12 border-none shadow-xl" />
              </Carousel>
            </div>
          </section>
        )}

        {/* New Products Section */}
        {data.newProducts.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">Mới Lên Kệ</h2>
                <p className="text-gray-500 font-medium">Cập nhật những công nghệ mới nhất mỗi ngày</p>
              </div>
              <Link to="/search?sortBy=createdAt&order=desc" className="text-blue-600 hover:underline font-bold">
                Xem toàn bộ
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.newProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Promotion Banner */}
        <section className="mb-24 rounded-[40px] bg-indigo-900 overflow-hidden relative p-12 lg:p-20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
          <div className="relative z-10 grid lg:grid-cols-2 items-center gap-12">
            <div>
              <span className="bg-yellow-400 text-indigo-950 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest mb-6 inline-block">
                Ưu đãi giới hạn
              </span>
              <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 leading-tight">
                Giảm Đến 50% <br/>
                Cho Phụ Kiện
              </h2>
              <p className="text-indigo-200 text-xl mb-10 max-w-md">
                Áp dụng cho tất cả tai nghe, sạc dự phòng và đồ chơi công nghệ. Chỉ trong tuần này!
              </p>
              <Link to="/search?category=phu-kien-cong-nghe" className="bg-white text-indigo-900 px-12 py-5 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-colors inline-block active:scale-95 shadow-2xl shadow-black/20">
                Nhận ưu đãi ngay
              </Link>
            </div>
            <div className="hidden lg:block relative">
               <div className="w-full h-80 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <Package className="w-32 h-32 text-white/20 animate-pulse" />
               </div>
            </div>
          </div>
        </section>

        {/* Promoted Products */}
        {data.promotionProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">Đề Xuất Cho Bạn</h2>
                <div className="w-20 h-1.5 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.promotionProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

function ProductCard({ product, variant = "default", showViews = false }) {
  const discount = product.originalPrice || product.discountPrice
    ? Math.round(((product.price - (product.discountPrice || product.price)) / product.price) * 100)
    : 0;
  
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const originalPrice = hasDiscount ? product.price : product.originalPrice;

  if (variant === "minimal") {
    return (
      <Link
        to={`/product/${product.slug || product.id || product._id}`}
        className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 group flex items-center gap-4"
      >
        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
             <span className="text-blue-600 font-bold">{displayPrice.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="flex items-center gap-2 mt-1 opacity-60">
             <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
               Đã bán {product.soldCount || 0}
             </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product.slug || product.id || product._id}`}
      className="bg-white rounded-[32px] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-blue-200/20 hover:border-blue-200 transition-all duration-500 overflow-hidden group h-full flex flex-col"
    >
      <div className="relative overflow-hidden aspect-[4/5] bg-gray-50 p-2">
        <div className="w-full h-full rounded-[24px] overflow-hidden">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          {hasDiscount && (
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg shadow-red-500/30">
              -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
            </div>
          )}
          {product.isPromoted && (
            <div className="bg-yellow-400 text-indigo-900 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-yellow-400/30">
              Hot
            </div>
          )}
        </div>

        {showViews && (
          <div className="absolute bottom-5 right-5 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-white/10">
            <Eye className="w-3.5 h-3.5" />
            {product.viewCount?.toLocaleString() || 0} lượt xem
          </div>
        )}

        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-10 group-hover:translate-x-0">
           <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl">
             <TrendingUp className="w-5 h-5 text-blue-600" />
           </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors h-12 leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-black text-gray-700">{product.rating || 5}</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Đã bán {product.soldCount || 0}
          </span>
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-2xl font-black text-blue-600">
            {displayPrice.toLocaleString('vi-VN')}₫
          </span>
          {originalPrice && originalPrice > displayPrice && (
            <span className="text-sm text-gray-400 line-through font-medium">
              {originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
