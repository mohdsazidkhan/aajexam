'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Premium 3D Pagination Component
 * Implements Duolingo-style 3D buttons, smooth lifting effects, and highly readable typography.
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showInfo = true
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

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-8 bg-white dark:bg-slate-900 border-t-4 border-slate-100 dark:border-slate-800 rounded-b-[2rem] shadow-sm transition-colors duration-300">
      {/* Visual Info Display */}
      {showInfo && (
        <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-outfit">
           Result: <span className="text-slate-900 dark:text-white px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl mx-1 font-bold">{startItem} — {endItem}</span> of <span className="text-primary-700 dark:text-primary-500 font-black">{totalItems}</span>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center gap-3">
        {/* Previous Button */}
        <motion.button
          whileHover={currentPage > 1 ? { y: -2 } : {}}
          whileTap={currentPage > 1 ? { y: 0 } : {}}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 border-b-4 shadow-sm ${
            currentPage === 1
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-50 cursor-not-allowed'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-2">
          {getPageNumbers().map((page, index) => {
             const isCurrent = page === currentPage;
             const isDots = page === '...';

             return (
               <motion.button
                 key={index}
                 whileHover={!isDots && !isCurrent ? { y: -2 } : {}}
                 whileTap={!isDots && !isCurrent ? { y: 0 } : {}}
                 onClick={() => !isDots && onPageChange(page)}
                 disabled={isDots}
                 className={`min-w-[44px] h-11 px-2 flex items-center justify-center rounded-2xl font-black font-outfit text-xs transition-all duration-300 border-b-4 ${
                   isCurrent
                     ? 'bg-primary-500 border-primary-600 text-white shadow-duo-primary translate-y-0.5'
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
          whileHover={currentPage < totalPages ? { y: -2 } : {}}
          whileTap={currentPage < totalPages ? { y: 0 } : {}}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 border-b-4 shadow-sm ${
            currentPage === totalPages
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-50 cursor-not-allowed'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default Pagination;
