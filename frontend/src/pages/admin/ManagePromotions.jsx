import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { promotionApi } from '../../services/promotion.service';
import { productApi } from '../../services/product.service';
import { categoryApi } from '../../services/category.service';
import { 
  Plus, LayoutDashboard, LogOut, Package, TrendingUp, Percent, ShoppingBag 
} from 'lucide-react';

import PromotionTable from './promotions/components/PromotionTable';
import PromotionFormModal from './promotions/components/PromotionFormModal';

export default function ManagePromotions() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [promosRes, prodsRes, catsRes] = await Promise.all([
        promotionApi.getAllAdmin(),
        productApi.getAll(),
        categoryApi.getAll()
      ]);
      setPromotions(promosRes.data);
      if (prodsRes && prodsRes.data && prodsRes.data.products) {
        setProducts(prodsRes.data.products);
      }
      setCategories(catsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (promo) => {
    try {
      await promotionApi.updateAdmin(promo._id, { isActive: !promo.isActive });
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này?')) {
      try {
        await promotionApi.deleteAdmin(id);
        fetchData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleEdit = (promo) => {
    setEditingPromotion(promo);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingPromotion(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setIsLoading(true);
    try {
      if (editingPromotion) {
        await promotionApi.updateAdmin(editingPromotion._id, payload);
      } else {
        await promotionApi.createAdmin(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400 tracking-wide">ShopVN Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left font-medium">
            <Package className="w-5 h-5" />
            <span>Sản phẩm</span>
          </button>
          <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left font-medium">
            <ShoppingBag className="w-5 h-5" />
            <span>Đơn hàng</span>
          </button>
          <button onClick={() => navigate('/admin/statistics')} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left font-medium">
            <TrendingUp className="w-5 h-5" />
            <span>Thống kê</span>
          </button>
          <button onClick={() => navigate('/admin/categories')} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left font-medium">
            <LayoutDashboard className="w-5 h-5" />
            <span>Danh mục</span>
          </button>
          <button onClick={() => navigate('/admin/promotions')} className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg text-white w-full text-left font-medium shadow-md">
            <Percent className="w-5 h-5" />
            <span>Khuyến mãi</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition w-full text-left font-medium">
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Quản lý khuyến mãi</h2>
            <p className="text-gray-500 mt-1">Cấu hình các chương trình ưu đãi, giảm giá và quà tặng khách hàng</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Tạo khuyến mãi mới
          </button>
        </div>

        {/* Promotions List Table Component */}
        <PromotionTable 
          promotions={promotions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </main>

      {/* Dialog Form Modal Component */}
      <PromotionFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingPromotion={editingPromotion}
        products={products}
        categories={categories}
      />
    </div>
  );
}
