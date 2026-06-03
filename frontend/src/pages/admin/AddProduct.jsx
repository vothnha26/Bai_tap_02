import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { productApi } from '../../services/product.service';
import { categoryApi } from '../../services/category.service';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Plus, X, Check } from 'lucide-react';

export default function AddProduct() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categories: [], // Mảng các ObjectId
    stock: '',
    images: [''],
    isPromoted: false,
    promotionText: '',
  });

  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountData, setDiscountData] = useState({
    discountType: 'PERCENTAGE',
    discountValue: '',
    startDate: '',
    endDate: '',
    isStackable: false,
  });

  const [salePrice, setSalePrice] = useState('');

  // Đồng bộ từ Mức giảm sang Giá sau giảm dự kiến
  useEffect(() => {
    const price = Number(formData.price);
    const val = Number(discountData.discountValue);
    if (!price || isNaN(price)) {
      setSalePrice('');
      return;
    }
    if (!discountData.discountValue && discountData.discountValue !== 0) {
      setSalePrice('');
      return;
    }

    let calculated = price;
    if (discountData.discountType === 'PERCENTAGE') {
      calculated = price - (price * val) / 100;
    } else if (discountData.discountType === 'FIXED_AMOUNT') {
      calculated = price - val;
    }
    setSalePrice(Math.max(0, Math.round(calculated)));
  }, [formData.price, discountData.discountType, discountData.discountValue]);

  const handleSalePriceChange = (e) => {
    const value = e.target.value;
    setSalePrice(value);
    
    const price = Number(formData.price);
    if (!price || isNaN(price) || value === '') {
      setDiscountData(prev => ({ ...prev, discountValue: '' }));
      return;
    }

    const saleVal = Number(value);
    let calculatedVal = '';
    if (discountData.discountType === 'PERCENTAGE') {
      calculatedVal = Math.round(((price - saleVal) / price) * 100);
      calculatedVal = Math.max(0, Math.min(100, calculatedVal));
    } else if (discountData.discountType === 'FIXED_AMOUNT') {
      calculatedVal = price - saleVal;
      calculatedVal = Math.max(0, calculatedVal);
    }

    setDiscountData(prev => ({
      ...prev,
      discountValue: calculatedVal.toString()
    }));
  };

  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setAllCategories(response.data);
      } catch (err) {
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDiscountChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDiscountData((prev) => ({
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

    if (hasDiscount) {
      if (!discountData.discountValue || !discountData.startDate || !discountData.endDate) {
        setError('Vui lòng điền đầy đủ thông tin giảm giá (mức giảm, ngày bắt đầu, ngày kết thúc)');
        return;
      }
      if (new Date(discountData.startDate) >= new Date(discountData.endDate)) {
        setError('Ngày bắt đầu giảm giá phải nhỏ hơn ngày kết thúc');
        return;
      }
    }
    
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: formData.images.filter(img => img.trim() !== ''),
      };

      const response = await productApi.create(payload);
      
      if (hasDiscount) {
        const createdProduct = response.data.data || response.data;
        const productId = createdProduct.id || createdProduct._id;
        
        await productApi.upsertDiscount(productId, {
          ...discountData,
          discountValue: Number(discountData.discountValue),
        });
      }

      alert('Thêm sản phẩm thành công!');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Không thể thêm sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-8 border-b bg-gray-50/50">
            <h2 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h2>
            <p className="text-gray-500">Điền thông tin chi tiết cho sản phẩm của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm rounded-lg font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Tên sản phẩm *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="Ví dụ: Sony WH-1000XM5"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="0"
                />
              </div>

              <div className="col-span-2 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasDiscount"
                    checked={hasDiscount}
                    onChange={(e) => setHasDiscount(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="hasDiscount" className="text-sm font-bold text-gray-900 cursor-pointer uppercase tracking-wide">
                    Thiết lập giảm giá trực tiếp (Sale Price) cho sản phẩm này
                  </label>
                </div>

                {hasDiscount && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-blue-100 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Loại giảm giá</label>
                      <select
                        name="discountType"
                        value={discountData.discountType}
                        onChange={handleDiscountChange}
                        className="w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="PERCENTAGE">Theo Phần trăm (%)</option>
                        <option value="FIXED_AMOUNT">Số tiền cố định (₫)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Mức giảm</label>
                      <input
                        type="number"
                        name="discountValue"
                        required
                        value={discountData.discountValue}
                        onChange={handleDiscountChange}
                        placeholder={discountData.discountType === 'PERCENTAGE' ? 'Ví dụ: 10 (%)' : 'Ví dụ: 20000 (₫)'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide text-blue-600">Giá sau giảm mong muốn (₫)</label>
                      <input
                        type="number"
                        name="salePrice"
                        value={salePrice}
                        onChange={handleSalePriceChange}
                        placeholder="Ví dụ: 80000"
                        className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-blue-50/30 font-semibold"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">Tự động tính mức giảm tương ứng</span>
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isStackable"
                          checked={discountData.isStackable}
                          onChange={handleDiscountChange}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        Cho phép cộng dồn với Voucher
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Ngày bắt đầu giảm</label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        required={hasDiscount}
                        value={discountData.startDate}
                        onChange={handleDiscountChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Ngày kết thúc giảm</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        required={hasDiscount}
                        value={discountData.endDate}
                        onChange={handleDiscountChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide text-blue-600">Danh mục (Chọn nhiều) *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  {allCategories.map((cat) => {
                    const isSelected = formData.categories.includes(cat.id || cat._id);
                    return (
                      <button
                        key={cat.id || cat._id}
                        type="button"
                        onClick={() => handleCategoryToggle(cat.id || cat._id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-sm font-medium ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
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
                  {allCategories.length === 0 && <p className="col-span-full text-center py-4 text-gray-400 italic text-sm">Chưa có danh mục nào. Hãy tạo danh mục trước!</p>}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Hình ảnh sản phẩm (URL) *</label>
              <div className="space-y-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        required
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    {formData.images.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                type="button"
                onClick={addImageField}
                className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                Thêm hình ảnh khác
              </button>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl space-y-4 border border-blue-100 shadow-inner">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPromoted"
                  name="isPromoted"
                  checked={formData.isPromoted}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-gray-300 cursor-pointer"
                />
                <label htmlFor="isPromoted" className="text-sm font-bold text-gray-900 cursor-pointer">
                  Đánh dấu là sản phẩm khuyến mãi (Banner trang chủ)
                </label>
              </div>
              {formData.isPromoted && (
                <div className="animate-in slide-in-from-left duration-300">
                  <label className="block text-xs font-bold text-blue-600 mb-2 uppercase tracking-widest">Văn bản khuyến mãi</label>
                  <input
                    type="text"
                    name="promotionText"
                    value={formData.promotionText}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    placeholder="Ví dụ: Giảm giá 50% chỉ hôm nay"
                  />
                </div>
              )}
            </div>

            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Save className="w-6 h-6" />
                )}
                Lưu sản phẩm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
