import { FaList, FaTh, FaTable } from 'react-icons/fa';
import useTranslate from '../hooks/useTranslate';

const ViewToggle = ({ currentView, onViewChange, views = ['table', 'list', 'grid'], fullWidth = false }) => {
  const { translate } = useTranslate();
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
    <div className={`flex items-center gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {views.map((view) => {
        const Icon = viewIcons[view];
        const isActive = currentView === view;

        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            title={translate('{view} View', { view: translate(viewLabels[view]) })}
            className={`${fullWidth ? 'flex-1 flex items-center justify-center gap-1.5' : ''} p-2 rounded-lg transition-all ${isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
          >
            <Icon className="w-4 h-4" />
            {fullWidth && <span className="text-[9px] font-black uppercase tracking-widest">{translate(viewLabels[view])}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle;
