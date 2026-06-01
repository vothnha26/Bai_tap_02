import { Loader2, Percent, Gift, Truck, Edit2, Trash2 } from 'lucide-react';

export default function PromotionTable({ 
  promotions, 
  isLoading, 
  onEdit, 
  onDelete, 
  onToggleActive 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 font-semibold text-gray-700">Mã / Tên</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Loại</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Hiệu lực</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Lượt dùng / Giới hạn</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Trạng thái</th>
            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {isLoading ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : promotions.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">
                Chưa có chương trình khuyến mãi nào được tạo.
              </td>
            </tr>
          ) : promotions.map((promo) => (
            <tr key={promo._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <div className="font-bold text-gray-900 font-mono text-sm bg-gray-100 inline-block px-2 py-0.5 rounded border">
                  {promo.code}
                </div>
                <div className="text-gray-600 font-semibold text-sm mt-1">{promo.name}</div>
              </td>
              <td className="px-6 py-4">
                {promo.type === 'DISCOUNT' && (
                  <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                    <Percent className="w-3.5 h-3.5" /> Giảm giá
                  </span>
                )}
                {promo.type === 'GIFT' && (
                  <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                    <Gift className="w-3.5 h-3.5" /> Quà tặng
                  </span>
                )}
                {promo.type === 'SHIPPING' && (
                  <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                    <Truck className="w-3.5 h-3.5" /> Phí vận chuyển
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                <div>Bắt đầu: {new Date(promo.schedule.startDate).toLocaleDateString('vi-VN')}</div>
                <div>Kết thúc: {new Date(promo.schedule.endDate).toLocaleDateString('vi-VN')}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 font-medium font-mono">
                {promo.usedCount} / {promo.usageLimit || '∞'}
              </td>
              <td className="px-6 py-4">
                <button 
                  onClick={() => onToggleActive(promo)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${promo.isActive ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${promo.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => onEdit(promo)} 
                    className="p-2 text-gray-400 hover:text-blue-600 transition hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(promo._id)} 
                    className="p-2 text-gray-400 hover:text-red-600 transition hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
