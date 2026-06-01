import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  User, 
  Calendar, 
  FileText, 
  Tag, 
  AlertCircle 
} from 'lucide-react';

const InventoryTransactionTable = ({ 
  transactions = [], 
  loading = false, 
  pagination = {}, 
  onPageChange 
}) => {

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'STOCK_TAKE':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SALE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'RESTOCK':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RETURN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SYSTEM_UPDATE':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'STOCK_TAKE': return 'Kiểm kho';
      case 'SALE': return 'Bán hàng';
      case 'RESTOCK': return 'Nhập kho';
      case 'RETURN': return 'Hoàn hàng';
      case 'SYSTEM_UPDATE': return 'Cập nhật hệ thống';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">Đang tải lịch sử biến động kho...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-slate-700 font-semibold text-lg">Chưa có lịch sử biến động</h3>
        <p className="text-slate-400 text-sm mt-1 max-w-xs text-center">
          Mọi thay đổi tồn kho thực tế, nhập kho hoặc đơn hàng bán ra sẽ được tự động ghi lại tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Thời gian</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Sản phẩm</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Loại biến động</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Chênh lệch</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Tồn kho cũ ➔ Mới</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Lý do điều chỉnh</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Người thực hiện</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const product = tx.productId || {};
              const quantityChanged = tx.quantityChanged || 0;
              const isPositive = quantityChanged >= 0;

              return (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Thời gian */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{formatDateTime(tx.createdAt)}</span>
                    </div>
                  </td>

                  {/* Sản phẩm */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 max-w-xs">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                          <Tag size={16} />
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 text-sm truncate" title={product.name}>
                          {product.name || 'Sản phẩm đã bị xóa'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {product.sku || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Loại biến động */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getBadgeStyle(tx.type)}`}>
                      {getTypeText(tx.type)}
                    </span>
                  </td>

                  {/* Chênh lệch số lượng */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center gap-0.5 font-bold text-sm ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isPositive ? (
                        <ArrowUpRight size={16} className="mt-0.5" />
                      ) : (
                        <ArrowDownRight size={16} className="mt-0.5" />
                      )}
                      {isPositive ? `+${quantityChanged}` : quantityChanged}
                    </span>
                  </td>

                  {/* Tồn kho cũ ➔ Mới */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-slate-700">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-slate-400 line-through font-normal">{tx.previousStock}</span>
                      <span className="text-slate-400">➔</span>
                      <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded">{tx.newStock}</span>
                    </div>
                  </td>

                  {/* Lý do */}
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                    <div className="flex items-start gap-1.5">
                      <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2" title={tx.reason}>{tx.reason || 'N/A'}</span>
                    </div>
                  </td>

                  {/* Người thực hiện */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium`}>
                      <User size={12} className="text-slate-400" />
                      {tx.executedBy === 'System' ? 'Hệ thống' : tx.executedBy}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Hiển thị trang <span className="font-semibold text-slate-700">{pagination.currentPage}</span> trên tổng số <span className="font-semibold text-slate-700">{pagination.totalPages}</span> trang
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Tiếp theo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTransactionTable;
