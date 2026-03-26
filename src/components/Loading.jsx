'use client';

import React from 'react';

/**
 * Common Loading Component
 * Simple, reusable loading spinner for all pages and components
 * 
 * @param {Object} props
 * @param {string} props.size - Size: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.message - Loading message (default: 'Loading...')
 * @param {string} props.color - Color: 'yellow', 'blue', 'gray' (default: 'yellow')
 * @param {boolean} props.fullScreen - Full screen mode (default: false)
 */
const Loading = ({
  size = 'sm',
  message = 'Loading...',
  color = 'yellow',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-b-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-2',
  };

  const colorClasses = {
    yellow: 'border-primary-500 dark:border-primary-400',
    blue: 'border-secondary-500 dark:border-secondary-400',
    gray: 'border-gray-500 dark:border-gray-400',
  };

  const wrapperClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-subg-light dark:bg-subg-dark z-50'
    : 'flex items-center justify-center py-8';

  return (
    <div className={wrapperClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full mx-auto mb-4 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
        {message && <p className="text-gray-600 dark:text-gray-300 text-lg">{message}</p>}
      </div>
    </div>
  );
};

export default Loading;

