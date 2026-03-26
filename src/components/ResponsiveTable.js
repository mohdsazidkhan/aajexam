import React, { useState } from 'react';
import { FaList, FaTh, FaTable, FaEye, FaEdit, FaTrash, FaPhone, FaEnvelope } from 'react-icons/fa';
import Pagination from './Pagination';
import ViewToggle from './ViewToggle';

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
  searchTerm = '',
  onSearchChange = null,
  filters = {},
  onFilterChange = null,
  onClearFilters = null,
  filterOptions = {}
}) => {
  const [internalView, setInternalView] = useState(defaultView);
  const currentViewState = currentView !== null ? currentView : internalView;
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState, setItemsPerPage] = useState(itemsPerPage);

  // Calculate pagination - if pagination is disabled, show all data
  const totalItems = data.length;
  const totalPages = showPagination ? Math.ceil(totalItems / itemsPerPageState) : 1;
  const startIndex = showPagination ? (currentPage - 1) * itemsPerPageState : 0;
  const endIndex = showPagination ? startIndex + itemsPerPageState : totalItems;
  const currentData = showPagination ? data.slice(startIndex, endIndex) : data;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewChange = (view) => {
    if (currentView === null) {
      setInternalView(view);
    }
    setCurrentPage(1); // Reset to first page when changing view
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Render table view
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 py-4 sm:px-6 sm:py-5 text-left text-xs sm:text-lg md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600"
              >
                {column.header}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-4 py-4 sm:px-6 sm:py-5 text-left text-xs sm:text-lg md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {currentData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${onRowClick ? 'cursor-pointer' : ''
                }`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-lg md:text-base text-gray-900 dark:text-gray-100 whitespace-nowrap"
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-lg md:text-base text-gray-900 dark:text-gray-100">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                        className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md ${action.variant === 'danger'
                          ? 'text-primary-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-700'
                          : action.variant === 'success'
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-200 dark:border-green-700'
                            : 'text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-700'
                          }`}
                        title={action.label}
                      >
                        {action.icon}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div className="space-y-4 sm:space-y-5">
      {currentData.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 md:p-7 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${onRowClick ? 'cursor-pointer hover:scale-[1.02]' : ''
            }`}
          onClick={() => onRowClick && onRowClick(row)}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            {/* Main content */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {/* Row 1: Student Name and Joined Date in single row */}
                <div className="sm:col-span-1 col-span-2 grid grid-cols-2 gap-3 sm:block">
                  {/* Student Name */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs sm:text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Student
                      </span>
                      <div className="w-1 h-1 bg-secondary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <div className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-bold">
                      {columns.find(col => col.key === 'name')?.render?.(null, row) || row.name || 'Unknown'}
                    </div>
                  </div>

                  {/* Joined Date */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs sm:text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Joined
                      </span>
                      <div className="w-1 h-1 bg-secondary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <div className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium">
                      {columns.find(col => col.key === 'joined')?.render?.(null, row) || row.joined || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Row 2: Contact in single row */}
                <div className="sm:col-span-1 col-span-2">
                  <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs sm:text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Contact
                      </span>
                      <div className="w-1 h-1 bg-secondary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <div className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium">
                      {columns.find(col => col.key === 'contact')?.render?.(null, row) || row.email || 'No email'}
                    </div>
                  </div>
                </div>

                {/* Row 3: Level and Referral Code in single row */}
                <div className="sm:col-span-1 col-span-2 grid grid-cols-2 gap-3 sm:block">
                  {/* Level */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs sm:text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Level
                      </span>
                      <div className="w-1 h-1 bg-secondary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <div className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium">
                      {columns.find(col => col.key === 'level')?.render?.(null, row) || row.level?.currentLevel || '1'}
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs sm:text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Ref Code
                      </span>
                      <div className="w-1 h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <div className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium">
                      {columns.find(col => col.key === 'referralCode')?.render?.(null, row) || row.referralCode || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Row 4: Referral Count and Status in single row */}
                <div className="sm:col-span-1 col-span-2 grid grid-cols-2 gap-3 sm:block">
                  {/* Referral Count */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs sm:text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Ref Count
                      </span>
                      <div className="w-1 h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <div className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium">
                      {columns.find(col => col.key === 'referralCount')?.render?.(null, row) || row.referralCount || '0'}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs sm:text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Status
                      </span>
                      <div className="w-1 h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <div className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium">
                      {columns.find(col => col.key === 'status')?.render?.(null, row) || (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {row.status || 'active'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions */}
            {columns.some(col => col.key === 'actions') && (
              <div className="flex items-center justify-center lg:justify-end space-x-2 sm:space-x-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-200 dark:border-gray-600">
                {columns.find(col => col.key === 'actions')?.render?.(null, row)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6">
      {currentData.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 ${onRowClick ? 'cursor-pointer' : ''
            }`}
          onClick={() => onRowClick && onRowClick(row)}
        >
          {/* Card Header with gradient background */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-primary-50 dark:from-red-900/20 dark:to-primary-900/20 rounded-xl"></div>
            <div className="relative p-4 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-red-500 to-primary-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">
                  {row.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {row.name || 'Unknown'}
              </h3>
            </div>
          </div>

          {/* Card Content */}
          <div className="space-y-3 sm:space-y-4">
            {/* Joined Date-Time */}
            <div className="group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Joined
                </span>
                <div className="w-2 h-2 bg-secondary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {columns.find(col => col.key === 'joined')?.render?.(null, row) || row.joined || 'N/A'}
              </div>
            </div>
            {/* First row: Level and Referral Code */}
            <div className="grid grid-cols-2 gap-3">
              <div className="group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Level
                  </span>
                  <div className="w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {columns.find(col => col.key === 'level')?.render?.(null, row) || row.level?.currentLevel || '1'}
                </div>
              </div>

              <div className="group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Ref Code
                  </span>
                  <div className="w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {columns.find(col => col.key === 'referralCode')?.render?.(null, row) || row.referralCode || 'N/A'}
                </div>
              </div>
            </div>

            {/* Second row: Contact Info */}
            <div className="group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Contact
                </span>
                <div className="w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {columns.find(col => col.key === 'contact')?.render?.(null, row) || row.email || 'No email'}
              </div>
            </div>

            {/* Third row: Referral Count and Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Ref Count
                  </span>
                  <div className="w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {columns.find(col => col.key === 'referralCount')?.render?.(null, row) || row.referralCount || '0'}
                </div>
              </div>

              <div className="group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Status
                  </span>
                  <div className="w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
                <div className="mt-1">
                  {columns.find(col => col.key === 'status')?.render?.(null, row) || (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {row.status || 'active'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer with Actions */}
          {columns.some(col => col.key === 'actions') && (
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center space-x-2">
                {columns.find(col => col.key === 'actions')?.render?.(null, row)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      {/* Header with view toggle and items per page */}
      {(showViewToggle || showPagination) && (
        <div>
          <div className="flex items-center justify-between gap-4">
            {showViewToggle && (
              <div className="flex items-center gap-3">
                <ViewToggle
                  currentView={currentViewState}
                  onViewChange={handleViewChange}
                  views={viewModes}
                />
              </div>
            )}

            {/* Items per page selector */}
            {showPagination && (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <select
                  value={itemsPerPageState}
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      <div className="overflow-hidden">
        {currentViewState === 'table' && renderTableView()}
        {currentViewState === 'list' && <div>{renderListView()}</div>}
        {currentViewState === 'grid' && <div>{renderGridView()}</div>}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPageState}
          />
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable;
