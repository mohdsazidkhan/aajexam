'use client';

import { useState, useEffect } from 'react';
import API from '../lib/api';
import Link from 'next/link';
import Loading from './Loading';
import {
  Trophy,
  Target,
  Users,
  ArrowRight,
  Star,
  Lock,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const LevelsShowcase = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.getPublicLevels();
      if (response.success) {
        setLevels(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load levels');
      console.error('Error loading levels:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-content-secondary">Loading Levels</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border-2 border-rose-100 dark:border-rose-900/30">
        <p className="text-sm font-black text-rose-500 uppercase tracking-widest leading-relaxed mb-6">{error}</p>
        <button
          onClick={fetchLevels}
          className="px-8 py-3 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-duo hover:translate-y-1 transition-all"
        >
          RETRY_CONNECTION
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="py-12 space-y-12 font-outfit">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-background-surface-secondary border border-border-primary/50">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          <span className="text-[10px] font-black text-content-secondary uppercase tracking-widest">Global Difficulty Matrix</span>
        </div>
        <h2 className="text-2xl lg:text-5xl font-black text-content-primary uppercase tracking-tighter">
          Master the Path
        </h2>
        <p className="text-sm font-bold text-content-secondary dark:text-slate-500 max-w-lg mx-auto uppercase tracking-widest leading-relaxed">
          Unlock {levels.length} sectors of intellectual dominance. Each level represents a new threshold of mastery.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4"
      >
        {levels.map((level) => (
          <motion.div
            key={level.levelNumber}
            variants={itemVariants}
            whileHover={{ y: -8 }}
            className={`group bg-background-surface rounded-[2.5rem] border-2 border-b-10 border-border-primary transition-all relative overflow-hidden`}
            style={{
              borderColor: level.color || '#4c97ff',
              boxShadow: `0 8px 0 0 ${level.color}33`,
            }}
          >
            {/* Header Glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-white/20" />

            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-20 h-20 rounded-3xl bg-background-surface-secondary flex items-center justify-center text-5xl shadow-inner border-2 border-border-primary/50">
                  {level.emoji}
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1">Sector</p>
                  <p className="text-md md:text-xl lg:text-2xl font-black text-content-primary font-outfit uppercase">#{level.levelNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-md md:text-xl lg:text-2xl font-black text-content-primary uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                  {level.name}
                </h3>
                <p className="text-[10px] font-bold text-content-secondary dark:text-slate-500 uppercase tracking-widest leading-relaxed line-clamp-2">
                  {level.description}
                </p>
              </div>

              <div className="flex items-center gap-4 py-4 border-y-2 border-border-primary/50">
                <div className="flex-1">
                  <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1">Target</p>
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-primary-600" />
                    <span className="text-xs font-black text-content-secondary font-outfit uppercase">{level.quizzesRequired} Quizzes</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1">Population</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-primary-600" />
                    <span className="text-xs font-black text-content-secondary font-outfit uppercase">{level.userCount?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center gap-2 ${level.requiredSubscription === 'free' ? 'bg-slate-100 text-slate-700 dark:text-slate-400 dark:bg-slate-700' :
                  level.requiredSubscription === 'pro' ? 'bg-primary-500 text-white' :
                    'bg-primary-500 text-white'
                  }`}>
                  {level.requiredSubscription === 'free' ? <Lock className="w-2.5 h-2.5 opacity-50" /> : <Star className="w-2.5 h-2.5 fill-current" />}
                  {level.requiredSubscription} Access
                </div>

                <Link href={`/levels/${level.levelNumber}`}>
                  <div className="flex items-center gap-2 text-slate-300 dark:text-slate-600 group/btn cursor-pointer">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-all">DECODE</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover/btn:bg-primary-500 group-hover/btn:text-white transition-all shadow-duo">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Decorative background number */}
            <span className="absolute -bottom-8 -right-8 text-9xl font-black text-slate-900/5 dark:text-white/5 pointer-events-none group-hover:scale-110 transition-transform">
              {level.levelNumber}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default LevelsShowcase;



