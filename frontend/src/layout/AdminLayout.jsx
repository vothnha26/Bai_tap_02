import { useEffect } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Package, LayoutDashboard, LogOut, ShoppingBag, TrendingUp, Percent, Warehouse, Trophy } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    // Bảo vệ các route admin
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const isUserAdmin = storedUser?.role === 'ADMIN' || isAdmin;
    if (!storedUser || !isUserAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Sản phẩm',
      icon: Package,
      // Active đối với dashboard hoặc add/edit product để giữ ngữ cảnh Sidebar
      isActive: (pathname) => pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/add-product') || pathname.startsWith('/admin/edit-product')
    },
    {
      path: '/admin/orders',
      label: 'Đơn hàng',
      icon: ShoppingBag,
      isActive: (pathname) => pathname.startsWith('/admin/orders')
    },
    {
      path: '/admin/statistics',
      label: 'Thống kê',
      icon: TrendingUp,
      isActive: (pathname) => pathname.startsWith('/admin/statistics')
    },
    {
      path: '/admin/categories',
      label: 'Danh mục',
      icon: LayoutDashboard,
      isActive: (pathname) => pathname.startsWith('/admin/categories')
    },
    {
      path: '/admin/promotions',
      label: 'Khuyến mãi',
      icon: Percent,
      isActive: (pathname) => pathname.startsWith('/admin/promotions')
    },
    {
      path: '/admin/inventory',
      label: 'Kho hàng',
      icon: Warehouse,
      isActive: (pathname) => pathname.startsWith('/admin/inventory')
    },
    {
      path: '/admin/rewards',
      label: 'Điểm thưởng',
      icon: Trophy,
      isActive: (pathname) => pathname.startsWith('/admin/rewards')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full shadow-xl">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-black text-blue-400 tracking-wider">ShopVN Admin</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(location.pathname);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-red-900/20 hover:text-red-400 rounded-xl transition-all duration-200 w-full text-left font-semibold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
