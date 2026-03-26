import React from 'react';

const Badge = ({
  text,
  variant = 'default',
  size = 'medium',
  className = '',
  rounded = true,
  ...props
}) => {
  const getBadgeClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold text-center';
    
    const sizeClasses = {
      small: 'px-2 py-1 text-xs min-h-[20px]',
      medium: 'px-3 py-1 text-sm min-h-[24px]',
      large: 'px-4 py-2 text-base min-h-[28px]',
    };

    const variantClasses = {
      default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600',
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-purple-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-cyan-500 text-white',
    };

    const borderRadiusClasses = rounded ? 'rounded-full' : 'rounded-md';

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${borderRadiusClasses} ${className}`;
  };

  return (
    <span className={getBadgeClasses()} {...props}>
      {text}
    </span>
  );
};

export default Badge;
