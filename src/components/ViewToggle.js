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
    <div className="flex items-center gap-1">
      {views.map((view) => {
        const Icon = viewIcons[view];
        const isActive = currentView === view;

        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            title={`${viewLabels[view]} View`}
            className={`p-2 rounded-lg transition-all ${isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle;
