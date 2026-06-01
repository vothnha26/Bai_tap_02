import { useState, useEffect } from 'react';
import { 
  X, Save, Loader2, Settings, Percent, Gift, Clock, Calendar, UserCheck 
} from 'lucide-react';

const getInitialState = () => ({
  code: '',
  name: '',
  type: 'DISCOUNT',
  conditions: {
    minOrderAmount: 0,
    applicableProductIds: [],
    applicableCategoryIds: [],
    matchType: 'ANY_COMBINATION',
    minQuantity: 1,
    userGroup: 'ALL'
  },
  actions: {
    applyDiscountTo: 'ORDER_TOTAL',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    maxDiscountAmount: 0,
    maxAppliedItems: 1,
    giftOptions: {
      selectableProducts: [],
      giftQuantity: 1,
      isSameAsPurchase: false
    }
  },
  schedule: {
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    timeSlots: [],
    specificDates: [],
    excludeDates: []
  },
  priority: 0,
  isStackable: false,
  usageLimit: '',
  isActive: true
});

export default function PromotionFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingPromotion,
  products = [],
  categories = []
}) {
  const [formData, setFormData] = useState(getInitialState());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State local cho các phần tử nhập động trong form
  const [newTimeSlot, setNewTimeSlot] = useState({ start: '', end: '' });
  const [newSpecificDate, setNewSpecificDate] = useState('');
  const [newExcludeDate, setNewExcludeDate] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [giftSearchQuery, setGiftSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingPromotion) {
        const startStr = editingPromotion.schedule.startDate ? new Date(editingPromotion.schedule.startDate).toISOString().split('T')[0] : '';
        const endStr = editingPromotion.schedule.endDate ? new Date(editingPromotion.schedule.endDate).toISOString().split('T')[0] : '';

        setFormData({
          code: editingPromotion.code,
          name: editingPromotion.name,
          type: editingPromotion.type,
          conditions: {
            minOrderAmount: editingPromotion.conditions?.minOrderAmount || 0,
            applicableProductIds: editingPromotion.conditions?.applicableProductIds || [],
            applicableCategoryIds: editingPromotion.conditions?.applicableCategoryIds || [],
            matchType: editingPromotion.conditions?.matchType || 'ANY_COMBINATION',
            minQuantity: editingPromotion.conditions?.minQuantity || 1,
            userGroup: editingPromotion.conditions?.userGroup || 'ALL'
          },
          actions: {
            applyDiscountTo: editingPromotion.actions?.applyDiscountTo || 'ORDER_TOTAL',
            discountType: editingPromotion.actions?.discountType || 'PERCENTAGE',
            discountValue: editingPromotion.actions?.discountValue || 0,
            maxDiscountAmount: editingPromotion.actions?.maxDiscountAmount || 0,
            maxAppliedItems: editingPromotion.actions?.maxAppliedItems || 1,
            giftOptions: {
              selectableProducts: editingPromotion.actions?.giftOptions?.selectableProducts || [],
              giftQuantity: editingPromotion.actions?.giftOptions?.giftQuantity || 1,
              isSameAsPurchase: editingPromotion.actions?.giftOptions?.isSameAsPurchase || false
            }
          },
          schedule: {
            startDate: startStr,
            endDate: endStr,
            daysOfWeek: editingPromotion.schedule?.daysOfWeek || [],
            timeSlots: editingPromotion.schedule?.timeSlots || [],
            specificDates: editingPromotion.schedule?.specificDates || [],
            excludeDates: editingPromotion.schedule?.excludeDates || []
          },
          priority: editingPromotion.priority || 0,
          isStackable: editingPromotion.isStackable || false,
          usageLimit: editingPromotion.usageLimit !== null && editingPromotion.usageLimit !== undefined ? editingPromotion.usageLimit : '',
          isActive: editingPromotion.isActive !== undefined ? editingPromotion.isActive : true
        });
      } else {
        setFormData(getInitialState());
      }
      setNewTimeSlot({ start: '', end: '' });
      setNewSpecificDate('');
      setNewExcludeDate('');
      setProductSearchQuery('');
      setGiftSearchQuery('');
    }
  }, [editingPromotion, isOpen]);

  // Lọc sản phẩm theo từ khóa tìm kiếm
  const filteredProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const filteredGiftProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(giftSearchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Xử lý và định dạng sạch dữ liệu
    const payload = JSON.parse(JSON.stringify(formData));
    payload.code = payload.code.toUpperCase().trim();
    payload.usageLimit = payload.usageLimit === '' ? null : Number(payload.usageLimit);
    
    // Khắc phục lỗi Timezone khi lưu ngày vào CSDL
    payload.schedule.startDate = new Date(`${payload.schedule.startDate}T00:00:00`);
    payload.schedule.endDate = new Date(`${payload.schedule.endDate}T23:59:59`);

    try {
      await onSubmit(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper arrays update functions
  const handleToggleDayOfWeek = (day) => {
    const current = [...formData.schedule.daysOfWeek];
    const index = current.indexOf(day);
    if (index === -1) {
      current.push(day);
    } else {
      current.splice(index, 1);
    }
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, daysOfWeek: current }
    });
  };

  const handleAddTimeSlot = () => {
    if (!newTimeSlot.start || !newTimeSlot.end) return;
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        timeSlots: [...formData.schedule.timeSlots, newTimeSlot]
      }
    });
    setNewTimeSlot({ start: '', end: '' });
  };

  const handleRemoveTimeSlot = (index) => {
    const slots = [...formData.schedule.timeSlots];
    slots.splice(index, 1);
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, timeSlots: slots }
    });
  };

  const handleAddSpecificDate = () => {
    if (!newSpecificDate) return;
    const parts = newSpecificDate.split('-');
    if (parts.length < 3) return;
    const mmDd = `${parts[1]}-${parts[2]}`;
    if (formData.schedule.specificDates.includes(mmDd)) return;
    
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        specificDates: [...formData.schedule.specificDates, mmDd]
      }
    });
    setNewSpecificDate('');
  };

  const handleAddExcludeDate = () => {
    if (!newExcludeDate) return;
    const parts = newExcludeDate.split('-');
    if (parts.length < 3) return;
    const mmDd = `${parts[1]}-${parts[2]}`;
    if (formData.schedule.excludeDates.includes(mmDd)) return;
    
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        excludeDates: [...formData.schedule.excludeDates, mmDd]
      }
    });
    setNewExcludeDate('');
  };

  const handleToggleProductSelection = (prodId, field = 'applicableProductIds') => {
    const list = field === 'applicableProductIds' 
      ? [...formData.conditions.applicableProductIds] 
      : [...formData.actions.giftOptions.selectableProducts];
    
    const index = list.indexOf(prodId);
    if (index === -1) {
      list.push(prodId);
    } else {
      list.splice(index, 1);
    }

    if (field === 'applicableProductIds') {
      setFormData({
        ...formData,
        conditions: { ...formData.conditions, applicableProductIds: list }
      });
    } else {
      setFormData({
        ...formData,
        actions: {
          ...formData.actions,
          giftOptions: { ...formData.actions.giftOptions, selectableProducts: list }
        }
      });
    }
  };

  const handleToggleCategorySelection = (catId) => {
    const list = [...formData.conditions.applicableCategoryIds];
    const index = list.indexOf(catId);
    if (index === -1) {
      list.push(catId);
    } else {
      list.splice(index, 1);
    }
    setFormData({
      ...formData,
      conditions: { ...formData.conditions, applicableCategoryIds: list }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-150">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800">
            {editingPromotion ? 'Sửa thông tin khuyến mãi' : 'Tạo chương trình khuyến mãi mới'}
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PHẦN 1: THÔNG TIN CHUNG */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-4 border">
            <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm border-b pb-2">
              <Settings className="w-4 h-4 text-blue-500" /> Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mã khuyến mãi *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono font-bold uppercase transition"
                  placeholder="VÍ DỤ: VOUCHER50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tên chương trình *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold transition"
                  placeholder="Ví dụ: Giảm giá ngày hè"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Loại hình khuyến mãi *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold transition"
                >
                  <option value="DISCOUNT">Giảm giá tiền mặt / %</option>
                  <option value="GIFT">Tặng sản phẩm quà tặng</option>
                  <option value="SHIPPING">Giảm giá phí vận chuyển</option>
                </select>
              </div>
            </div>
          </div>

          {/* PHẦN 2: THIẾT LẬP HÀNH ĐỘNG / ƯU ĐÃI */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-4 border">
            <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm border-b pb-2">
              <Percent className="w-4 h-4 text-emerald-500" /> Thiết lập giá trị ưu đãi
            </h4>
            
            {formData.type !== 'GIFT' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {formData.type === 'DISCOUNT' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Áp dụng giảm cho</label>
                    <select
                      value={formData.actions.applyDiscountTo}
                      onChange={(e) => setFormData({
                        ...formData,
                        actions: { ...formData.actions, applyDiscountTo: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2"
                    >
                      <option value="ORDER_TOTAL">Tổng giỏ hàng</option>
                      <option value="CHEAPEST_ITEM">Sản phẩm rẻ nhất</option>
                      <option value="MOST_EXPENSIVE_ITEM">Sản phẩm đắt nhất</option>
                      <option value="SPECIFIC_ITEMS">Sản phẩm chỉ định</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hình thức giảm *</label>
                  <select
                    value={formData.actions.discountType}
                    onChange={(e) => setFormData({
                      ...formData,
                      actions: { ...formData.actions, discountType: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2"
                  >
                    <option value="PERCENTAGE">Giảm theo tỷ lệ %</option>
                    <option value="FIXED_AMOUNT">Giảm số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.actions.discountValue}
                    onChange={(e) => setFormData({
                      ...formData,
                      actions: { ...formData.actions, discountValue: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 font-mono font-bold"
                  />
                </div>
                {formData.actions.discountType === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Số tiền giảm tối đa</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.actions.maxDiscountAmount}
                      onChange={(e) => setFormData({
                        ...formData,
                        actions: { ...formData.actions, maxDiscountAmount: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 font-mono font-bold"
                      placeholder="Không giới hạn"
                    />
                  </div>
                )}
                {formData.actions.applyDiscountTo === 'SPECIFIC_ITEMS' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Số lượng hàng áp dụng tối đa</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.actions.maxAppliedItems}
                      onChange={(e) => setFormData({
                        ...formData,
                        actions: { ...formData.actions, maxAppliedItems: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2"
                    />
                  </div>
                )}
              </div>
            ) : (
              // Cấu hình cho GIFT
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.actions.giftOptions.isSameAsPurchase}
                      onChange={(e) => setFormData({
                        ...formData,
                        actions: {
                          ...formData.actions,
                          giftOptions: { ...formData.actions.giftOptions, isSameAsPurchase: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Tặng chính sản phẩm đã chọn mua (Mua A Tặng A)</span>
                  </label>
                  
                  <div>
                    <label className="inline-block text-xs font-bold text-gray-700 uppercase mr-2">Số lượng quà tặng *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.actions.giftOptions.giftQuantity}
                      onChange={(e) => setFormData({
                        ...formData,
                        actions: {
                          ...formData.actions,
                          giftOptions: { ...formData.actions.giftOptions, giftQuantity: Number(e.target.value) }
                        }
                      })}
                      className="w-20 px-2 py-1 border rounded focus:ring-2 font-bold font-mono text-center"
                    />
                  </div>
                </div>

                {!formData.actions.giftOptions.isSameAsPurchase && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Chọn sản phẩm làm quà tặng (Tặng 1 sản phẩm đầu tiên được tích chọn)</label>
                    <input
                      type="text"
                      placeholder="Tìm kiếm quà tặng..."
                      value={giftSearchQuery}
                      onChange={(e) => setGiftSearchQuery(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-white grid grid-cols-2 gap-2">
                      {filteredGiftProducts.length === 0 ? (
                        <span className="text-xs text-gray-400 p-1 col-span-2">Không tìm thấy sản phẩm nào</span>
                      ) : filteredGiftProducts.map(prod => (
                        <label key={prod._id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={formData.actions.giftOptions.selectableProducts.includes(prod._id)}
                            onChange={() => handleToggleProductSelection(prod._id, 'selectableProducts')}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700 font-medium truncate">{prod.name} ({prod.price.toLocaleString('vi-VN')}đ)</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PHẦN 3: ĐIỀU KIỆN ÁP DỤNG */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-4 border">
            <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm border-b pb-2">
              <UserCheck className="w-4 h-4 text-amber-500" /> Điều kiện đơn hàng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Giá trị đơn tối thiểu (đ)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.conditions.minOrderAmount}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: { ...formData.conditions, minOrderAmount: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Số lượng tối thiểu</label>
                <input
                  type="number"
                  min="1"
                  value={formData.conditions.minQuantity}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: { ...formData.conditions, minQuantity: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kiểu khớp số lượng</label>
                <select
                  value={formData.conditions.matchType}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: { ...formData.conditions, matchType: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 font-semibold"
                >
                  <option value="ANY_COMBINATION">Tổng sản phẩm hợp lệ cộng lại</option>
                  <option value="SINGLE_PRODUCT_MIN">Có ít nhất 1 sản phẩm thỏa mãn</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nhóm khách hàng</label>
                <select
                  value={formData.conditions.userGroup}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: { ...formData.conditions, userGroup: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 font-semibold"
                >
                  <option value="ALL">Tất cả khách hàng</option>
                  <option value="NEW_USER">Khách hàng mới</option>
                  <option value="VIP">Thành viên VIP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Chọn sản phẩm được áp dụng (Để trống = Áp dụng toàn bộ)</label>
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-white grid grid-cols-1 gap-1">
                  {filteredProducts.length === 0 ? (
                    <span className="text-xs text-gray-400 p-1">Không tìm thấy sản phẩm nào</span>
                  ) : filteredProducts.map(prod => (
                    <label key={prod._id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.conditions.applicableProductIds.includes(prod._id)}
                        onChange={() => handleToggleProductSelection(prod._id, 'applicableProductIds')}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700 font-medium truncate">{prod.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Chọn danh mục được áp dụng (Để trống = Áp dụng toàn bộ)</label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-white grid grid-cols-1 gap-1">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.conditions.applicableCategoryIds.includes(cat.id)}
                        onChange={() => handleToggleCategorySelection(cat.id)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 4: LỊCH TRÌNH */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-4 border">
            <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm border-b pb-2">
              <Calendar className="w-4 h-4 text-purple-500" /> Cấu hình lịch trình hoạt động
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ngày bắt đầu *</label>
                <input
                  type="date"
                  required
                  value={formData.schedule.startDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, startDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ngày kết thúc *</label>
                <input
                  type="date"
                  required
                  value={formData.schedule.endDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, endDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 font-bold"
                />
              </div>
            </div>

            {/* Thứ trong tuần */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Các thứ áp dụng trong tuần (Để trống = Áp dụng cả tuần)</label>
              <div className="flex gap-2">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((dayName, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleDayOfWeek(idx)}
                    className={`flex-1 py-2 text-sm font-bold border rounded-lg transition ${
                      formData.schedule.daysOfWeek.includes(idx) 
                        ? 'bg-purple-600 border-purple-600 text-white shadow-sm' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {dayName}
                  </button>
                ))}
              </div>
            </div>

            {/* Khung giờ áp dụng & Ngày cụ thể / loại trừ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Thêm khung giờ hoạt động (HH:mm)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Từ (Ví dụ: 09:00)"
                    value={newTimeSlot.start}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start: e.target.value })}
                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm font-mono font-bold text-center"
                  />
                  <input
                    type="text"
                    placeholder="Đến (Ví dụ: 12:00)"
                    value={newTimeSlot.end}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end: e.target.value })}
                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm font-mono font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddTimeSlot}
                    className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-900 transition shrink-0"
                  >
                    Thêm
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto border rounded-lg p-2 bg-white">
                  {formData.schedule.timeSlots.length === 0 ? (
                    <span className="text-xs text-gray-400 font-medium">Chưa có khung giờ. Áp dụng 24/24.</span>
                  ) : formData.schedule.timeSlots.map((slot, index) => (
                    <span key={index} className="inline-flex items-center gap-1 text-xs font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-md">
                      {slot.start} - {slot.end}
                      <X className="w-3 h-3 cursor-pointer text-purple-400 hover:text-purple-600" onClick={() => handleRemoveTimeSlot(index)} />
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Chỉ định ngày (MM-DD)</label>
                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="date"
                      value={newSpecificDate}
                      onChange={(e) => setNewSpecificDate(e.target.value)}
                      className="flex-1 px-2 py-1.5 border rounded text-xs font-semibold text-center cursor-pointer"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddSpecificDate} 
                      className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded font-bold shrink-0"
                    >
                      Thêm
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto border rounded p-1.5 bg-white">
                    {formData.schedule.specificDates.map((d, index) => (
                      <span key={index} className="inline-flex items-center gap-0.5 text-[10px] font-bold font-mono bg-gray-100 border px-1.5 py-0.5 rounded">
                        {d}
                        <X 
                          className="w-2.5 h-2.5 cursor-pointer text-gray-400 hover:text-gray-600" 
                          onClick={() => {
                            const dates = [...formData.schedule.specificDates];
                            dates.splice(index, 1);
                            setFormData({ ...formData, schedule: { ...formData.schedule, specificDates: dates } });
                          }} 
                        />
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Loại trừ ngày (MM-DD)</label>
                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="date"
                      value={newExcludeDate}
                      onChange={(e) => setNewExcludeDate(e.target.value)}
                      className="flex-1 px-2 py-1.5 border rounded text-xs font-semibold text-center cursor-pointer"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddExcludeDate} 
                      className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded font-bold shrink-0"
                    >
                      Thêm
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto border rounded p-1.5 bg-white">
                    {formData.schedule.excludeDates.map((d, index) => (
                      <span key={index} className="inline-flex items-center gap-0.5 text-[10px] font-bold font-mono bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.5 rounded">
                        {d}
                        <X 
                          className="w-2.5 h-2.5 cursor-pointer text-red-400 hover:text-red-600" 
                          onClick={() => {
                            const dates = [...formData.schedule.excludeDates];
                            dates.splice(index, 1);
                            setFormData({ ...formData, schedule: { ...formData.schedule, excludeDates: dates } });
                          }} 
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 5: RÀNG BUỘC PHỤ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Giới hạn sử dụng (Lượt)</label>
              <input
                type="number"
                min="1"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 font-mono font-bold"
                placeholder="Vô hạn"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Độ ưu tiên áp dụng</label>
              <input
                type="number"
                min="0"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 font-mono font-bold"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isStackable}
                  onChange={(e) => setFormData({ ...formData, isStackable: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">Có cộng dồn với khuyến mãi khác</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 border rounded-xl hover:bg-gray-50 font-bold transition"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {editingPromotion ? 'Cập nhật khuyến mãi' : 'Lưu chương trình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
