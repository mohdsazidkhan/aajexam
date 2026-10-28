'use client';

import Select from './ui/Select';
import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import useTranslate from '../../hooks/useTranslate';

/**
 * Premium Search and Filter Component
 * Features a Bento-style UI, interactive focus states, and AajExam-inspired 3D buttons.
 */
const SearchFilter = ({
  searchTerm,
  onSearchChange,
  onSearch,
  filters = {},
  onFilterChange,
  onClearFilters,
  filterOptions = {},
  placeholder = "Search...",
  className = "",
  compact = false
}) => {
  const { translate } = useTranslate();
  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');
  const handleChange = onSearchChange || onSearch;

  return (
    <div className={`flex flex-col xl:flex-row items-center gap-4 ${className}`}>
        {/* Search Input Area */}
        <div className="relative flex-1 w-full group">
          <div className={`absolute top-1/2 -translate-y-1/2 z-10 ${compact ? 'left-3' : 'left-6'}`}>
            <Search className={`text-content-secondary group-focus-within:text-primary-600 transition-colors duration-300 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleChange?.(e.target.value)}
            placeholder={placeholder}
            className={compact
              ? "w-full pl-9 pr-4 py-2 border border-border-primary rounded-lg xl:rounded-xl outline-none text-sm font-bold font-outfit text-content-secondary placeholder:text-slate-600 transition-all duration-300"
              : "w-full pl-16 pr-6 py-4 bg-background-surface-secondary border border-transparent focus:border-primary-500/30 rounded-2xl outline-none text-sm font-bold font-outfit text-content-secondary placeholder:text-slate-600 transition-all duration-300"}
          />
        </div>

        {/* Filters and Actions Group */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className="relative flex-1 xl:flex-none min-w-[150px]">
              <Select
                value={filters[key] || ''}
                onChange={(e) => onFilterChange(key, e.target.value)}
                className="w-full appearance-none pl-5 pr-12 py-4 bg-background-surface-secondary border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-2xl outline-none text-[10px] font-bold uppercase tracking-[0.1em] text-content-secondary cursor-pointer transition-all duration-300 focus:border-primary-500/30"
              >
                <option value="">{options.label || key}</option>
                {options.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Filter className="w-3.5 h-3.5 text-content-secondary" />
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
                className="flex items-center gap-2 px-6 py-4 bg-background-surface-secondary text-content-primary rounded-2xl border-b-2 border-border-primary hover:bg-background-surface-secondary transition-all duration-300 group"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.08em]">{translate('Clear Filters')}</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
};

export default SearchFilter;

