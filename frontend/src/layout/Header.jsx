import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { Search, ShoppingCart, LogOut, Menu, X, Settings } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await logout();
      navigate('/login');
    }
  };

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
            <Link
              to="/search"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <Search className="w-5 h-5" />
              <span>Tìm kiếm</span>
            </Link>

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
