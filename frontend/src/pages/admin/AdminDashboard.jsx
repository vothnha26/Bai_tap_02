import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { productApi } from '../../services/product.service';
import { Package, Plus, LayoutDashboard, LogOut, Star, Trash2, Edit2, Loader2, TrendingUp, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const LIMIT = 10;

  const fetchProducts = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const response = await productApi.search({ 
        page: pageNum, 
        limit: LIMIT 
      });
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
      setTotalProducts(response.data.pagination.totalProducts);
      setPage(response.data.pagination.currentPage);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    fetchProducts(page);
  }, [navigate, page, isAdmin]);

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này? Thao tác này không thể hoàn tác.')) {
      setIsActionLoading(true);
      try {
        await productApi.delete(id);
        alert('Đã xóa sản phẩm thành công!');
        fetchProducts(page);
      } catch (error) {
        alert('Lỗi: ' + error.message);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
            page === i 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
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
            className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg w-full text-left"
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
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left"
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h2>
            <p className="text-gray-500">Danh sách các sản phẩm đang kinh doanh</p>
          </div>
          <button 
            onClick={() => navigate('/admin/add-product')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Thêm sản phẩm
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden relative">
          {isActionLoading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          )}
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Sản phẩm</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Danh mục</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Giá</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Kho</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span>Đang tải danh sách sản phẩm...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0">
                          <ImageWithFallback 
                            src={product.images?.[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating || 5}</span>
                            <span>({product.reviews || 0})</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.categories && product.categories.length > 0 ? (
                          product.categories.map((cat, idx) => (
                            <span key={cat.id || cat._id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                              {cat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {product.price.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.isActive ? (
                        <span className="flex items-center gap-1.5 text-green-600 text-sm">
                          <span className="w-2 h-2 bg-green-600 rounded-full" />
                          Đang bán
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                          <span className="w-2 h-2 bg-gray-400 rounded-full" />
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/edit-product/${product.slug || product.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition hover:bg-blue-50 rounded-lg"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition hover:bg-red-50 rounded-lg"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">
                Hiển thị trang <span className="text-blue-600">{page}</span> trên tổng số <span className="text-blue-600">{totalPages}</span> trang
                ({totalProducts} sản phẩm)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white border rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Trước
                </button>
                <div className="flex items-center gap-1">
                  {renderPagination()}
                </div>
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-white border rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
