'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert } from 'lucide-react';
import Button from './Button';

/**
 * Modal - A friendly, Duolingo-inspired 3D modal overlay for the gamified learning experience.
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
    lg: 'max-w-xl w-[95vw]',
    lg: 'max-w-3xl w-[95vw]',
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
      scale: 0.95,
      y: 20,
      rotateX: -10
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
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
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative bg-white dark:bg-slate-900 
              ${sizes[size]} 
              ${size === 'fullscreen' ? 'rounded-none' : 'rounded-[3rem] lg:rounded-[4.5rem]'} 
              border-2 border-slate-200 dark:border-slate-800 
              ${size === 'fullscreen' ? '' : 'border-b-[12px] shadow-2xl shadow-primary-500/10'} 
              transition-all duration-300 font-outfit overflow-hidden
              ${className}
            `}
            style={{ perspective: '1000px' }}
            {...props}
          >
            {/* Header Stats */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-10 lg:p-14 pb-6 lg:pb-8 border-b-2 border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-6">
                  {Icon && (
                    <div className="w-16 h-16 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[1.5rem] flex items-center justify-center border-2 border-primary-500/20">
                      <Icon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="space-y-1 text-left">
                    {title && <h2 className={`text-xl lg:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none ${titleClassName}`}>{title}</h2>}
                    {subtitle && <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400">{subtitle}</p>}
                  </div>
                </div>

                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="!p-3 border-b-4 hover:border-b-2 hover:translate-y-0.5"
                    icon={X}
                  />
                )}
              </div>
            )}

            {/* Modal Content */}
            <div className={`p-10 lg:p-14 pt-8 lg:pt-10 overflow-y-auto ${size === 'fullscreen' ? 'h-[calc(100vh-140px)]' : 'max-h-[75vh]'}`}>
              {children}
            </div>

            {/* Glowing Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

