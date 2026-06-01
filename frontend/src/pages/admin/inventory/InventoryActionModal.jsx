import React from 'react';
import { X, Sliders, CheckCircle, Loader2, Save, FileText } from 'lucide-react';

export default function InventoryActionModal({
  isOpen,
  onClose,
  selectedInventory,
  activeTab,
  setActiveTab,
  updateForm,
  setUpdateForm,
  stockTakeForm,
  setStockTakeForm,
  onUpdateSubmit,
  onStockTakeSubmit,
  isActionLoading,
  existingLocations = []
}) {
  if (!isOpen || !selectedInventory) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 border border-white/20 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Cập nhật kho hàng</h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{selectedInventory.productId?.name}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/30">
          <button
            type="button"
            onClick={() => setActiveTab('update')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition ${
              activeTab === 'update' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Thông số kho
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stocktake')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition ${
              activeTab === 'stocktake' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Kiểm kê kho
          </button>
        </div>

        {/* Tab 1: Update Parameters */}
        {activeTab === 'update' && (
          <form onSubmit={onUpdateSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Ngưỡng báo tồn kho thấp</label>
              <input
                type="number"
                min="0"
                required
                value={updateForm.lowStockThreshold}
                onChange={(e) => setUpdateForm({ ...updateForm, lowStockThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 text-sm font-mono border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1">Khi tồn kho nhỏ hơn hoặc bằng số này, nhãn cảnh báo sẽ được kích hoạt.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Vị trí kho hàng</label>
              <input
                type="text"
                list="warehouse-locations"
                value={updateForm.warehouseLocation}
                onChange={(e) => setUpdateForm({ ...updateForm, warehouseLocation: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-300"
                placeholder="Chọn hoặc nhập vị trí (Ví dụ: Khu A-04)"
              />
              <datalist id="warehouse-locations">
                {existingLocations.map((loc, index) => (
                  <option key={index} value={loc} />
                ))}
              </datalist>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition active:scale-[0.98]"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                disabled={isActionLoading} 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu cấu hình
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Stock Take Session */}
        {activeTab === 'stocktake' && (
          <form onSubmit={onStockTakeSubmit} className="p-6 space-y-4">
            <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl mb-2 flex items-center justify-between text-xs">
              <div className="text-gray-500">Tồn kho hiện có trên hệ thống:</div>
              <div className="font-mono font-bold text-blue-700 text-sm">{selectedInventory.stock}</div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Số lượng thực tế tại kho</label>
              <input
                type="number"
                min="0"
                required
                value={stockTakeForm.actualStock}
                onChange={(e) => setStockTakeForm({ ...stockTakeForm, actualStock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 text-sm font-mono border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1">Hệ thống sẽ điều chỉnh kho khớp với con số thực tế này.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Lý do điều chỉnh</label>
              <select
                value={stockTakeForm.reason}
                onChange={(e) => setStockTakeForm({ ...stockTakeForm, reason: e.target.value })}
                required
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all bg-white"
              >
                <option value="" disabled>-- Chọn lý do --</option>
                <option value="Kiểm kho định kỳ">Kiểm kho định kỳ</option>
                <option value="Hàng lỗi/hỏng hóc">Hàng lỗi / Hỏng hóc</option>
                <option value="Thất thoát/Mất mát">Thất thoát / Mất mát</option>
                <option value="Nhập bổ sung ngoài luồng">Nhập bổ sung ngoài luồng</option>
                <option value="Khác">Lý do khác</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition active:scale-[0.98]"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                disabled={isActionLoading} 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Xác nhận điều chỉnh
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
