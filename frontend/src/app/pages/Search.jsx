import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { productApi, categoryApi } from '../utils/api';
import { Star, SlidersHorizontal, X, Search as SearchIcon, Loader2, Check } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when search params change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = {
          search: searchParams.get('q') || '',
          category: searchParams.get('category') || '',
          minPrice: searchParams.get('minPrice') || '',
          maxPrice: searchParams.get('maxPrice') || '',
          sortBy: searchParams.get('sortBy') || 'createdAt',
          order: searchParams.get('order') || 'desc',
          rating: searchParams.get('rating') || '',
          limit: 50
        };
        const res = await productApi.search(params);
        setProducts(res.data.products);
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách sản phẩm');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const handleSearch = () => {
    const params = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
    if (priceRange.min) params.minPrice = priceRange.min;
    if (priceRange.max) params.maxPrice = priceRange.max;
    if (sortBy !== 'createdAt') params.sortBy = sortBy;
    if (order !== 'desc') params.order = order;
    if (minRating) params.rating = minRating;
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSortBy('createdAt');
    setOrder('desc');
    setMinRating('');
    setSearchParams({});
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSortChange = (value) => {
    let newSort = 'createdAt';
    let newOrder = 'desc';

    switch (value) {
      case 'price-asc':
        newSort = 'price';
        newOrder = 'asc';
        break;
      case 'price-desc':
        newSort = 'price';
        newOrder = 'desc';
        break;
      case 'rating':
        newSort = 'rating';
        newOrder = 'desc';
        break;
      case 'sold':
        newSort = 'soldCount';
        newOrder = 'desc';
        break;
      case 'name':
        newSort = 'name';
        newOrder = 'asc';
        break;
    }
    setSortBy(newSort);
    setOrder(newOrder);
    
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, sortBy: newSort, order: newOrder });
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    priceRange.min ||
    priceRange.max ||
    minRating ||
    sortBy !== 'createdAt';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition bg-white"
            >
              <SlidersHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside
            className={`lg:w-64 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20 border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Bộ lọc</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Xóa
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Danh mục
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat.id || cat._id);
                      return (
                        <label 
                          key={cat.id || cat._id} 
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => toggleCategory(cat.id || cat._id)}
                          />
                          <span className={`text-sm transition-colors ${isSelected ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                            {cat.name}
                          </span>
                        </label>
                      );
                    })}
                    {categories.length === 0 && <p className="text-xs text-gray-400 italic">Đang tải danh mục...</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Khoảng giá
                  </label>
                  <div className="space-y-2">
                    {[
                      { label: 'Tất cả giá', min: '', max: '' },
                      { label: 'Dưới 1 triệu', min: '0', max: '1000000' },
                      { label: '1 - 5 triệu', min: '1000000', max: '5000000' },
                      { label: '5 - 10 triệu', min: '5000000', max: '10000000' },
                      { label: '10 - 20 triệu', min: '10000000', max: '20000000' },
                      { label: 'Trên 20 triệu', min: '20000000', max: '' },
                    ].map((range, idx) => {
                      const isSelected = priceRange.min === range.min && priceRange.max === range.max;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPriceRange({ min: range.min, max: range.max })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            isSelected 
                              ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600' 
                              : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                          }`}
                        >
                          {range.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Đánh giá
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Tất cả đánh giá</option>
                    <option value="4.5">4.5★ trở lên</option>
                    <option value="4.0">4.0★ trở lên</option>
                    <option value="3.5">3.5★ trở lên</option>
                    <option value="3.0">3.0★ trở lên</option>
                  </select>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-gray-700">
                  Tìm thấy <span className="font-bold text-blue-600">{products.length}</span> sản phẩm
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 font-medium">Sắp xếp:</label>
                  <select
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                    defaultValue={`${sortBy}-${order === 'asc' ? 'asc' : 'desc'}`}
                  >
                    <option value="createdAt-desc">Mới nhất</option>
                    <option value="price-asc">Giá từ thấp đến cao</option>
                    <option value="price-desc">Giá từ cao đến thấp</option>
                    <option value="rating-desc">Đánh giá cao nhất</option>
                    <option value="soldCount-desc">Bán chạy nhất</option>
                    <option value="name-asc">Tên A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm p-24 flex flex-col items-center gap-4 border">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="text-gray-500 font-medium animate-pulse">Đang tìm kiếm sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-red-100">
                <p className="text-red-600 mb-2 font-bold">Lỗi: {error}</p>
                <button onClick={() => window.location.reload()} className="text-blue-600 underline font-bold">Thử lại</button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-24 text-center border">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <X className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium mb-4">Không tìm thấy sản phẩm nào khớp với bộ lọc</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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
      className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full"
    >
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold shadow-sm">
            -{discount}%
          </div>
        )}
        {product.stock < 10 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
            Sắp hết
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition h-12">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-700">{product.rating || 5}</span>
          </div>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500 font-medium">Đã bán {product.soldCount || product.sold || 0}</span>
        </div>
        <div className="mt-auto flex items-center gap-2">
          <span className="text-xl font-black text-red-600">
            {product.price.toLocaleString('vi-VN')}₫
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
