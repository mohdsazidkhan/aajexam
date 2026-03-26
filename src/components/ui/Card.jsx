import React from 'react';

const Card = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  gradientColors,
  padding = 'medium',
  borderRadius = 'medium',
  shadow = true,
  ...props
}) => {
  const getCardClasses = () => {
    const baseClasses = 'bg-white dark:bg-gray-800 transition-all duration-200';

    const paddingClasses = {
      none: '',
      small: 'p-3',
      medium: 'p-4',
      large: 'p-6',
    };

    const borderRadiusClasses = {
      none: '',
      small: 'rounded-lg',
      medium: 'rounded-xl',
      large: 'rounded-2xl',
    };

    const variantClasses = {
      default: 'border border-gray-200 dark:border-gray-700',
      elevated: shadow ? 'shadow-lg hover:shadow-xl' : '',
      outlined: 'border-2 border-gray-300 dark:border-gray-600',
      gradient: '',
    };

    const interactiveClasses = onClick ? 'cursor-pointer hover:scale-105' : '';

    return `${baseClasses} ${paddingClasses[padding]} ${borderRadiusClasses[borderRadius]} ${variantClasses[variant]} ${interactiveClasses} ${className}`;
  };

  const getGradientStyle = () => {
    if (variant === 'gradient' && gradientColors) {
      return {
        background: `linear-gradient(135deg, ${gradientColors.join(', ')})`,
      };
    }
    return {};
  };

  const getGradientClasses = () => {
    if (variant === 'gradient' && !gradientColors) {
      return 'bg-gradient-to-br from-blue-500 from-red-600';
    }
    return '';
  };

  const cardClasses = `${getCardClasses()} ${getGradientClasses()}`;

  if (onClick) {
    return (
      <div
        className={cardClasses}
        style={getGradientStyle()}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cardClasses}
      style={getGradientStyle()}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
