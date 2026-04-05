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
    <div className="flex items-center justify-center p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[1.8rem] border-2 border-slate-200 dark:border-slate-800 shadow-inner">
      {views.map((view) => {
        const Icon = viewIcons[view];
        const isActive = currentView === view;

        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 ${isActive
                ? 'bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-500 shadow-duo border-b-2 border-slate-100 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            title={`${viewLabels[view]} View`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{viewLabels[view]}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle;
