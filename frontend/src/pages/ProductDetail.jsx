import { useParams, Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { productApi } from '../services/product.service';
import { useCart } from '../context/CartContext';
import { Star, Minus, Plus, ShoppingCart, Heart, Share2, Package, TrendingUp, Loader2, ChevronRight, Coins, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import DetailSkeleton from './ProductDetail/components/DetailSkeleton';
import ProductImageGallery from './ProductDetail/components/ProductImageGallery';
import AddOnPromotions from './ProductDetail/components/AddOnPromotions';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const sliderRef = useRef(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState([]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    const success = await addToCart(product._id || product.id, quantity);
    
    if (success && selectedAddOnIds.length > 0) {
      for (const addOnId of selectedAddOnIds) {
        await addToCart(addOnId, 1);
      }
    }

    if (success) {
      toast.success(selectedAddOnIds.length > 0 
        ? 'Đã thêm sản phẩm chính và phụ kiện mua kèm vào giỏ hàng!' 
        : 'Đã thêm sản phẩm vào giỏ hàng thành công',
        {
          description: `Bạn vừa thêm ${quantity} x ${product.name}`,
          action: {
            label: 'Xem giỏ hàng',
            onClick: () => window.location.href = '/cart'
          }
        }
      );
      setSelectedAddOnIds([]);
    } else {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
    setIsAdding(false);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await productApi.getDetail(id);
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Không thể tải thông tin sản phẩm');
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) return <DetailSkeleton />;

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-16 rounded-[3rem] shadow-2xl inline-block max-w-xl"
        >
          <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-10">
            <Package className="w-12 h-12 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-slate-900 dark:text-white">Lỗi tải dữ liệu</h2>
          <p className="mb-10 text-slate-500 font-medium leading-relaxed">{error || 'Không tìm thấy sản phẩm này trong hệ thống.'}</p>
          <Link to="/search">
            <Button size="lg" className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Quay về cửa hàng</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const { product, similarProducts, addOnPromotions = [] } = data;
  const categories = product.categories || [];

  // Làm phẳng danh sách sản phẩm mua kèm từ tất cả chương trình khuyến mãi
  const flattenedAddOns = addOnPromotions.flatMap(promo => 
    promo.addOnProducts.map(p => ({
      _id: p._id || p.id,
      targetProductId: p, // Map lại để tương thích với component AddOnPromotions
      discountValue: promo.discountValue,
      discountType: promo.discountType,
      addOnPrice: p.addOnPrice,
      saving: p.saving
    }))
  );

  const sliderSettings = {
    dots: false,
    infinite: product.images?.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    afterChange: (current) => setSelectedImage(current),
  };

  const goToImage = (index) => {
    setSelectedImage(index);
    sliderRef.current?.slickGoTo(index);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const toggleAddOn = (id) => {
    setSelectedAddOnIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const hasDiscount = product.hasActiveDiscount === true;
  const finalPrice = hasDiscount ? product.effectivePrice : product.price;
  const discount = hasDiscount && product.price
    ? Math.round(((product.price - product.effectivePrice) / product.price) * 100)
    : 0;

  // Tính tổng tiền dự kiến (Sản phẩm chính * số lượng + các sản phẩm mua kèm)
  const selectedAddOnsTotal = flattenedAddOns
    .filter(addon => selectedAddOnIds.includes(addon.targetProductId?._id || addon.targetProductId))
    .reduce((sum, addon) => sum + addon.addOnPrice, 0);
  
  const estimatedTotal = (finalPrice * quantity) + selectedAddOnsTotal;

  return (
    <div className="min-h-screen bg-[#FDFDFF] dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/search" className="hover:text-blue-600 transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24">
          {/* Left: Images */}
          <ProductImageGallery 
             images={product.images}
             name={product.name}
             discount={discount}
             selectedImage={selectedImage}
             goToImage={goToImage}
             sliderRef={sliderRef}
             sliderSettings={sliderSettings}
          />

          {/* Right: Product Info */}
          <div className="flex flex-col space-y-10">
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat) => (
                  <Link
                    key={cat.id || cat._id}
                    to={`/search?category=${cat.id || cat._id}`}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors border border-blue-100/50"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-6">
                {product.name}
              </h1>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1.5" />
                    <span className="font-black text-sm text-slate-800 dark:text-slate-200">{product.rating || 5}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.reviews || 0} Đánh giá</span>
                </div>
                <div className="w-px h-4 bg-slate-100" />
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Đã bán {product.soldCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Price & Action Box - Liquid Glass */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />
               
               <div className="flex items-baseline gap-4 mb-10 flex-wrap relative z-10">
                 <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                   {(estimatedTotal || 0).toLocaleString()}₫
                 </span>
                 {estimatedTotal !== finalPrice * quantity && (
                   <span className="text-xl text-slate-300 line-through font-bold tabular-nums">
                     {((product.price * quantity) + flattenedAddOns.filter(a => selectedAddOnIds.includes(a._id)).reduce((s, a) => s + (a.targetProductId?.price || 0), 0)).toLocaleString()}₫
                   </span>
                 )}
               </div>

               {product.rewardPoints > 0 && (
                <div className="flex items-center gap-4 p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-3xl mb-10 relative z-10 group">
                  <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Đặc quyền ví điểm</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                       Nhận ngay <strong className="text-emerald-600 dark:text-emerald-400 font-black">+{product.rewardPoints} pts</strong> sau khi mua
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tình trạng</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={`text-sm font-black uppercase tracking-tight ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                        </span>
                      </div>
                   </div>

                   <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-black text-slate-900 dark:text-white text-lg tabular-nums">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="lg"
                    disabled={isAdding || product.stock <= 0}
                    onClick={handleAddToCart}
                    className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-600/20 relative overflow-hidden group/btn active:scale-95 transition-all"
                  >
                    <AnimatePresence mode="wait">
                      {isAdding ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" /> Đang thêm...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <ShoppingCart className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" /> Thêm vào giỏ hàng
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 w-16 p-0 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all flex items-center justify-center group/heart"
                  >
                    <Heart className="w-6 h-6 group-hover/heart:fill-rose-500 transition-all" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">Chính hãng</h4>
                    <p className="text-[10px] font-medium text-slate-400">Hoàn tiền 200% nếu phát hiện giả</p>
                  </div>
               </div>
               <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                  <Zap className="w-6 h-6 text-orange-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">Giao hỏa tốc</h4>
                    <p className="text-[10px] font-medium text-slate-400">Nhận hàng trong 2-4 giờ</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Add-on Promotions */}
        <AddOnPromotions 
           addOns={flattenedAddOns}
           selectedIds={selectedAddOnIds}
           onToggle={toggleAddOn}
        />

        {/* Similar Products */}
        {similarProducts?.length > 0 && (
          <section className="mt-32">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Sản phẩm tương tự</h3>
                <div className="w-20 h-1 bg-blue-600 rounded-full" />
              </div>
              <Link to="/search" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Xem tất cả</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.slice(0, 4).map((p) => (
                 <ProductCardSmall key={p._id || p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ProductCardSmall({ product }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-500 group"
    >
      <Link to={`/product/${product._id || product.id}`} className="block">
        <div className="aspect-square rounded-3xl overflow-hidden mb-6 bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-700">
           <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        </div>
        <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors tracking-tight">{product.name}</h4>
        <p className="text-blue-600 dark:text-blue-400 font-black text-lg tabular-nums">{(product.effectivePrice || 0).toLocaleString()}₫</p>
      </Link>
    </motion.div>
  );
}
