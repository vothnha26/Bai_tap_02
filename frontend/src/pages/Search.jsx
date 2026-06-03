import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { productApi } from '../services/product.service';
import { categoryApi } from '../services/category.service';
import { Star, SlidersHorizontal, X, Search as SearchIcon, Loader2, ChevronDown, Package, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import ProductsSkeleton from './Search/components/ProductsSkeleton';
import ProductCard from './Search/components/ProductCard';
import FilterSidebar from './Search/components/FilterSidebar';
import CategoryFilterPopover from './Search/components/CategoryFilterPopover';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  
  const MAX_PRICE = 200000000;
  const [priceValues, setPriceValues] = useState([
    parseInt(searchParams.get('minPrice')) || 0,
    parseInt(searchParams.get('maxPrice')) || MAX_PRICE
  ]);

  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFilters]);

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

  useEffect(() => {
    const fetchInitialProducts = async () => {
      setIsLoading(true);
      setError('');
      setPage(1);
      try {
        const params = {
          search: searchParams.get('q') || '',
          category: searchParams.get('category') || '',
          minPrice: searchParams.get('minPrice') || '',
          maxPrice: searchParams.get('maxPrice') || '',
          sortBy: searchParams.get('sortBy') || 'createdAt',
          order: searchParams.get('order') || 'desc',
          rating: searchParams.get('rating') || '',
          page: 1,
          limit: 12
        };
        const res = await productApi.search(params);
        setProducts(res.data.products);
        setTotalPages(res.data.pagination.totalPages);
        setTotalProducts(res.data.pagination.totalProducts);
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách sản phẩm');
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    fetchInitialProducts();
  }, [searchParams]);

  useEffect(() => {
    if (page === 1) return;

    const fetchMoreProducts = async () => {
      setIsFetchingMore(true);
      try {
        const params = {
          search: searchParams.get('q') || '',
          category: searchParams.get('category') || '',
          minPrice: searchParams.get('minPrice') || '',
          maxPrice: searchParams.get('maxPrice') || '',
          sortBy: searchParams.get('sortBy') || 'createdAt',
          order: searchParams.get('order') || 'desc',
          rating: searchParams.get('rating') || '',
          page: page,
          limit: 12
        };
        const res = await productApi.search(params);
        
        // Ngăn chặn trùng lặp bằng cách lọc các sản phẩm đã có trong danh sách
        setProducts(prev => {
          const incomingProducts = res.data.products || [];
          const uniqueNewProducts = incomingProducts.filter(
            newP => !prev.some(oldP => (oldP._id || oldP.id) === (newP._id || newP.id))
          );
          return [...prev, ...uniqueNewProducts];
        });
      } catch (err) {
        console.error('Failed to fetch more products:', err);
      } finally {
        setIsFetchingMore(false);
      }
    };
    fetchMoreProducts();
  }, [page]); // Chỉ trigger khi số trang thay đổi, không trigger khi searchParams thay đổi trực tiếp ở đây

  useEffect(() => {
    if (page >= totalPages || isLoading || isFetchingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const target = document.querySelector('#load-more-trigger');
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [totalPages, page, isLoading, isFetchingMore]);

  const handleSearch = () => {
    const params = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
    if (priceValues[0] > 0) params.minPrice = priceValues[0];
    if (priceValues[1] < MAX_PRICE) params.maxPrice = priceValues[1];
    if (sortBy !== 'createdAt') params.sortBy = sortBy;
    if (order !== 'desc') params.order = order;
    if (minRating) params.rating = minRating;
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceValues([0, MAX_PRICE]);
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
    const [newSort, newOrder] = value.split('-');
    setSortBy(newSort);
    setOrder(newOrder);
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, sortBy: newSort, order: newOrder });
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1) + 'tr';
    }
    return (value || 0).toLocaleString('vi-VN') + '₫';
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    priceValues[0] > 0 ||
    priceValues[1] < MAX_PRICE ||
    minRating ||
    sortBy !== 'createdAt';

  const activeFilterCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (priceValues[0] > 0 || priceValues[1] < MAX_PRICE ? 1 : 0) +
    (minRating ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FDFDFF] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-blue-600/5 rounded-[1.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Bạn đang tìm kiếm sản phẩm nào?"
                className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-bold shadow-[0_10px_30px_-10px_rgba(0,0,0,0.02)] relative z-10"
              />
            </div>
            <div className="flex gap-3">
              {/* Category popover — hiện trên mọi breakpoint */}
              <CategoryFilterPopover
                categories={categories}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                onApply={handleSearch}
              />
              <Button
                onClick={handleSearch}
                size="lg"
                className="bg-slate-900 dark:bg-blue-600 text-white px-8 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-900/10 active:scale-95"
              >
                Tìm kiếm
              </Button>
              {/* Mobile: nút mở sidebar (giá + đánh giá) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden relative flex items-center gap-2 px-5 h-[58px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-slate-700 dark:text-slate-200 hover:border-slate-300 transition-all shadow-[0_10px_30px_-10px_rgba(0,0,0,0.02)]"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <AnimatePresence>
                  {activeFilterCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900 dark:bg-blue-500 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                    >
                      {activeFilterCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0 self-start sticky top-[7.5rem]">
            <FilterSidebar
              priceValues={priceValues}
              setPriceValues={setPriceValues}
              MAX_PRICE={MAX_PRICE}
              minRating={minRating}
              setMinRating={setMinRating}
              handleSearch={handleSearch}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              formatCurrency={formatCurrency}
            />
          </aside>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowFilters(false)}
                  className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
                />

                {/* Drawer Panel - slides from left */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                  className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-[#FDFDFF] dark:bg-slate-900 shadow-2xl shadow-slate-900/20 flex flex-col z-10"
                >
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <SlidersHorizontal className="w-4 h-4 text-slate-900 dark:text-white" />
                      <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Bộ lọc</h2>
                      {activeFilterCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-900 dark:bg-blue-500 text-white text-[9px] font-black rounded-full">
                          {activeFilterCount}
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </motion.button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    <FilterSidebar
                      priceValues={priceValues}
                      setPriceValues={setPriceValues}
                      MAX_PRICE={MAX_PRICE}
                      minRating={minRating}
                      setMinRating={setMinRating}
                      handleSearch={handleSearch}
                      clearFilters={clearFilters}
                      hasActiveFilters={hasActiveFilters}
                      formatCurrency={formatCurrency}
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Control Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 mb-10 border border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kết quả tìm kiếm</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    Tìm thấy <span className="text-blue-600 underline decoration-blue-600/30 decoration-4 underline-offset-4">{totalProducts}</span> sản phẩm
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sắp xếp:</span>
                <div className="relative">
                  <select
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 outline-none cursor-pointer"
                    defaultValue={`${sortBy}-${order}`}
                  >
                    <option value="createdAt-desc">Mới nhất</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                    <option value="rating-desc">Đánh giá cao nhất</option>
                    <option value="soldCount-desc">Bán chạy nhất</option>
                    <option value="name-asc">Tên: A - Z</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <ProductsSkeleton />
            ) : error ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="bg-white p-20 rounded-[3rem] text-center border border-rose-100 shadow-2xl"
              >
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <XCircle className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Lỗi tải sản phẩm</h3>
                <p className="text-slate-500 font-medium mb-10">{error}</p>
                <Button onClick={() => window.location.reload()} className="px-12 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                  Thử lại
                </Button>
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 p-24 rounded-[3rem] text-center border border-slate-100 dark:border-slate-800 shadow-xl"
              >
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                  <SearchIcon className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-400 mb-12 max-w-sm mx-auto font-medium">Chúng tôi không tìm thấy sản phẩm nào khớp với bộ lọc của bạn. Hãy thử thay đổi tiêu chí tìm kiếm!</p>
                <Button onClick={clearFilters} className="px-12 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                  Xóa tất cả bộ lọc
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((product) => (
                      <ProductCard key={product._id || product.id} product={product} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Infinite Scroll Trigger */}
                {page < totalPages && (
                  <div id="load-more-trigger" className="h-40 flex items-center justify-center mt-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Đang tải thêm...</p>
                    </div>
                  </div>
                )}
                
                {page >= totalPages && products.length > 0 && (
                  <div className="text-center py-24 border-t border-slate-50 mt-12">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Bạn đã xem hết danh sách sản phẩm</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
