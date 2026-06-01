import React from 'react';
import { Search, RotateCw } from 'lucide-react';

export default function InventoryControlBar({ 
  searchTerm, 
  setSearchTerm, 
  lowStockOnly, 
  setLowStockOnly, 
  onSubmitSearch, 
  onResetSearch, 
  searchQuery 
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <form onSubmit={onSubmitSearch} className="flex-1 flex gap-2 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
          />
        </div>
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-150 shadow-sm shadow-blue-500/10"
        >
          Tìm kiếm
        </button>
        {searchQuery && (
          <button 
            type="button" 
            onClick={onResetSearch}
            className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition active:scale-95"
          >
            <RotateCw className="w-4.5 h-4.5 text-gray-500" />
          </button>
        )}
      </form>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-gray-600">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 cursor-pointer"
          />
          <span>Cảnh báo hết hàng</span>
        </label>
      </div>
    </div>
  );
}
