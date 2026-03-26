import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  titleClassName = '',
  animationType = 'fade',
  ...props
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getModalSizeClasses = () => {
    const sizeClasses = {
      small: 'w-11/12 max-w-md',
      medium: 'w-11/12 max-w-lg',
      large: 'w-11/12 max-w-2xl',
      fullscreen: 'w-full h-full max-w-none max-h-none',
    };
    return sizeClasses[size];
  };

  const getModalClasses = () => {
    const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl shadow-2xl';
    const sizeClasses = getModalSizeClasses();
    const animationClasses = animationType === 'slide' ? 'animate-slide-in' : 'animate-fade-in';
    
    return `${baseClasses} ${sizeClasses} ${animationClasses} ${className}`;
  };

  const getHeaderClasses = () => {
    return 'flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700';
  };

  const getTitleClasses = () => {
    return `text-lg font-bold text-gray-900 dark:text-white flex-1 ${titleClassName}`;
  };

  const getContentClasses = () => {
    return 'p-6 max-h-96 overflow-y-auto';
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className="fixed inset-0"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      <div className={getModalClasses()} {...props}>
        {(title || showCloseButton) && (
          <div className={getHeaderClasses()}>
            {title && <h2 className={getTitleClasses()}>{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        <div className={getContentClasses()}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
