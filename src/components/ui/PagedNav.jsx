import useTranslate from '../../hooks/useTranslate';

// Page list with ellipses: 1 … 4 5 [6] 7 8 … 19
const getPageItems = (page, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) items.push('gap-start');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push('gap-end');
  items.push(total);
  return items;
};

const navBtn = 'px-4 xl:px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg xl:rounded-xl text-sm font-black disabled:opacity-30';

const PagedNav = ({ page, totalPages, onChange }) => {
  const { translate } = useTranslate();
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3 pt-6">
      <div className="flex flex-wrap justify-center items-center gap-1.5 xl:gap-2">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className={navBtn}>{translate('Prev')}</button>
        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="px-1 text-sm font-black text-slate-400">…</span>
          ) : (
            <button
              key={item}
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`min-w-9 xl:min-w-10 h-9 xl:h-10 px-2 rounded-lg xl:rounded-xl text-sm font-black tabular-nums border-2 transition-colors ${
                item === page
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-600'
              }`}
            >
              {item}
            </button>
          )
        )}
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className={navBtn}>{translate('Next')}</button>
      </div>
      <span className="text-xs font-black text-slate-500">{translate('Page {page} of {total}', { page, total: totalPages })}</span>
    </nav>
  );
};

export default PagedNav;
