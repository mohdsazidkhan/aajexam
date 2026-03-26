import { FaSearch, FaTimes } from 'react-icons/fa';

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
    <div className="w-full lg:w-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-0">
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-8 sm:pl-10 md:pl-12 pr-3 sm:pr-4 md:pr-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base md:text-lg transition-all duration-200"
            />
          </div>
        </div>

        {/* Filters */}
        {Object.keys(filterOptions).length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            {Object.entries(filterOptions).map(([key, options]) => (
              <select
                key={key}
                value={filters[key] || ''}
                onChange={(e) => onFilterChange(key, e.target.value)}
                className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 max-w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-lg md:text-base transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              >
                <option value="">{options.label || key}</option>
                {options.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 sm:space-x-2 px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 text-xs sm:text-lg md:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-all duration-200 hover:scale-105"
          >
            <FaTimes className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
