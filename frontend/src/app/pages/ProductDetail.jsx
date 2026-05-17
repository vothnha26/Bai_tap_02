import { useParams, Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { productApi } from '../utils/api';
import { Star, Minus, Plus, ShoppingCart, Heart, Share2, Package, TrendingUp, Loader2, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function ProductDetail() {
  const { id } = useParams();
  const sliderRef = useRef(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

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
        setIsLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl inline-block max-w-md">
          <h2 className="text-2xl font-bold mb-2">Lỗi tải dữ liệu</h2>
          <p className="mb-6">{error || 'Không tìm thấy sản phẩm'}</p>
          <Link to="/" className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const { product, similarProducts } = data;
  const categories = product.categories || [];

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

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const finalPrice = product.discountPrice || product.price;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
          <Link to="/" className="hover:text-blue-600 transition">Trang chủ</Link>
          <span className="text-gray-400">/</span>
          <Link to="/search" className="hover:text-blue-600 transition">Sản phẩm</Link>
          {categories.length > 0 && (
            <>
              <span className="text-gray-400">/</span>
              <div className="flex gap-1">
                {categories.map((cat, idx) => (
                  <span key={cat.id || cat._id}>
                    <Link to={`/search?category=${cat.id || cat._id}`} className="hover:text-blue-600 transition">
                      {cat.name}
                    </Link>
                    {idx < categories.length - 1 && <span className="mx-1">,</span>}
                  </span>
                ))}
              </div>
            </>
          )}
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Images */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
              <Slider ref={sliderRef} {...sliderSettings}>
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <div key={index} className="aspect-square">
                      <ImageWithFallback
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                  ))
                ) : (
                  <div className="aspect-square bg-gray-50 flex items-center justify-center rounded-2xl">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </Slider>
              {discount > 0 && (
                <div className="absolute top-8 left-8 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-black shadow-lg z-10">
                  -{discount}%
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-sm ${
                      selectedImage === index ? 'border-blue-600 ring-2 ring-blue-100 scale-105' : 'border-white hover:border-gray-300'
                    }`}
                  >
                    <ImageWithFallback src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex-1">
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id || cat._id}
                      to={`/search?category=${cat.id || cat._id}`}
                      className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition uppercase tracking-wider"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>

                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating || 5)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-700">{product.rating || 5}</span>
                    <span className="text-gray-400 text-sm">({product.reviews || 0} đánh giá)</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <TrendingUp className="w-5 h-5" />
                    <span>Đã bán {product.soldCount || 0}</span>
                  </div>
                </div>

                <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl mb-8">
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <span className="text-5xl font-black text-red-600">
                      {finalPrice.toLocaleString('vi-VN')}₫
                    </span>
                    {product.discountPrice && (
                      <span className="text-2xl text-gray-400 line-through font-medium">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <span className="text-gray-500 font-medium text-lg">Tình trạng kho</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`font-bold text-lg ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium text-lg">Số lượng</span>
                    <div className="flex items-center bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          if (val >= 1 && val <= product.stock) {
                            setQuantity(val);
                          }
                        }}
                        className="w-16 text-center bg-transparent font-bold text-xl focus:outline-none"
                        min="1"
                        max={product.stock}
                      />
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-2.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mb-8">
                  <button className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95 flex items-center justify-center gap-3">
                    <ShoppingCart className="w-6 h-6" />
                    Thêm vào giỏ hàng
                  </button>
                  <button className="p-4 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-90">
                    <Heart className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="border-t pt-8">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-gray-400" />
                    Mô tả sản phẩm
                  </h3>
                  <div className="text-gray-600 leading-relaxed space-y-4 text-lg">
                    {product.description.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts && similarProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900 italic">Sản phẩm tương tự</h2>
              <div className="h-1 flex-1 bg-gray-100 mx-6 rounded-full hidden sm:block"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((p) => (
                <Link
                  key={p.id || p._id}
                  to={`/product/${p.slug || p.id || p._id}`}
                  className="bg-white rounded-3xl shadow-sm border border-gray-50 hover:shadow-xl transition-all duration-500 overflow-hidden group flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <ImageWithFallback
                      src={p.images?.[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {p.discountPrice && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                        -{Math.round(((p.price - p.discountPrice) / p.price) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition min-h-[3rem]">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-700">{p.rating || 5}</span>
                      <span className="text-gray-400 text-xs">|</span>
                      <span className="text-gray-500 text-xs font-medium">Đã bán {p.soldCount || 0}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xl font-black text-red-600">
                        {(p.discountPrice || p.price).toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
