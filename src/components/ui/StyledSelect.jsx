'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

/**
 * Local-options dropdown matching SearchableDropdown's visual language
 * (used by the student city picker), without the remote-fetch/search-debounce
 * behavior — admin filter dropdowns work off a small, already-known options list.
 */
const StyledSelect = ({
  icon: Icon,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      searchRef.current?.focus();
    }
  }, [isOpen]);

  const selected = options.find((o) => o.value === value);
  const filteredOptions = searchTerm
    ? options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 lg:px-4 py-2.5 rounded-lg lg:rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black shadow-sm transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer focus-within:border-primary-700'}`}
      >
        {Icon && <Icon className="w-4 h-4 text-primary-600 shrink-0" />}
        <span className={`flex-1 truncate text-[10px] font-black uppercase tracking-widest ${selected ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-50 dark:bg-black border-2 border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl shadow-sm overflow-hidden">
          <div className="relative border-b-2 border-slate-200 dark:border-slate-800 p-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-1.5 bg-transparent outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>
          <ul className="py-1 max-h-52 overflow-y-auto">
            {filteredOptions.length > 0 ? filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors ${option.value === value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                {option.label}
              </li>
            )) : (
              <li className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StyledSelect;
