import { FaList, FaTh, FaTable } from 'react-icons/fa';

const ViewToggle = ({ currentView, onViewChange, views = ['table', 'list', 'grid'] }) => {
  const viewIcons = {
    table: FaTable,
    list: FaList,
    grid: FaTh
  };

  const viewLabels = {
    table: 'Table',
    list: 'List',
    grid: 'Grid'
  };

  return (
    <div className="flex items-center justify-center space-x-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
      {views.map((view) => {
        const Icon = viewIcons[view];
        const isActive = currentView === view;

        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-md text-xs sm:text-lg md:text-base font-medium transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-red-500 to-primary-500 text-white shadow-sm scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
              }`}
            title={`${viewLabels[view]} View`}
          >
            <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline text-xs sm:text-lg md:text-base">{viewLabels[view]}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle;
