'use client';

import React, { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { CircleAlert, CircleCheck, ChevronRight, Info } from 'lucide-react';
import useTranslate from '../../../hooks/useTranslate';

/**
 * Input - A friendly, AajExam-inspired 3D input field for the gamified learning experience.
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
  const { translate } = useTranslate();
  const [isFocused, setIsFocused] = useState(false);

  const containerSizes = {
    sm: 'px-3 py-2 min-h-[40px] text-sm',
    md: 'px-3 py-2.5 min-h-[48px] text-base',
    lg: 'px-4 py-3 min-h-[56px] text-base',
    xl: 'px-4 py-4 min-h-[64px] text-base',
  };

  const variants = {
    white: 'bg-background-surface border-border-primary',
    glass: 'bg-background-surface border-border-primary',
    stealth: 'bg-background-surface-secondary border-transparent',
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className={`space-y-2 mb-6 group ${disabled ? 'opacity-50' : ''}`}>
      {label && (
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-content-secondary">
          {label}
          {required && <span className="text-black dark:text-white ml-1 select-none">{translate('REQUIRED')}</span>}
        </label>
      )}

      <div
        className={`
          flex items-center gap-3 px-1 transition-colors duration-150 relative border rounded-xl
          ${variants[variant]}
          ${error ? '!border-red-500' : isFocused ? '!border-primary-600 ring-2 ring-primary-600/20' : ''}
        `}
      >
        {LeftIcon && (
          <div className={`transition-colors duration-300 ${isFocused ? 'text-primary-600' : 'text-content-muted'}`}>
            <LeftIcon className="w-5 h-5 ml-2" />
          </div>
        )}

        <div className="flex-1 flex flex-col pt-1">
          {multiline ? (
            <textarea
              className="flex-1 bg-transparent text-content-primary placeholder-content-muted focus:outline-none px-3 py-3 resize-none font-medium"
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
 flex-1 bg-transparent text-content-primary placeholder-content-muted focus:outline-none font-medium
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
          {error && <CircleAlert className="w-5 h-5 text-red-500" />}
          {!error && value && isFocused && <CircleCheck className="w-5 h-5 text-primary-600" />}

          {RightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="p-2 text-content-muted hover:text-primary-600 dark:hover:text-primary-600 transition-all active:scale-95"
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
            className="flex items-center gap-2"
          >
            {error ? (
              <CircleAlert className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Info className="w-3.5 h-3.5 text-content-muted" />
            )}
            <p className={`text-xs font-medium ${error ? 'text-red-500' : 'text-content-muted'}`}>
              {error || helperText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;

