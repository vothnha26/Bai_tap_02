import React from 'react';
import { Edit2, Warehouse } from 'lucide-react';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';

export default function InventoryTable({ 
  inventory, 
  isLoading, 
  onEdit, 
  page, 
  totalPages, 
  totalItems, 
  setPage 
}) {
  
  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i > 0) {
        pages.push(
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all duration-150 active:scale-95 ${
              page === i 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        );
      }
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Sản phẩm</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Mã SKU</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vị trí kho</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ngưỡng tối thiểu</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Tồn kho hiện tại</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-48" />
                        <div className="h-3 bg-gray-100 rounded w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-12 ml-auto" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-12 ml-auto" /></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-16" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-100 rounded w-8 ml-auto" /></td>
                </tr>
              ))
            ) : inventory.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Warehouse className="w-12 h-12 text-gray-300" />
                    <p className="font-semibold text-gray-500">Không tìm thấy sản phẩm tồn kho nào</p>
                    <p className="text-xs">Vui lòng thay đổi từ khóa tìm kiếm hoặc tắt bộ lọc.</p>
                  </div>
                </td>
              </tr>
            ) : (
              inventory.map((item) => {
                const product = item.productId || {};
                const isLowStock = item.stock <= (item.lowStockThreshold ?? 10);
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border bg-gray-50 flex-shrink-0">
                          <ImageWithFallback 
                            src={product.images?.[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1 text-sm">{product.name || 'Không tên'}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-gray-500 uppercase">
                      {product.sku || 'Chưa cập nhật'}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-600">
                      {item.warehouseLocation || 'Chưa gán'}
                    </td>

                    <td className="px-6 py-4 text-right font-mono text-sm text-gray-500">
                      {item.lowStockThreshold ?? 10}
                    </td>

                    <td className="px-6 py-4 text-right font-mono text-sm font-bold">
                      <span className={isLowStock ? 'text-red-600 font-black' : 'text-gray-900'}>
                        {item.stock}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                          Cần nhập hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                          An toàn
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 border border-gray-200/80 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 active:scale-95 transition-all duration-150"
                        title="Cập nhật / Kiểm kho"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Trang <span className="text-blue-600">{page}</span> / <span className="text-blue-600">{totalPages}</span> ({totalItems} sản phẩm)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition active:scale-95"
            >
              Trước
            </button>
            <div className="flex items-center gap-1">
              {renderPagination()}
            </div>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition active:scale-95"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
