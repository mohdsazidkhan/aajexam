'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import API from '../../lib/api';

// Email/name search-as-you-type user picker. `multiple` controls whether
// `value`/`onChange` deal in a single user object or an array of them.
const UserSearchPicker = ({ multiple = false, value, onChange, placeholder = 'Search by name or email...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selected = multiple ? (value || []) : (value ? [value] : []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await API.getAdminStudents({ search: query.trim(), limit: 10 });
        setResults(res?.students || []);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const isSelected = (u) => selected.some((s) => s._id === u._id);

  const handleSelect = (u) => {
    if (multiple) {
      if (!isSelected(u)) onChange([...selected, u]);
    } else {
      onChange(u);
      setIsOpen(false);
    }
    setQuery('');
  };

  const handleRemove = (u) => {
    if (multiple) onChange(selected.filter((s) => s._id !== u._id));
    else onChange(null);
  };

  const showSingleSelected = !multiple && value;

  return (
    <div ref={ref} className="relative">
      {showSingleSelected ? (
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg xl:rounded-xl bg-slate-50 dark:bg-black">
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{value.name}</div>
            <div className="text-xs text-slate-400 truncate">{value.email}</div>
          </div>
          <button type="button" onClick={() => handleRemove(value)} className="p-1 text-slate-400 hover:text-red-500 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => query && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg xl:rounded-xl text-sm font-bold bg-slate-50 dark:bg-black text-slate-900 dark:text-white outline-none focus:border-primary-600"
          />
        </div>
      )}

      {isOpen && !showSingleSelected && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg xl:rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-xs font-semibold text-slate-400">Searching...</div>
          ) : results.length > 0 ? (
            results.map((u) => (
              <button
                type="button"
                key={u._id}
                onClick={() => handleSelect(u)}
                disabled={multiple && isSelected(u)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.name}</div>
                <div className="text-xs text-slate-400 truncate">{u.email}</div>
              </button>
            ))
          ) : query.trim() ? (
            <div className="p-3 text-center text-xs font-semibold text-slate-400">No users found</div>
          ) : null}
        </div>
      )}

      {multiple && selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((u) => (
            <span key={u._id} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold">
              {u.email}
              <button type="button" onClick={() => handleRemove(u)} className="p-0.5 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearchPicker;
