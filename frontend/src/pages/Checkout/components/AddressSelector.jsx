import { MapPin, Plus, Check, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/utils/utils';

export default function AddressSelector({ 
  addresses, 
  selectedId, 
  onSelect, 
  onAddNew, 
  isNewAddress 
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Địa chỉ giao hàng</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddNew}
          className={`rounded-xl font-black uppercase text-[9px] tracking-widest px-4 border-slate-100 ${isNewAddress ? 'bg-blue-600 text-white border-blue-600' : ''}`}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          {isNewAddress ? 'Đang tạo mới' : 'Thêm địa chỉ'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => {
          const isSelected = selectedId === addr._id;
          return (
            <div
              key={addr._id}
              onClick={() => onSelect(addr._id)}
              className={`relative p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer group ${
                isSelected 
                  ? 'bg-blue-50/50 border-blue-600 dark:bg-blue-900/10 shadow-lg shadow-blue-600/5' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}>
                  <MapPin className="w-5 h-5" />
                </div>
                {isSelected && (
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    Mặc định
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                   <Phone className="w-3.5 h-3.5 text-slate-400" />
                   <span className={`text-sm font-black tabular-nums ${!addr.phone ? 'text-rose-500 italic font-medium' : ''}`}>
                      {addr.phone || 'Chưa cập nhật SĐT'}
                   </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                  {formatAddress(addr)}
                </p>
              </div>

              {isSelected && (
                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white dark:ring-slate-950">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
