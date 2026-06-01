import React from 'react';
import { Sliders, AlertTriangle } from 'lucide-react';

export default function InventoryStats({ totalItems, lowStockCount }) {
  return (
    <div className="flex gap-4">
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4 min-w-[160px]">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Sliders className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng mặt hàng</p>
          <p className="text-xl font-black text-gray-900 font-mono mt-0.5">{totalItems}</p>
        </div>
      </div>

      <div className={`bg-white px-5 py-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-4 min-w-[180px] ${
        lowStockCount > 0 
          ? 'border-red-200 bg-red-50/10' 
          : 'border-gray-200/60'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          lowStockCount > 0 ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${
            lowStockCount > 0 ? 'text-red-500 animate-pulse' : 'text-green-500'
          }`} />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tồn kho thấp</p>
          <p className={`text-xl font-black font-mono mt-0.5 ${
            lowStockCount > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {lowStockCount}
          </p>
        </div>
      </div>
    </div>
  );
}
