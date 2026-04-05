'use client';

import React from 'react';
import { useRouter } from 'next/router';
import {
  X,
  Book,
  HelpCircle,
  PenTool,
  ArrowRight,
  Zap,
  Sparkles,
  Plus,
  PlusCircle,
  Layers,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import Card from './ui/Card';
import Button from './ui/Button';

const CreateActionModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const actions = [
    {
      title: 'Synthesize Quiz',
      desc: 'Architect a 10-unit knowledge evaluation',
      icon: Layers,
      color: 'secondary',
      path: '/pro/quiz/create',
      gradient: 'from-primary-500/20 to-primary-500/5'
    },
    {
      title: 'Broadcast Question',
      desc: 'Share a high-yield Question with the academy',
      icon: HelpCircle,
      color: 'primary',
      path: '/pro/questions/new',
      gradient: 'from-primary-500/20 to-primary-500/5'
    },
    {
      title: 'Publish Journal',
      desc: 'Synthesize a deep-dive knowledge article',
      icon: FileText,
      color: 'emerald',
      path: '/pro/create-blog',
      gradient: 'from-emerald-500/20 to-emerald-500/5'
    }
  ];

  const handleAction = (path) => {
    onClose?.();
    router.push(path);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        />

        {/* Modal / Bottom Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[3.5rem] lg:rounded-[3.5rem] overflow-hidden shadow-2xl border-t-8 lg:border-4 lg:border-b-[12px] border-slate-200 dark:border-slate-800 p-10 space-y-10"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">New Creation</h3>
              <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">Select protocol to initiate contribution</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:text-primary-700 dark:text-primary-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Action List */}
          <div className="space-y-4">
            {actions.map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(action.path)}
                className={`w-full group relative overflow-hidden flex items-center gap-6 p-6 rounded-[2rem] border-2 border-slate-200/50 dark:border-slate-800/30 bg-white dark:bg-slate-800/50 hover:border-${action.color}-500/30 transition-all text-left shadow-sm`}
              >
                <div className={`p-4 bg-${action.color}-500 text-white rounded-2xl shadow-duo-${action.color === 'emerald' ? 'secondary' : action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-primary-700 dark:text-primary-500 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest line-clamp-1 opacity-75">
                    {action.desc}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-primary-700 dark:text-primary-500 group-hover:translate-x-2 transition-all" />

                {/* Glass Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
              </motion.button>
            ))}
          </div>

          <div className="pt-2 text-center">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] font-mono">* CONTRIBUTIONS ARE SUBJECT TO ACADEMY VERIFICATION</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateActionModal;


