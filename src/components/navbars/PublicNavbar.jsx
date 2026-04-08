'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import {
  Sun,
  Moon,
  Compass,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useClientSide } from '../../hooks/useClientSide';
import { toggleDarkMode, initializeDarkMode } from '../../store/darkModeSlice';
import Button from '../ui/Button';

const PublicNavbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isClient = useClientSide();
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isClient) {
      dispatch(initializeDarkMode());
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isClient, dispatch]);

  const toggleTheme = () => dispatch(toggleDarkMode());

  const navLinks = [
    { label: 'Home', href: '/', icon: Compass },
    { label: 'Govt Exams', href: '/govt-exams-preparation', icon: ShieldCheck },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 pointer-events-none ${scrolled
          ? 'py-2.5 bg-white dark:bg-slate-950 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-xl'
          : 'py-2 lg:py-4 bg-white dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm'
          }`}
      >
        <div className="container mx-auto px-3 lg:px-6 pointer-events-auto">
          <div className="flex items-center justify-between">

            {/* --- Logo --- */}
            <Link href="/" className="flex gap-2 group items-center relative z-10">
              <div className="absolute -inset-2 bg-primary-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tighter relative text-slate-900 dark:text-white">
                AAJ<span className="text-primary-700 dark:text-primary-500 text-glow-primary">EXAM</span>
              </span>
            </Link>

            {/* --- Desktop Navigation --- */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-center">
              <div className="flex items-center gap-1 bg-slate-100/60 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-700/30 backdrop-blur-md">
                {navLinks.map((link) => {
                  const isActive = router.pathname === link.href;
                  return (
                    <Link key={link.href} href={link.href}>
                      <button className={`relative px-5 py-2.5 rounded-xl text-sm font-black tracking-[0.08em] transition-all group ${isActive ? 'text-primary-700 dark:text-primary-500' : 'text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400'}`}>
                        {isActive && (
                          <motion.div layoutId="nav-glow" className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50" />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          {link.label}
                        </span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* --- Actions --- */}
            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 border border-slate-200/30 dark:border-slate-700/30 shadow-sm transition-all"
              >
                {darkMode ? <Sun className="w-5" /> : <Moon className="w-5" />}
              </button>

              <Link href="/login">
                <Button variant="primary" size="sm" className="px-6 py-2 sm:py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs">Join</Button>
              </Link>
            </div>
          </div>
        </div>

      </nav>
    </>
  );
};

export default PublicNavbar;

