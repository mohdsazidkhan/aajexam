'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Premium Search and Filter Component
 * Features a Bento-style UI, interactive focus states, and Duolingo-inspired 3D buttons.
 */
const SearchFilter = ({
  searchTerm,
  onSearchChange,
  filters = {},
  onFilterChange,
  onClearFilters,
  filterOptions = {},
  placeholder = "Search..."
}) => {
  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border-4 border-slate-100 dark:border-slate-800 p-4 mb-8 transition-all duration-300">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Search Input Area */}
        <div className="relative flex-1 w-full group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
            <Search className="text-slate-600 dark:text-slate-400 group-focus-within:text-primary-700 dark:text-primary-500 transition-colors duration-300 w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:border-primary-500/30 rounded-2xl outline-none text-sm font-bold font-outfit text-slate-700 dark:text-slate-200 placeholder:text-slate-600 dark:text-slate-400 transition-all duration-300 focus:shadow-xl focus:shadow-primary-500/5"
          />
        </div>

        {/* Filters and Actions Group */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className="relative flex-1 lg:flex-none min-w-[150px]">
              <select
                value={filters[key] || ''}
                onChange={(e) => onFilterChange(key, e.target.value)}
                className="w-full appearance-none pl-5 pr-12 py-4 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-2xl outline-none text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 dark:text-slate-400 cursor-pointer transition-all duration-300 focus:border-primary-500/30"
              >
                <option value="">{options.label || key}</option>
                {options.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Filter className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          ))}

          {/* Dynamic Clear Button */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={onClearFilters}
                className="flex items-center gap-2 px-6 py-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl border-b-4 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-[10px] font-black uppercase tracking-widest">Clear Filters</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;

