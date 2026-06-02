import React from 'react';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, History, Search } from 'lucide-react';

export default function RewardHistory({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <History className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-black text-gray-900">Chưa có lịch sử điểm</h3>
        <p className="text-gray-500 mt-2 font-medium">Hãy thực hiện mua hàng hoặc đánh giá sản phẩm để tích lũy điểm!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
          <History className="w-6 h-6 text-blue-600" />
          Lịch sử ví điểm
        </h3>
        <span className="text-xs font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">50 giao dịch gần nhất</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Nguồn</th>
              <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Biến động</th>
              <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Số dư</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-bold text-gray-900">
                    {format(new Date(log.createdAt), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {format(new Date(log.createdAt), 'HH:mm')}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      log.source === 'ORDER' ? 'bg-blue-500' : 
                      log.source === 'REVIEW' ? 'bg-green-500' : 'bg-orange-500'
                    }`} />
                    <span className="text-sm font-black text-gray-700 uppercase tracking-tighter">
                      {log.source === 'ORDER' ? 'Mua hàng' : 
                       log.source === 'REVIEW' ? 'Đánh giá' : 'Hệ thống'}
                    </span>
                  </div>
                  {log.reason && <p className="text-[10px] text-gray-400 mt-0.5">{log.reason}</p>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`inline-flex items-center gap-1 font-black tabular-nums ${
                    log.pointsChanged >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {log.pointsChanged >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {log.pointsChanged > 0 ? '+' : ''}{log.pointsChanged.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-black text-gray-900 tabular-nums">
                    {log.currentBalance.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
