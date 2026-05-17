import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { productApi } from '../utils/api';
import { Star, TrendingUp, Zap, Package, Loader2 } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState({
    promotionProducts: [],
    newProducts: [],
    bestSellers: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await productApi.getHomePage();
        setData({
          promotionProducts: response.data.promotionProducts || [],
          newProducts: response.data.newProducts || [],
          bestSellers: response.data.bestSellers || [],
        });
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
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Chào mừng đến với ShopVN
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất
            </p>
            <Link
              to="/search"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Miễn phí vận chuyển</h3>
              <p className="text-gray-600 text-sm">Cho đơn hàng từ 500.000đ</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Giao hàng nhanh</h3>
              <p className="text-gray-600 text-sm">Trong vòng 2-3 ngày</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Đổi trả dễ dàng</h3>
              <p className="text-gray-600 text-sm">Trong vòng 30 ngày</p>
            </div>
          </div>
        </div>

        {data.promotionProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">🔥 Khuyến mãi hot</h2>
              <Link to="/search?tags=khuyến mãi" className="text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.promotionProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {data.newProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">✨ Sản phẩm mới</h2>
              <Link to="/search?tags=mới" className="text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.newProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {data.bestSellers.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">🏆 Bán chạy nhất</h2>
              <Link to="/search?tags=bán chạy" className="text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.bestSellers.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

function ProductCard({ product }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product.slug || product.id || product._id}`}
      className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group h-full flex flex-col"
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
            -{discount}%
          </div>
        )}
        {product.stock < 10 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
            Sắp hết
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating || 5}</span>
          </div>
          <span className="text-sm text-gray-500">({product.reviews || 0})</span>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500">Đã bán {product.sold || 0}</span>
        </div>
        <div className="mt-auto flex items-center gap-2">
          <span className="text-xl font-bold text-red-600">
            {product.price?.toLocaleString('vi-VN')}₫
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {product.originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
