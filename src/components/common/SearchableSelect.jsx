'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import useTranslate from '../../hooks/useTranslate';

// Local-options twin of SearchableDropdown (the state / city picker on Settings): same type-to-search
// input, chevron and option list, but the options are already known so nothing is fetched.
// `options` is [{ value, label }]; `prefix` is an optional small caption shown before the value.
const SearchableSelect = ({ value, onChange, options = [], placeholder = 'Search...', icon: Icon, prefix, className = '' }) => {
  const { translate } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const selected = options.find((o) => o.value === value);
  const term = searchTerm.trim().toLowerCase();
  const filtered = term ? options.filter((o) => String(o.label).toLowerCase().includes(term)) : options;

  const open = () => { setIsOpen(true); setSearchTerm(''); };
  const pick = (o) => { onChange(o.value); setIsOpen(false); };

  return (
    <div className="relative w-full min-w-0" ref={ref}>
      <div
        className={`flex items-center gap-2 w-full h-10 px-3 text-sm rounded-xl border border-border-primary bg-background-surface-secondary text-content-primary focus-within:border-primary-700 transition-all cursor-text ${className}`}
        onClick={!isOpen ? open : undefined}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0 text-primary-600" />}
        {prefix && <span className="hidden sm:inline shrink-0 text-[10px] font-bold uppercase tracking-wide text-primary-600 whitespace-nowrap">{prefix}</span>}
        <input
          type="text"
          className="w-full min-w-0 bg-transparent outline-none border-none p-0 font-bold truncate placeholder:text-content-muted"
          placeholder={placeholder}
          value={isOpen ? searchTerm : (selected?.label || '')}
          onChange={(e) => { setSearchTerm(e.target.value); if (!isOpen) setIsOpen(true); }}
          onFocus={() => { if (!isOpen) open(); }}
        />
        <button type="button" aria-label={translate('Search...')} onClick={() => (isOpen ? setIsOpen(false) : open())} className="shrink-0 text-content-muted">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full min-w-[240px] max-w-[85vw] mt-1 border border-border-primary rounded-2xl max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            <ul className="py-1">
              {filtered.map((o) => (
                <li
                  key={o.value}
                  className={`px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors ${o.value === value ? 'text-primary-600' : 'text-content-secondary hover:bg-background-surface-secondary'}`}
                  onClick={() => pick(o)}
                >
                  {o.label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm font-semibold text-content-muted">{translate('No results found')}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
