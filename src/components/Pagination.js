'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PAGE_SIZE_OPTIONS } from '../lib/constants/pagination';
import StyledSelect from './ui/StyledSelect';

/**
 * Premium 3D Pagination Component
 * Implements AajExam-style 3D buttons, smooth lifting effects, and highly readable typography.
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = PAGE_SIZE_OPTIONS,
  showInfo = true,
  compact = false
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1 && !onItemsPerPageChange) return null;

  const infoBlock = showInfo && (
    <div className="text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] font-outfit">
       Result: <span className="text-slate-900 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md mx-1 font-bold">{startItem} — {endItem}</span> of <span className="text-primary-600 font-black">{totalItems}</span>
    </div>
  );

  const pageSizeBlock = onItemsPerPageChange && (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Page Size</span>
      <StyledSelect
        value={itemsPerPage}
        onChange={(val) => onItemsPerPageChange(Number(val))}
        options={itemsPerPageOptions.map((n) => ({ value: n, label: String(n) }))}
        className="min-w-[64px]"
      />
    </div>
  );

  const navBlock = totalPages > 1 && (
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <motion.button
          whileHover={currentPage > 1 ? { y: -1 } : {}}
          whileTap={currentPage > 1 ? { y: 0 } : {}}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 border-b-2 shadow-sm ${
            currentPage === 1
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-50 cursor-not-allowed'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
             const isCurrent = page === currentPage;
             const isDots = page === '...';

             return (
               <motion.button
                 key={index}
                 whileHover={!isDots && !isCurrent ? { y: -1 } : {}}
                 whileTap={!isDots && !isCurrent ? { y: 0 } : {}}
                 onClick={() => !isDots && onPageChange(page)}
                 disabled={isDots}
                 className={`min-w-[32px] h-8 px-1.5 flex items-center justify-center rounded-lg font-black font-outfit text-[11px] transition-all duration-300 border-b-2 ${
                   isCurrent
                     ? 'bg-primary-600 border-primary-600 text-white shadow-sm translate-y-0.5'
                     : isDots
                       ? 'text-slate-600 dark:text-slate-400 bg-transparent border-transparent cursor-default'
                       : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                 }`}
               >
                 {page}
               </motion.button>
             );
          })}
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={currentPage < totalPages ? { y: -1 } : {}}
          whileTap={currentPage < totalPages ? { y: 0 } : {}}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 border-b-2 shadow-sm ${
            currentPage === totalPages
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-50 cursor-not-allowed'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
  );

  if (compact) {
    return (
      <div className="sticky bottom-0 z-20 flex flex-col gap-2 py-2.5 bg-white dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-800 rounded-b-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.04)] transition-colors duration-300">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 truncate">{infoBlock}</div>
          <div className="shrink-0">{pageSizeBlock}</div>
        </div>
        <div className="flex items-center justify-center">
          {navBlock}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 z-20 grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-4 px-4 py-2.5 bg-white dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-800 rounded-b-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.04)] transition-colors duration-300">
      <div className="sm:col-start-1 flex justify-center sm:justify-start">{infoBlock}</div>
      <div className="sm:col-start-2 flex justify-center">{pageSizeBlock}</div>
      <div className="sm:col-start-3 flex justify-center sm:justify-end">{navBlock}</div>
    </div>
  );
};

export default Pagination;
