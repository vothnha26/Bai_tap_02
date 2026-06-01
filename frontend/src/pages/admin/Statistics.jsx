import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { statisticsApi } from '../../services/statistics.service';
import { 
  Package, 
  LayoutDashboard, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Eye, 
  ArrowUpRight,
  Loader2,
  ChevronRight,
  Mail,
  Activity
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useAuth } from '../../context/AuthContext';

export default function Statistics() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await statisticsApi.getAdminStats();
        setStatsData(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (error.message.includes('expired')) {
          alert('Phiên làm việc hết hạn, vui lòng đăng nhập lại');
          await logout();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [navigate, isAdmin]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">ShopVN Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left"
          >
            <Package className="w-5 h-5" />
            <span>Sản phẩm</span>
          </button>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Đơn hàng</span>
          </button>
          <button 
            onClick={() => navigate('/admin/statistics')}
            className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg w-full text-left"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Thống kê</span>
          </button>
          <button 
            onClick={() => navigate('/admin/categories')}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Danh mục</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Thống kê kinh doanh</h2>
            <p className="text-gray-500 font-medium">Phân tích hiệu suất bán hàng và sản phẩm theo thời gian thực</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border text-sm font-bold text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Dữ liệu trực tiếp
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">Đang tổng hợp dữ liệu từ hệ thống...</p>
          </div>
        ) : statsData ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-blue-600 p-3 rounded-2xl w-fit mb-6 shadow-lg shadow-blue-200">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Tổng doanh thu</p>
                  <h3 className="text-3xl font-black text-gray-900">
                    {(statsData.summary?.totalRevenue || 0).toLocaleString('vi-VN')}₫
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-sm">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>+12.5% so với tháng trước</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-orange-500 p-3 rounded-2xl w-fit mb-6 shadow-lg shadow-orange-200">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Đã bán được</p>
                  <h3 className="text-3xl font-black text-gray-900">
                    {(statsData.summary?.totalSoldCount || 0).toLocaleString()} <span className="text-lg font-medium text-gray-400 italic">sản phẩm</span>
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-gray-400 font-bold text-sm">
                    <span>Đang tăng trưởng ổn định</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-purple-600 p-3 rounded-2xl w-fit mb-6 shadow-lg shadow-purple-200">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Kho hàng hiện có</p>
                  <h3 className="text-3xl font-black text-gray-900">
                    {statsData.summary?.totalProducts || 0} <span className="text-lg font-medium text-gray-400 italic">loại mặt hàng</span>
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-sm cursor-pointer hover:underline" onClick={() => navigate('/admin/dashboard')}>
                    <span>Quản lý kho hàng ngay</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* System Health Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-green-600 p-3 rounded-2xl w-fit mb-6 shadow-lg shadow-green-200">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Trạng thái hệ thống</p>
                  <h3 className="text-2xl font-black text-gray-900">Ổn định</h3>
                  <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-sm">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span>Tất cả các dịch vụ đang hoạt động</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-blue-600 p-3 rounded-2xl w-fit mb-6 shadow-lg shadow-blue-200">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Hàng đợi Email (Redis)</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-gray-900">
                      {statsData.summary?.emailQueueLen || 0}
                    </h3>
                    <span className="text-lg font-medium text-gray-400 italic">jobs đang chờ</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-gray-400 font-bold text-sm">
                    <span>Xử lý bởi: Background Worker</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Selling Products Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-gray-900 text-2xl flex items-center gap-3">
                    <div className="bg-blue-600 w-2 h-8 rounded-full"></div>
                    Bảng Xếp Hạng Doanh Số
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 font-medium">10 sản phẩm mang lại lợi nhuận cao nhất cho cửa hàng</p>
                </div>
              </div>
              <div className="overflow-x-auto px-4 pb-4">
                <table className="w-full text-left">
                  <thead className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-6 py-6">Xếp hạng</th>
                      <th className="px-6 py-6">Thông tin sản phẩm</th>
                      <th className="px-6 py-6">Đơn giá</th>
                      <th className="px-6 py-6 text-center">Số lượng bán</th>
                      <th className="px-6 py-6">Tổng doanh thu</th>
                      <th className="px-6 py-6">Quan tâm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {statsData.topProducts?.map((product, index) => (
                      <tr key={product._id} className="group hover:bg-gray-50/80 transition-all duration-300">
                        <td className="px-6 py-6">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${
                            index === 0 ? 'bg-yellow-400 text-white shadow-yellow-200' : 
                            index === 1 ? 'bg-gray-300 text-white shadow-gray-200' : 
                            index === 2 ? 'bg-orange-300 text-white shadow-orange-200' : 
                            'bg-gray-50 text-gray-400 border'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:scale-110 transition-transform duration-500">
                              <ImageWithFallback src={product.images?.[0]} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</span>
                              <div className="flex gap-2 mt-1">
                                {product.discountPrice && (
                                  <span className="bg-red-50 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Đang giảm giá</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-bold text-gray-600">
                          {(product.discountPrice || product.price).toLocaleString('vi-VN')}₫
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-2xl text-xs font-black min-w-[60px]">
                            {product.soldCount}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-lg font-black text-blue-600">
                          {(product.revenue || 0).toLocaleString('vi-VN')}₫
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                            <Eye className="w-4 h-4" />
                            {product.viewCount?.toLocaleString()} lượt xem
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center">
             <div className="bg-gray-50 p-6 rounded-full mb-6">
                <TrendingUp className="w-12 h-12 text-gray-300" />
             </div>
             <p className="text-gray-400 font-bold text-xl">Chưa có dữ liệu thống kê để hiển thị</p>
             <button onClick={() => window.location.reload()} className="mt-6 text-blue-600 font-black hover:underline">Tải lại trang</button>
          </div>
        )}
      </main>
    </div>
  );
}
