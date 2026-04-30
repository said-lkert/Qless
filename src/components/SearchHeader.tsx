import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Menu, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { cn } from '../lib/utils';

interface SearchHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onToggleFilter: () => void;
  viewMode: 'map' | 'list';
  onToggleViewMode: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({ searchQuery, onSearch, onToggleFilter, viewMode, onToggleViewMode }) => {
  const { t, lang } = useLanguage();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="absolute top-6 left-0 right-0 z-[500] px-4 pointer-events-none">
      <motion.div layout className="max-w-md mx-auto flex flex-col gap-3">
        <motion.div layout className="flex items-center gap-2 pointer-events-auto w-full">
          <AnimatePresence mode="popLayout">
            {viewMode === 'list' && (
              <motion.button
                key="filter-list"
                layout
                initial={{ opacity: 0, x: -10, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 'auto' }}
                exit={{ opacity: 0, x: -10, width: 0 }}
                onClick={onToggleFilter}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 ring-1 ring-black/5 dark:ring-white/5 hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-95 group flex-shrink-0 focus:outline-none"
              >
                <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.div 
            layout
            animate={{ 
              boxShadow: isFocused ? '0 0 25px rgba(59, 130, 246, 0.4)' : '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
              borderColor: isFocused ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)'
            }}
            className={cn(
              "flex-1 min-w-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl flex items-center px-4 py-3 border transition-all ring-1 ring-black/5 dark:ring-white/5",
              isFocused ? "bg-white dark:bg-gray-800" : ""
            )}
          >
            <input 
              type="text" 
              value={searchQuery}
              placeholder={t('search')}
              className="flex-1 min-w-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm py-1 dark:text-white dark:placeholder-gray-400 font-medium"
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <motion.div 
              animate={{ 
                scale: isFocused ? 1.1 : 1,
                backgroundColor: isFocused ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
              }}
              className="p-1.5 rounded-xl ml-1 flex-shrink-0"
            >
              <Search className={cn("w-4 h-4 transition-colors", isFocused ? "text-blue-500" : "text-blue-600 dark:text-blue-400")} />
            </motion.div>
          </motion.div>
          
          <motion.button 
            layout
            onClick={onToggleViewMode}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl pointer-events-auto hover:bg-white dark:hover:bg-gray-700 transition-all border border-white/20 dark:border-gray-700/50 ring-1 ring-black/5 dark:ring-white/5 active:scale-95 group flex-shrink-0 focus:outline-none"
          >
            {viewMode === 'map' ? (
              <ListIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            ) : (
              <MapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {viewMode === 'map' && (
            <motion.div 
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex pointer-events-auto"
              dir="ltr"
            >
              <button 
                onClick={onToggleFilter}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl px-6 py-2.5 rounded-2xl shadow-xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 border border-white/20 dark:border-gray-700/50 ring-1 ring-black/5 dark:ring-white/5 hover:bg-white dark:hover:bg-gray-700 transition-all dark:text-white active:scale-95 group focus:outline-none"
              >
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:rotate-12 transition-transform">
                  <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                {t('filter')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
