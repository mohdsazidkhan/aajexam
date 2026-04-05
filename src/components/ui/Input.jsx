'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleAlert, CircleCheck, ChevronRight, Info } from 'lucide-react';

/**
 * Input - A friendly, Duolingo-inspired 3D input field for the gamified learning experience.
 */
const Input = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  type = 'text',
  multiline = false,
  rows = 3,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  required = false,
  size = 'md',
  className = '',
  variant = 'white', // white, glass, stealth
  whileHover,
  whileTap,
  initial,
  animate,
  transition,
  exit,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerSizes = {
    sm: 'px-4 py-2.5 min-h-[44px] text-xs',
    lg: 'px-5 py-4 min-h-[56px] text-sm',
    lg: 'px-6 py-5 min-h-[64px] text-base',
  };

  const variants = {
    white: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus-within:shadow-duo-primary',
    glass: 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-xl focus-within:bg-white/70 dark:focus-within:bg-slate-800/70',
    stealth: 'bg-slate-100 dark:bg-slate-800/30 border-transparent focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-primary-500/20',
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className={`space-y-2 mb-6 group ${disabled ? 'opacity-50' : ''}`}>
      {label && (
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400 pl-4">
          {label}
          {required && <span className="text-rose-500 ml-1 select-none">REQUIRED</span>}
        </label>
      )}

      <div
        className={`
          flex items-center gap-4 transition-all duration-300 relative border-b-[4px]
          ${radii['2xl']} 
          ${variants[variant]} 
          ${isFocused ? 'scale-[1.01] -translate-y-1' : ''}
          ${error ? 'border-rose-500/20 ring-4 ring-rose-500/5' : ''}
          ${isFocused ? 'border-primary-500' : 'border-slate-200 dark:border-slate-800'}
          rounded-2xl border-2
        `}
      >
        {LeftIcon && (
          <div className={`transition-colors duration-300 ${isFocused ? 'text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400'}`}>
            <LeftIcon className="w-5 h-5 ml-1" />
          </div>
        )}

        <div className="flex-1 flex flex-col pt-1">
          {multiline ? (
            <textarea
              className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none py-3 resize-none font-bold uppercase tracking-tight"
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              rows={rows}
              {...props}
            />
          ) : (
            <input
              type={type}
              className={`
                flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-bold uppercase tracking-tight
                ${containerSizes[size]}
              `}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              {...props}
            />
          )}
        </div>

        <div className="flex items-center gap-2 pr-1">
          {error && <CircleAlert className="w-5 h-5 text-rose-500 animate-pulse" />}
          {!error && value && isFocused && <CircleCheck className="w-5 h-5 text-emerald-500" />}

          {RightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400 transition-all active:scale-95"
              disabled={!onRightIconClick}
            >
              <RightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 px-4"
          >
            {error ? (
              <CircleAlert className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Info className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            )}
            <p className={`text-[10px] font-black uppercase tracking-widest ${error ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}>
              {error || helperText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const radii = {
  '2xl': 'rounded-[1.5rem]',
};

export default Input;

