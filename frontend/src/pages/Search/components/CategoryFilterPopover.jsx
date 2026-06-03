import { useState, useRef, useEffect, useMemo } from 'react';
import { SlidersHorizontal, Search, X, Check, ChevronDown, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CategoryFilterPopover({
  categories,
  selectedCategories,
  toggleCategory,
  onApply,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  // Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Đóng khi nhấn Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [categories, query]);

  const count = selectedCategories.length;

  const handleApply = () => {
    onApply?.();
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-2 px-5 h-[58px] rounded-[1.5rem] border font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${
          open || count > 0
            ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-700 shadow-lg shadow-slate-900/15'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.02)]'
        }`}
      >
        <Tag className="w-4 h-4" />
        <span>Danh mục</span>

        {/* Count badge */}
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </motion.div>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="absolute left-0 top-[calc(100%+8px)] w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] z-40 overflow-hidden"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                  Danh mục
                </span>
                {count > 0 && (
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black rounded-full">
                    {count} đã chọn
                  </span>
                )}
              </div>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    selectedCategories.forEach((id) => toggleCategory(id));
                  }}
                  className="text-[10px] font-black text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Xóa
                </button>
              )}
            </div>

            <div className="p-3 space-y-2">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 dark:text-slate-600" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm danh mục..."
                  autoFocus
                  className="w-full pl-7 pr-7 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-600 text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category list */}
              <div className="max-h-56 overflow-y-auto space-y-0.5 -mx-1 px-1">
                {categories.length === 0 ? (
                  <div className="space-y-1.5 py-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
                        style={{ opacity: 1 - i * 0.15 }}
                      />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-6 font-medium">
                    Không tìm thấy danh mục
                  </p>
                ) : (
                  filtered.map((cat) => {
                    const id = cat.id || cat._id;
                    const isSelected = selectedCategories.includes(id);
                    return (
                      <motion.button
                        key={id}
                        type="button"
                        onClick={() => toggleCategory(id)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 group ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-slate-800 text-white'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-white dark:bg-blue-500 border-white dark:border-blue-500'
                              : 'border-slate-200 dark:border-slate-600 group-hover:border-slate-400'
                          }`}
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3.5px] text-slate-900 dark:text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <span className={`text-xs truncate ${isSelected ? 'font-bold' : 'font-medium'}`}>
                          {cat.name}
                        </span>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 pb-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleApply}
                className="w-full py-2.5 bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl hover:bg-slate-700 dark:hover:bg-blue-500 transition-colors"
              >
                Áp dụng{count > 0 ? ` (${count})` : ''}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
