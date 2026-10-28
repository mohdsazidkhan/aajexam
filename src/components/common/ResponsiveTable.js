'use client';

import Select from './ui/Select';
import React, { useState } from 'react';
import {
  Table,
  List,
  LayoutGrid,
  Eye,
  Edit3,
  Trash2,
  ChevronDown,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Layers,
  Hash,
  Activity,
  User
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Pagination from './Pagination';
import ViewToggle from './ViewToggle';
import { AdminTableSkeleton } from '../admin/Skeletons';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../lib/constants/pagination';
import useTranslate from '../../hooks/useTranslate';

/**
 * Premium Responsive Table Component
 * Supports dynamic column mapping for Table, List, and Grid views.
 * Features gamified achievement cards, hero player cards, and glassmorphism.
 */
const ResponsiveTable = ({
  data = [],
  columns = [],
  actions = [],
  viewModes = ['table', 'list', 'grid'],
  defaultView = 'table',
  currentView = null,
  itemsPerPage = DEFAULT_PAGE_SIZE,
  showPagination = true,
  showViewToggle = true,
  className = '',
  onRowClick = null,
  onViewChange = null,
  loading = false,
  emptyMessage = "No data available",
  fillHeight = false,
}) => {
  const { translate } = useTranslate();
  const [internalView, setInternalView] = useState(defaultView);
  const currentViewState = currentView !== null ? currentView : internalView;
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState, setItemsPerPage] = useState(itemsPerPage);

  const totalItems = data.length;
  const totalPages = showPagination ? Math.ceil(totalItems / itemsPerPageState) : 1;
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const currentData = showPagination ? data.slice(startIndex, startIndex + itemsPerPageState) : data;
  const getSerialNumber = (index) => startIndex + index + 1;

  const handlePageChange = (page) => setCurrentPage(page);

  const handleViewChange = (view) => {
    if (currentView === null) setInternalView(view);
    setCurrentPage(1);
    onViewChange?.(view);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // --- Dynamic Icon Mapping based on column keys ---
  const getIconForKey = (key) => {
    const k = String(key || '').toLowerCase();
    if (k.includes('name') || k.includes('student') || k.includes('user')) return <User className="w-3.5 h-3.5" />;
    if (k.includes('join') || k.includes('date') || k.includes('time')) return <Calendar className="w-3.5 h-3.5" />;
    if (k.includes('level') || k.includes('rank') || k.includes('type')) return <Layers className="w-3.5 h-3.5" />;
    if (k.includes('contact') || k.includes('email') || k.includes('phone')) return <Mail className="w-3.5 h-3.5" />;
    if (k.includes('code') || k.includes('id') || k.includes('ref')) return <Hash className="w-3.5 h-3.5" />;
    if (k.includes('status') || k.includes('count') || k.includes('total')) return <Activity className="w-3.5 h-3.5" />;
    return <ChevronDown className="w-3.5 h-3.5" />;
  };

  // --- Table View (Data Matrix) ---
  const lastColumnIsActions = columns.length > 0 && String(columns[columns.length - 1].key || '').toLowerCase() === 'actions';

  const renderTableView = () => (
    <div className={`${fillHeight ? 'flex-1 min-h-0 overflow-auto' : 'max-h-[65vh]'} overflow-auto rounded-2xl border border-border-primary transition-all duration-300`}>
      <table className="w-full border-collapse bg-background-surface">
        <thead className="sticky top-0 z-10 border-b border-border-primary bg-background-surface">
          <tr>
            <th className="px-3 py-2 text-left text-[10px] font-bold text-content-primary uppercase tracking-[0.08em] font-outfit whitespace-nowrap">
              {translate('S.No.')}
            </th>
            {columns.map((column, index) => {
              const isStickyActions = lastColumnIsActions && index === columns.length - 1;
              return (
                <th
                  key={index}
                  className={`px-3 py-2 text-[10px] font-bold text-content-primary uppercase tracking-[0.08em] font-outfit whitespace-nowrap ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                    } ${isStickyActions ? 'sticky right-0 z-20 border-l border-primary-200 dark:border-primary-700' : ''}`}
                >
                  {column.header}
                </th>
              );
            })}
            {actions.length > 0 && (
              <th className="px-3 py-2 text-left text-[10px] font-bold text-content-primary uppercase tracking-[0.08em] font-outfit whitespace-nowrap sticky right-0 z-20 border-l border-primary-200 dark:border-primary-700">
                {translate('Actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-primary">
          {currentData.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className={`transition-colors duration-200 group ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              <td className="px-3 py-1.5 text-xs font-bold text-content-secondary whitespace-nowrap">
                {getSerialNumber(rowIndex)}
              </td>
              {columns.map((column, colIndex) => {
                const isStickyActions = lastColumnIsActions && colIndex === columns.length - 1;
                return (
                  <td key={colIndex} className={`px-3 py-1.5 text-xs font-bold text-content-secondary whitespace-nowrap ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                    } ${isStickyActions ? 'sticky right-0 z-10 bg-background-surface border-l border-border-primary' : ''}`}>
                    {column.render ? column.render(row[column.key], row) : (row[column.key] || '—')}
                  </td>
                );
              })}
              {actions.length > 0 && (
                <td className="px-3 py-1.5 whitespace-nowrap sticky right-0 z-10 bg-background-surface border-l border-border-primary">
                  <div className="flex items-center gap-1.5">
                    {actions.map((action, actionIndex) => (
                      <motion.button
                        key={actionIndex}
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                        className={`p-1.5 rounded-lg transition-all duration-300 ${action.variant === 'danger' ? 'text-content-primary bg-background-surface-secondary hover:bg-background-surface-secondary' :
                          action.variant === 'success' ? 'text-primary-600' :
                            'text-primary-600'
                          }`}
                        title={action.label}
                      >
                        {action.icon || <MoreHorizontal className="w-3.5 h-3.5" />}
                      </motion.button>
                    ))}
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- List View (Achievement Cards) ---
  const renderListView = () => (
    <div className="grid grid-cols-1 gap-6">
      {currentData.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          layout
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`bg-background-surface rounded-2xl xl:rounded-2xl border border-border-primary p-5 xl:p-6 transition-all duration-500 group ${onRowClick ? 'cursor-pointer hover:translate-x-2' : ''}`}
          onClick={() => onRowClick?.(row)}
        >
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 xl:grid-cols-6 gap-4 xl:gap-6">
              {columns.map((col, idx) => (
                <div key={idx} className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-content-secondary uppercase tracking-[0.08em] truncate">
                    {getIconForKey(col.key)} {col.header}
                  </div>
                  <div className="text-xs font-bold text-content-primary truncate">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] || '—')}
                  </div>
                </div>
              ))}
            </div>
            {actions.length > 0 && (
              <div className="flex items-center xl:justify-end gap-3 pt-6 xl:pt-0 border-t-2 xl:border-t-0 border-border-primary dark:border-slate-800/50">
                {actions.map((action, actionIndex) => (
                  <motion.button
                    key={actionIndex}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                    className={`p-3.5 xl:p-3 rounded-lg xl:rounded-xl transition-all duration-300 ${action.variant === 'danger' ? 'bg-background-surface-secondary text-content-primary hover:bg-background-surface-secondary' :
                      action.variant === 'success' ? 'text-primary-600' :
                        'text-primary-600'
                      }`}
                  >
                    {action.icon}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  // --- Grid View (Hero Player Cards) ---
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 px-0">
      {currentData.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -10, scale: 1.02 }}
          className={`relative bg-background-surface rounded-md xl:rounded-3xl border border-border-primary p-4 xl:p-8 transition-all duration-500 group overflow-hidden ${onRowClick ? 'cursor-pointer' : ''}`}
          onClick={() => onRowClick?.(row)}
        >
          {/* Card Decorations */}
          <div className="absolute top-0 right-0 w-20 xl:w-32 h-20 xl:h-32 rounded-bl-[4rem] group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Hero Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-600 p-0.5 group-hover:rotate-6 transition-transform duration-500">
                <div className="w-full h-full bg-slate-900 rounded-lg xl:rounded-xl flex items-center justify-center text-white font-bold text-2xl italic">
                  {(row.name || row[columns[0]?.key] || 'U')[0]}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold font-outfit uppercase tracking-tight text-content-primary truncate">
                  {row.name || row[columns[0]?.key] || translate('Unknown Object')}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Activity className="w-3 h-3 text-primary-600" />
                  <span className="text-[9px] font-bold text-primary-600 uppercase tracking-[0.08em]">{row.status || translate('Active')}</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-4 py-2">
              {columns.slice(1, 4).map((col, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-content-secondary uppercase tracking-[0.08em]">
                    {getIconForKey(col.key)} {col.header}
                  </div>
                  <div className="text-[10px] font-bold text-content-primary text-right truncate max-w-[140px]">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] || '—')}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Bar */}
            {actions.length > 0 && (
              <div className="flex items-center justify-center gap-4 pt-6 border-t-2 border-border-primary dark:border-slate-800 group-hover:border-primary-500/20 transition-all">
                {actions.map((action, actionIndex) => (
                  <motion.button
                    key={actionIndex}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                    className={`p-4 xl:p-3 rounded-lg xl:rounded-xl transition-all duration-500 ${action.variant === 'danger' ? 'bg-background-surface-secondary text-content-primary hover:bg-background-surface-secondary' :
                      'bg-background-surface-secondary text-content-secondary hover:text-primary-600 hover:bg-background-surface-secondary'
                      }`}
                  >
                    {action.icon}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className={`${fillHeight ? 'flex-1 min-h-0 overflow-auto flex flex-col' : 'space-y-10'} ${className}`}>
      {/* Header Controls (View Toggle & Density) */}
      {(showViewToggle || showPagination) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          {showViewToggle && (
            <div className="p-2 bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl xl:rounded-2xl border border-border-primary w-full sm:w-auto">
              <ViewToggle
                currentView={currentViewState}
                onViewChange={handleViewChange}
                views={viewModes}
              />
            </div>
          )}

          {showPagination && (
            <div className="px-5 py-3 xl:py-2.5 bg-background-surface border border-border-primary rounded-2xl xl:rounded-2xl flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] font-outfit">{translate('Page Size')}</span>
              <Select
                value={itemsPerPageState}
                onChange={handleItemsPerPageChange}
                className="bg-transparent text-xs font-bold text-content-primary outline-none cursor-pointer focus:text-primary-600 transition-colors font-outfit"
              >
                {PAGE_SIZE_OPTIONS.map(v => <option key={v} value={v} className="bg-slate-900">{v}</option>)}
              </Select>
            </div>
          )}
        </motion.div>
      )}

      {/* Primary Display Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminTableSkeleton />
          </motion.div>
        ) : data.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-slate-50/50 dark:bg-slate-800/10 rounded-3xl border border-dashed border-border-primary"
          >
            <div className="p-10 bg-background-surface rounded-3xl border-b-2 border-border-primary mb-8">
              <Layers className="w-16 h-16 text-slate-200 dark:text-slate-700" />
            </div>
            <p className="text-xs font-bold text-content-secondary uppercase tracking-[0.08em] font-outfit">{emptyMessage}</p>
          </motion.div>
        ) : (
          <motion.div
            key={currentViewState}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={fillHeight && currentViewState === 'table' ? 'flex-1 min-h-0 overflow-auto flex flex-col' : ''}
          >
            {currentViewState === 'table' && renderTableView()}
            {currentViewState === 'list' && renderListView()}
            {currentViewState === 'grid' && renderGridView()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Navigation */}
      {showPagination && totalPages > 1 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPageState}
          />
        </motion.div>
      )}
    </div>
  );
};

export default ResponsiveTable;

