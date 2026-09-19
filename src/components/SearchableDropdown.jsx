'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import API from '../lib/api';

const SearchableDropdown = ({
  value,
  onChange,
  type,
  placeholder = 'Search...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearchTerm(value || '');
  }, [value, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      try {
        setLoading(true);
        const res = await API.request(`/api/locations?type=${type}&search=${encodeURIComponent(searchTerm)}`);
        if (res.success) setOptions(res.data || []);
      } catch (err) {
        console.error(`Failed to fetch ${type}:`, err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(fetchOptions, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, type, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setSearchTerm('');
  };

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`flex items-center justify-between w-full px-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800/20 focus-within:border-primary-700 focus-within:bg-primary-500/5 transition-all cursor-text ${className}`}
        onClick={!isOpen ? handleOpen : undefined}
      >
        <input
          type="text"
          className="w-full bg-transparent outline-none border-none p-0 font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
          placeholder={placeholder}
          value={isOpen ? searchTerm : (value || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => { if (!isOpen) handleOpen(); }}
        />
        <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
          {value && (
            <button type="button" onClick={handleClear} className="hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={() => setIsOpen(!isOpen)}>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm font-semibold text-slate-400">Loading...</div>
          ) : options.length > 0 ? (
            <ul className="py-1">
              {options.map((option, idx) => (
                <li
                  key={idx}
                  className={`px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors ${value === option ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm font-semibold text-slate-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
