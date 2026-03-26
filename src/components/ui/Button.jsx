import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  gradientColors,
  fullWidth = false,
  type = 'button',
  ...props
}) => {
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
      small: 'px-3 py-2 text-sm min-h-[36px]',
      medium: 'px-4 py-3 text-base min-h-[44px]',
      large: 'px-6 py-4 text-lg min-h-[52px]',
    };

    const variantClasses = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
      secondary: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
      outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
      ghost: 'text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
      gradient: 'text-white focus:ring-blue-500',
      admin: 'bg-gradient-to-r from-yellow-500 to-red-500 text-white dark:from-yellow-600 dark:to-red-700 hover:opacity-90 transition-all duration-200 focus:ring-yellow-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`;
  };

  const getGradientStyle = () => {
    if (variant === 'gradient' && gradientColors) {
      return {
        background: `linear-gradient(135deg, ${gradientColors.join(', ')})`,
      };
    }
    return {};
  };

  const getIconSize = () => {
    const sizeMap = {
      small: 'w-4 h-4',
      medium: 'w-5 h-5',
      large: 'w-6 h-6',
    };
    return sizeMap[size];
  };

  const getSpacingClasses = () => {
    return iconPosition === 'left' ? 'mr-2' : 'ml-2';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <svg className={`animate-spin ${getIconSize()} mr-2`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      );
    }

    const iconElement = icon && (
      <span className={`${getIconSize()} ${getSpacingClasses()}`}>
        {icon}
      </span>
    );

    return (
      <>
        {iconPosition === 'left' && iconElement}
        {children}
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  if (variant === 'gradient') {
    const defaultGradientColors = gradientColors || ['#3B82F6', '#8B5CF6'];

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={getButtonClasses()}
        style={getGradientStyle()}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={getButtonClasses()}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
