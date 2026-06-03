import { useState } from 'react';
import { X, Check, ChevronDown, Star, DollarSign, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Slider } from '@/components/ui/slider';

function FilterSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3.5 group"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PRICE_PRESETS = [
  { label: 'Dưới 1tr', min: 0, max: 1_000_000 },
  { label: '1tr – 5tr', min: 1_000_000, max: 5_000_000 },
  { label: '5tr – 20tr', min: 5_000_000, max: 20_000_000 },
  { label: 'Trên 20tr', min: 20_000_000, max: Infinity },
];

const RATINGS = [
  { value: '4.5', label: '4.5+' },
  { value: '4.0', label: '4.0+' },
  { value: '3.5', label: '3.5+' },
  { value: '3.0', label: '3.0+' },
];

export default function FilterSidebar({
  priceValues,
  setPriceValues,
  MAX_PRICE,
  minRating,
  setMinRating,
  handleSearch,
  clearFilters,
  hasActiveFilters,
  formatCurrency,
}) {
  const activeCount =
    (priceValues[0] > 0 || priceValues[1] < MAX_PRICE ? 1 : 0) +
    (minRating ? 1 : 0);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
          <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em]">
            Bộ lọc
          </h2>
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="inline-flex items-center justify-center w-4 h-4 bg-slate-900 dark:bg-blue-500 text-white text-[9px] font-black rounded-full"
              >
                {activeCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={clearFilters}
              className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 uppercase tracking-widest transition-colors"
            >
              <X className="w-3 h-3" />
              Xóa
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Sections */}
      <div>
        <div className="px-5">

          {/* Giá */}
          <FilterSection title="Khoảng giá" icon={DollarSign}>
            <div className="space-y-4">
              {/* Display */}
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Từ</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(priceValues[0])}
                  </p>
                </div>
                <div className="flex-1 mx-3 border-t border-dashed border-slate-200 dark:border-slate-700 mt-4" />
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Đến</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                    {priceValues[1] >= MAX_PRICE ? 'Tối đa' : formatCurrency(priceValues[1])}
                  </p>
                </div>
              </div>

              <Slider
                value={priceValues}
                max={MAX_PRICE}
                step={1_000_000}
                onValueChange={setPriceValues}
                className="py-1"
              />

              <div className="grid grid-cols-2 gap-1.5">
                {PRICE_PRESETS.map((preset) => {
                  const maxVal = preset.max === Infinity ? MAX_PRICE : preset.max;
                  const isActive = priceValues[0] === preset.min && priceValues[1] === maxVal;
                  return (
                    <motion.button
                      key={preset.label}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPriceValues([preset.min, maxVal])}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-black transition-all duration-150 border ${
                        isActive
                          ? 'bg-slate-900 dark:bg-blue-600 text-white border-transparent'
                          : 'text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </FilterSection>

          {/* Đánh giá */}
          <FilterSection title="Đánh giá" icon={Star}>
            <div className="space-y-1">
              {RATINGS.map(({ value, label }) => {
                const isActive = minRating === value;
                const ratingNum = parseFloat(value);
                return (
                  <motion.button
                    key={value}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setMinRating(isActive ? '' : value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border ${
                      isActive
                        ? 'bg-slate-900 dark:bg-blue-600 text-white border-transparent'
                        : 'text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(ratingNum)
                                ? isActive
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-amber-400 text-amber-400'
                                : isActive
                                ? 'fill-white/20 text-white/20'
                                : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span>{label} trở lên</span>
                    </div>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </FilterSection>

        </div>
      </div>

      {/* Apply button — dính đáy */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <motion.button
          type="button"
          onClick={handleSearch}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-700 dark:hover:bg-blue-500 transition-colors"
        >
          Áp dụng
          {activeCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-white/20 text-white text-[9px] font-black rounded-full">
              {activeCount}
            </span>
          )}
        </motion.button>
      </div>

    </div>
  );
}
