'use client';

import React, { useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert } from 'lucide-react';
import Button from './Button';

/**
 * Modal - A friendly, AajExam-inspired 3D modal overlay for the gamified learning experience.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md', // sm, md, lg, xl, fullscreen
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  titleClassName = '',
  bodyClassName = 'p-5 xl:p-8 pt-5 xl:pt-6',
  headerClassName = 'p-5 xl:p-8 pb-4 xl:pb-5',
  bodyMaxHeight = 'max-h-[75vh]',
  animationType = 'spring',
  icon: Icon,
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

  const sizes = {
    sm: 'max-w-md w-[90vw]',
    xl: 'max-w-xl w-[95vw]',
    xl: 'max-w-3xl w-[95vw]',
    xl: 'max-w-5xl w-[95vw]',
    fullscreen: 'max-w-none w-full h-full rounded-none',
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.97,
      y: 12
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: animationType === 'spring' ? 'spring' : 'tween',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Cinematic Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50"
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
 relative bg-background-surface ${sizes[size]}
              ${size === 'fullscreen' ? 'rounded-none' : 'rounded-2xl xl:rounded-3xl'}
 border border-border-primary
              font-outfit overflow-hidden
              ${className}
            `}
            {...props}
          >
            {/* Header Stats */}
            {(title || showCloseButton) && (
              <header className={`z-auto flex items-center justify-between ${headerClassName} border-b border-border-primary`}>
                <div className="flex items-center gap-4">
                  {Icon && (
                    <div className="w-12 h-12 text-primary-600 rounded-md flex items-center justify-center border border-primary-600">
                      <Icon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1 text-left">
                    {title && <h2 className={`text-xl xl:text-2xl font-bold text-content-primary leading-tight ${titleClassName}`}>{title}</h2>}
                    {subtitle && <p className="text-sm font-medium text-content-secondary">{subtitle}</p>}
                  </div>
                </div>

                {showCloseButton && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClose}
                    className="!p-2.5"
                    icon={X}
                  />
                )}
              </header>
            )}

            {/* Modal Content */}
            <div className={`${bodyClassName} overflow-y-auto ${size === 'fullscreen' ? 'h-[calc(100vh-140px)]' : bodyMaxHeight}`}>
              {children}
            </div>

          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

