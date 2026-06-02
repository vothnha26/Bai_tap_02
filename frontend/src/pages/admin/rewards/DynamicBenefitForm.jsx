import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Info } from 'lucide-react';

export default function DynamicBenefitForm({ control, register, errors, benefitMetadata, watch }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'benefits',
  });

  const selectedBenefitIds = watch('benefits').map(b => b.benefitId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          Quyền lợi của hạng
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded w-48 -top-12 left-0 shadow-xl z-50">
              Cấu hình các giá trị cụ thể cho từng quyền lợi mà hạng này được hưởng.
            </div>
          </div>
        </h3>
        <button
          type="button"
          onClick={() => append({ benefitId: '', value: '' })}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm quyền lợi
        </button>
      </div>

      {fields.length === 0 && (
        <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-500">
          Chưa có quyền lợi nào được thiết lập.
        </div>
      )}

      <div className="grid gap-4">
        {fields.map((field, index) => {
          const currentBenefitId = watch(`benefits.${index}.benefitId`);
          const meta = benefitMetadata.find(b => b.id === currentBenefitId);

          return (
            <div 
              key={field.id} 
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex-1 space-y-4">
                {/* Benefit Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Loại quyền lợi
                  </label>
                  <select
                    {...register(`benefits.${index}.benefitId`, { required: 'Vui lòng chọn loại' })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">-- Chọn quyền lợi --</option>
                    {benefitMetadata.map(b => (
                      <option 
                        key={b.id} 
                        value={b.id}
                        disabled={selectedBenefitIds.includes(b.id) && b.id !== currentBenefitId}
                      >
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                  {errors?.benefits?.[index]?.benefitId && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.benefits[index].benefitId.message}</p>
                  )}
                </div>

                {/* Dynamic Value Input */}
                {meta && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Giá trị ({meta.valueType})
                    </label>
                    {meta.valueType === 'BOOLEAN' ? (
                      <div className="flex items-center gap-3 h-10 px-3 bg-white border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          {...register(`benefits.${index}.value`)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">Kích hoạt</span>
                      </div>
                    ) : meta.valueType === 'NUMBER' || meta.valueType === 'PERCENTAGE' ? (
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          {...register(`benefits.${index}.value`, { 
                            required: 'Nhập giá trị',
                            valueAsNumber: true 
                          })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-10"
                        />
                        <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-sm">
                          {meta.valueType === 'PERCENTAGE' ? '%' : '#'}
                        </span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        {...register(`benefits.${index}.value`, { required: 'Nhập giá trị' })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    )}
                    {errors?.benefits?.[index]?.value && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.benefits[index].value.message}</p>
                    )}
                    <p className="mt-1.5 text-xs text-gray-400 italic">{meta.description}</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
