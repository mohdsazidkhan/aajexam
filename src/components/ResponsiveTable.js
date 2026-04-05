'use client';

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
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from './Pagination';
import ViewToggle from './ViewToggle';
import Loading from './Loading';

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
  itemsPerPage = 10,
  showPagination = true,
  showViewToggle = true,
  className = '',
  onRowClick = null,
  onViewChange = null,
  loading = false,
  emptyMessage = "No data available",
}) => {
  const [internalView, setInternalView] = useState(defaultView);
  const currentViewState = currentView !== null ? currentView : internalView;
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState, setItemsPerPage] = useState(itemsPerPage);

  const totalItems = data.length;
  const totalPages = showPagination ? Math.ceil(totalItems / itemsPerPageState) : 1;
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const currentData = showPagination ? data.slice(startIndex, startIndex + itemsPerPageState) : data;

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
  const renderTableView = () => (
    <div className="overflow-x-auto rounded-[2rem] border-4 border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300">
      <table className="w-full border-collapse bg-white dark:bg-slate-900 overflow-hidden">
        <thead className="bg-slate-50 dark:bg-slate-800/40 border-b-2 border-slate-100 dark:border-slate-800">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-5 text-left text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-outfit"
              >
                {column.header}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-outfit">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-50 dark:divide-slate-800/30">
          {currentData.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.03 }}
              className={`hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all duration-300 group ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  {column.render ? column.render(row[column.key], row) : (row[column.key] || 'â€”')}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    {actions.map((action, actionIndex) => (
                      <motion.button
                        key={actionIndex}
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                        className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm ${action.variant === 'danger' ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100' :
                          action.variant === 'success' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100' :
                            'text-primary-700 dark:text-primary-500 bg-primary-50 dark:bg-primary-950/30 hover:bg-primary-100'
                          }`}
                        title={action.label}
                      >
                        {action.icon || <MoreHorizontal className="w-4 h-4" />}
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
          className={`bg-white dark:bg-slate-900 rounded-2xl lg:rounded-[1.5rem] border-4 border-slate-100 dark:border-slate-800 p-5 lg:p-6 shadow-sm hover:shadow-xl transition-all duration-500 group ${onRowClick ? 'cursor-pointer hover:translate-x-2' : ''}`}
          onClick={() => onRowClick?.(row)}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
              {columns.map((col, idx) => (
                <div key={idx} className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
                    {getIconForKey(col.key)} {col.header}
                  </div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] || 'â€”')}
                  </div>
                </div>
              ))}
            </div>
            {actions.length > 0 && (
              <div className="flex items-center lg:justify-end gap-3 pt-6 lg:pt-0 border-t-2 lg:border-t-0 border-slate-50 dark:border-slate-800/50">
                {actions.map((action, actionIndex) => (
                  <motion.button
                    key={actionIndex}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                    className={`p-3.5 lg:p-3 rounded-xl shadow-sm transition-all duration-300 ${action.variant === 'danger' ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/40 hover:bg-rose-100' :
                      action.variant === 'success' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 hover:bg-emerald-100' :
                        'bg-primary-50 text-primary-700 dark:text-primary-500 dark:bg-primary-950/40 hover:bg-primary-100'
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 px-4 sm:px-0">
      {currentData.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -10, scale: 1.02 }}
          className={`relative bg-white dark:bg-slate-900 rounded-[2.5rem] border-4 border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden ${onRowClick ? 'cursor-pointer' : ''}`}
          onClick={() => onRowClick?.(row)}
        >
          {/* Card Decorations */}
          <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-gradient-to-br from-primary-500/10 to-primary-500/10 rounded-bl-[4rem] group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Hero Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-500 p-0.5 shadow-xl group-hover:rotate-6 transition-transform duration-500">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-2xl italic">
                  {(row.name || row[columns[0]?.key] || 'U')[0]}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white truncate">
                  {row.name || row[columns[0]?.key] || 'Unknown Object'}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{row.status || 'Active'}</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-4 py-2">
              {columns.slice(1, 4).map((col, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {getIconForKey(col.key)} {col.header}
                  </div>
                  <div className="text-[10px] font-black text-slate-800 dark:text-slate-200 text-right truncate max-w-[140px]">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] || 'â€”')}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Bar */}
            {actions.length > 0 && (
              <div className="flex items-center justify-center gap-4 pt-6 border-t-2 border-slate-50 dark:border-slate-800 group-hover:border-primary-500/20 transition-all">
                {actions.map((action, actionIndex) => (
                  <motion.button
                    key={actionIndex}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                    className={`p-4 lg:p-3 rounded-xl transition-all duration-500 ${action.variant === 'danger' ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 hover:bg-rose-100' :
                      'bg-slate-50 text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:text-primary-500 dark:bg-slate-800 hover:bg-slate-100 shadow-sm'
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
    <div className={`space-y-10 ${className}`}>
      {/* Header Controls (View Toggle & Density) */}
      {(showViewToggle || showPagination) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          {showViewToggle && (
            <div className="p-2 bg-slate-100/50 dark:bg-slate-800/40 rounded-[1.25rem] lg:rounded-2xl border-2 border-slate-200/40 dark:border-slate-700/40 shadow-sm backdrop-blur-sm w-full sm:w-auto">
              <ViewToggle
                currentView={currentViewState}
                onViewChange={handleViewChange}
                views={viewModes}
              />
            </div>
          )}

          {showPagination && (
            <div className="px-5 py-3 lg:py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[1.25rem] lg:rounded-2xl shadow-sm flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest font-outfit">Show Units</span>
              <select
                value={itemsPerPageState}
                onChange={handleItemsPerPageChange}
                className="bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer focus:text-primary-700 dark:text-primary-500 transition-colors font-outfit"
              >
                {[5, 10, 20, 50].map(v => <option key={v} value={v} className="bg-slate-900">{v}</option>)}
              </select>
            </div>
          )}
        </motion.div>
      )}

      {/* Primary Display Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loading size="lg" message="Accessing Archive..." />
          </motion.div>
        ) : data.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-slate-50/50 dark:bg-slate-800/10 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800/50"
          >
            <div className="p-10 bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl border-b-8 border-slate-100 dark:border-slate-700 mb-8">
              <Layers className="w-16 h-16 text-slate-200 dark:text-slate-700" />
            </div>
            <p className="text-xs font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] font-outfit">{emptyMessage}</p>
          </motion.div>
        ) : (
          <motion.div
            key={currentViewState}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
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

