import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { productApi, categoryApi } from '../utils/api';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Plus, X, Check } from 'lucide-react';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productId, setProductId] = useState(''); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categories: [], 
    stock: '',
    images: [''],
    isPromoted: false,
    promotionText: '',
  });

  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryApi.getAll(),
          productApi.getDetail(id)
        ]);
        
        setAllCategories(catRes.data);
        
        const product = prodRes.data.product;
        setProductId(product.id || product._id);
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice || '',
          categories: (product.categories || []).map(c => c.id || c._id || c),
          stock: product.stock,
          images: product.images.length > 0 ? product.images : [''],
          isPromoted: product.isPromoted || false,
          promotionText: product.promotionText || '',
        });
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => {
      const isSelected = prev.categories.includes(categoryId);
      const newCategories = isSelected
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories: newCategories };
    });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: newImages }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.categories.length === 0) {
      setError('Vui lòng chọn ít nhất một danh mục');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock),
        images: formData.images.filter(img => img.trim() !== ''),
      };

      await productApi.update(productId || id, payload);
      alert('Cập nhật sản phẩm thành công!');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium animate-pulse">Đang tải dữ liệu sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b bg-gray-50/50">
            <h2 className="text-2xl font-black text-gray-900 uppercase">Chỉnh sửa sản phẩm</h2>
            <p className="text-gray-500">Cập nhật thông tin chi tiết cho sản phẩm của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm rounded-lg font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Tên sản phẩm *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Mô tả sản phẩm *</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Giá bán (₫) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Giá giảm (nếu có)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide text-blue-600">Danh mục (Chọn nhiều) *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-gray-50 p-5 rounded-3xl border border-gray-200">
                  {allCategories.map((cat) => {
                    const isSelected = formData.categories.includes(cat.id || cat._id);
                    return (
                      <button
                        key={cat.id || cat._id}
                        type="button"
                        onClick={() => handleCategoryToggle(cat.id || cat._id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-bold ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${isSelected ? 'bg-white border-white' : 'border-gray-300'}`}>
                          {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Số lượng trong kho *</label>
                <input
                  type="number"
                  name="stock"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Hình ảnh sản phẩm (URL) *</label>
              <div className="space-y-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        required
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none shadow-sm"
                      />
                    </div>
                    {formData.images.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition border border-transparent hover:border-red-100"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                type="button"
                onClick={addImageField}
                className="flex items-center gap-2 text-sm text-blue-600 font-black hover:bg-blue-50 px-5 py-2.5 rounded-2xl transition shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Thêm hình ảnh khác
              </button>
            </div>

            <div className="bg-blue-600 p-8 rounded-3xl space-y-4 shadow-xl shadow-blue-100">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="isPromoted"
                  name="isPromoted"
                  checked={formData.isPromoted}
                  onChange={handleChange}
                  className="w-6 h-6 text-white bg-blue-500 rounded-lg focus:ring-offset-blue-600 focus:ring-white border-blue-400 cursor-pointer"
                />
                <label htmlFor="isPromoted" className="text-lg font-bold text-white cursor-pointer tracking-tight">
                  Đánh dấu là sản phẩm khuyến mãi (Banner trang chủ)
                </label>
              </div>
              {formData.isPromoted && (
                <div className="animate-in zoom-in duration-300">
                  <label className="block text-xs font-black text-blue-100 mb-2 uppercase tracking-widest">Văn bản khuyến mãi</label>
                  <input
                    type="text"
                    name="promotionText"
                    value={formData.promotionText}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-white outline-none text-white placeholder-white/50 font-medium"
                    placeholder="Ví dụ: Giảm giá 50% chỉ hôm nay"
                  />
                </div>
              )}
            </div>

            <div className="pt-8 border-t flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Save className="w-7 h-7" />
                )}
                Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="px-12 py-5 border-2 border-gray-200 rounded-3xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
