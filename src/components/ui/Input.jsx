import React, { useState } from 'react';

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
  rows = 1,
  leftIcon,
  rightIcon,
  onRightIconClick,
  required = false,
  size = 'medium',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerClasses = () => {
    return 'mb-4';
  };

  const getInputContainerClasses = () => {
    const baseClasses = 'relative flex items-center border-2 rounded-xl bg-white dark:bg-gray-800 transition-all duration-200';
    
    const sizeClasses = {
      small: 'px-3 py-2 min-h-[40px]',
      medium: 'px-4 py-3 min-h-[48px]',
      large: 'px-5 py-4 min-h-[56px]',
    };

    const stateClasses = error
      ? 'border-red-500 focus-within:border-red-500'
      : isFocused
        ? 'border-blue-500 focus-within:border-blue-500'
        : 'border-gray-300 dark:border-gray-600 focus-within:border-blue-500';

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${disabledClasses}`;
  };

  const getInputClasses = () => {
    const baseClasses = 'flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none';
    
    const sizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    };

    return `${baseClasses} ${sizeClasses[size]} ${className}`;
  };

  const getLabelClasses = () => {
    return 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2';
  };

  const getHelperTextClasses = () => {
    return 'text-xs text-gray-500 dark:text-gray-400 mt-1';
  };

  const getErrorTextClasses = () => {
    return 'text-xs text-red-500 mt-1';
  };

  const getIconSize = () => {
    const sizeMap = {
      small: 'w-4 h-4',
      medium: 'w-5 h-5',
      large: 'w-6 h-6',
    };
    return sizeMap[size];
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const renderInput = () => {
    if (multiline) {
      return (
        <textarea
          className={getInputClasses()}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          rows={rows}
          {...props}
        />
      );
    }

    return (
      <input
        type={type}
        className={getInputClasses()}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        {...props}
      />
    );
  };

  return (
    <div className={getContainerClasses()}>
      {label && (
        <label className={getLabelClasses()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={getInputContainerClasses()}>
        {leftIcon && (
          <div className="mr-3 text-gray-400 dark:text-gray-500">
            <span className={getIconSize()}>{leftIcon}</span>
          </div>
        )}
        
        {renderInput()}
        
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="ml-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            disabled={!onRightIconClick}
          >
            <span className={getIconSize()}>{rightIcon}</span>
          </button>
        )}
      </div>
      
      {error && (
        <p className={getErrorTextClasses()}>{error}</p>
      )}
      
      {helperText && !error && (
        <p className={getHelperTextClasses()}>{helperText}</p>
      )}
    </div>
  );
};

export default Input;
