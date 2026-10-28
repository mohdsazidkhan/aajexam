'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { m as motion } from 'framer-motion';
import { PAGE_SIZE_OPTIONS } from '../../lib/constants/pagination';
import StyledSelect from './ui/StyledSelect';
import useTranslate from '../../hooks/useTranslate';

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
  compact = false,
  inline = false, // compact + info / page buttons / page size on ONE row from xl up (used under full-width lists)
  sticky = true
}) => {
  const { translate, rich } = useTranslate();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Always a window of 5 page numbers (fewer only when there are fewer than 5 pages).
  const getPageNumbers = () => {
    const windowSize = 5;
    const count = Math.min(windowSize, totalPages);
    const first = Math.min(Math.max(1, currentPage - 2), Math.max(1, totalPages - windowSize + 1));
    return Array.from({ length: count }, (_, i) => first + i);
  };

  if (totalPages <= 1 && !onItemsPerPageChange) return null;

  const hasTotals = Number.isFinite(totalItems) && Number.isFinite(itemsPerPage) && itemsPerPage > 0;
  const infoBlock = showInfo && (
    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[9px] font-bold text-content-secondary uppercase tracking-[0.08em] font-outfit">
      <span>{translate('Page {page} of {total}', { page: currentPage, total: Math.max(1, totalPages) })}</span>
      {hasTotals && (
        <span>
          {rich('Result: <0></0> of <1></1>', [() => <span className="text-content-primary px-2 py-0.5 bg-background-surface-secondary rounded-md mx-1 font-bold">{startItem} — {endItem}</span>, () => <span className="text-primary-600 font-bold">{totalItems}</span>])}
        </span>
      )}
    </div>
  );

  const pageSizeBlock = !onItemsPerPageChange ? (
    Number.isFinite(itemsPerPage) && itemsPerPage > 0 && (
      <div className="flex items-center gap-2 text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] whitespace-nowrap">
        {translate('Page Size')}
        <span className="text-content-primary px-2 py-0.5 bg-background-surface-secondary rounded-md font-bold">{itemsPerPage}</span>
      </div>
    )
  ) : (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] whitespace-nowrap">{translate('Page Size')}</span>
      <StyledSelect
        value={itemsPerPage}
        onChange={(val) => onItemsPerPageChange(Number(val))}
        options={itemsPerPageOptions.map((n) => ({ value: n, label: String(n) }))}
        className="min-w-[64px]"
      />
    </div>
  );

  const navBlock = totalPages > 1 && (
      <nav className="flex items-center gap-1.5">
        {/* Previous Button */}
        <motion.button
          whileHover={currentPage > 1 ? { y: -1 } : {}}
          whileTap={currentPage > 1 ? { y: 0 } : {}}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 border ${
            currentPage === 1
              ? 'bg-background-surface-secondary border-border-primary text-content-secondary opacity-50 cursor-not-allowed'
              : 'bg-background-surface border-border-primary text-content-secondary hover:bg-background-surface-secondary dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600'
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
                 className={`min-w-[32px] h-8 px-1.5 flex items-center justify-center rounded-lg font-bold font-outfit text-[11px] transition-all duration-300 border ${
                   isCurrent
                     ? 'bg-primary-600 border-primary-600 text-on-primary translate-y-0.5'
                     : isDots
                       ? 'text-content-secondary bg-transparent border-transparent cursor-default'
                       : 'bg-background-surface border-border-primary text-content-secondary hover:bg-background-surface-secondary dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600'
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
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 border ${
            currentPage === totalPages
              ? 'bg-background-surface-secondary border-border-primary text-content-secondary opacity-50 cursor-not-allowed'
              : 'bg-background-surface border-border-primary text-content-secondary hover:bg-background-surface-secondary dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
      </nav>
  );

  if (compact && inline) {
    return (
      <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-1 py-2 bg-background-surface border-t-2 border-border-primary rounded-b-2xl transition-colors duration-300">
        <div className="order-1 min-w-0 flex-1">{infoBlock}</div>
        <div className="order-2 xl:order-3 shrink-0 xl:flex-1 xl:flex xl:justify-end">{pageSizeBlock}</div>
        <div className="order-3 xl:order-2 w-full xl:w-auto flex items-center justify-center">{navBlock}</div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="sticky bottom-0 z-20 flex flex-col gap-2 py-2.5 bg-background-surface border-t-2 border-border-primary rounded-b-2xl transition-colors duration-300">
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
    <div className={`${sticky ? 'sticky bottom-0 z-20 rounded-b-2xl border-t' : 'rounded-2xl border'} border-border-primary flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 bg-background-surface transition-colors duration-300`}>
      <div className="flex justify-start">{infoBlock}</div>
      <div className="flex justify-center">{pageSizeBlock}</div>
      <div className="flex justify-end">{navBlock}</div>
    </div>
  );
};

export default Pagination;
