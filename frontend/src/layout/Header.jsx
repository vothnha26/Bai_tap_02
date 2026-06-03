import { Link, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, LogOut, Menu, X, Settings } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../services/product.service';

export default function Header() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const handleLogout = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  // Fetch suggestions
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await productApi.search({ search: searchQuery.trim(), limit: 5 });
          if (res.data?.products) {
            setSuggestions(res.data.products);
          }
        } catch (err) {
          console.error('Error fetching suggestions:', err);
        }
      }, 300);
    } else {
      setSuggestions([]);
    }
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ShopVN
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Trang chủ
              </Link>
              <Link to="/search" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Sản phẩm
              </Link>
              {user && (
                <Link to="/profile?tab=orders" className="text-gray-700 hover:text-blue-600 transition font-medium">
                  Đơn hàng
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition font-bold"
                >
                  <Settings className="w-4 h-4" />
                  Quản trị
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Search */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button type="submit" className="hidden">Search</button>
              </form>

              {/* Desktop Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                  {suggestions.map(product => (
                    <Link
                      key={product._id || product.id}
                      to={`/product/${product._id || product.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs font-bold text-blue-600">{(product.effectivePrice || product.price || 0).toLocaleString()}₫</p>
                      </div>
                    </Link>
                  ))}
                  <Link 
                    to={`/search?keyword=${encodeURIComponent(searchQuery.trim())}`}
                    className="block w-full p-3 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-wider bg-gray-50"
                    onClick={() => setShowSuggestions(false)}
                  >
                    Xem tất cả kết quả
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-3 pl-4 border-l ml-2">
                <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full overflow-hidden border bg-gray-100 flex-shrink-0">
                    <ImageWithFallback
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.name)}&background=random`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900 leading-none">{user.fullName || user.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{user.role}</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 pl-4 border-l ml-2">
                <Link 
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white animate-in slide-in-from-top duration-200">
          <div className="px-4 py-3 space-y-3">
            {user && (
              <Link to="/profile" className="flex items-center gap-3 pb-3 border-b" onClick={() => setIsMenuOpen(false)}>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{user.fullName || user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>      
                </div>
              </Link>
            )}

            {/* Mobile Search */}
            <div className="relative pt-2 pb-2" ref={mobileSearchRef}>
              <form 
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setIsMenuOpen(false);
                }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-[18px] pointer-events-none" />
                <button type="submit" className="hidden">Search</button>
              </form>
              
              {/* Mobile Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                  {suggestions.map(product => (
                    <Link
                      key={product._id || product.id}
                      to={`/product/${product._id || product.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      onClick={() => {
                        setShowSuggestions(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs font-bold text-blue-600">{(product.effectivePrice || product.price || 0).toLocaleString()}₫</p>
                      </div>
                    </Link>
                  ))}
                  <Link 
                    to={`/search?keyword=${encodeURIComponent(searchQuery.trim())}`}
                    className="block w-full p-3 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-wider bg-gray-50"
                    onClick={() => {
                      setShowSuggestions(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    Xem tất cả kết quả
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/search"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Sản phẩm
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className="block px-3 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Bảng quản trị
              </Link>
            )}

            {!user ? (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  className="flex justify-center py-2 border rounded-lg text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="flex justify-center py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
