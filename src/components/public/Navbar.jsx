'use client';

import React, { useEffect, useState } from 'react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { useDispatch } from 'react-redux';
import {
  Compass,
  Layers,
  ShieldCheck,
  MessageSquarePlus,
  BookOpen,
  Newspaper,
  GraduationCap,
  Gamepad2,
  FolderOpen,
  Sparkles,
  MessageCircleQuestion,
  X,
  Gift,
} from 'lucide-react';
import { m as motion } from 'framer-motion';

import { useClientSide } from '../../hooks/useClientSide';
import { initializeDarkMode } from '../../store/darkModeSlice';
import Button from '../common/ui/Button';
import ThemeColorMenuButton from '../common/ThemeColorMenuButton';
import useTranslate from '../../hooks/useTranslate';
import { usePromoBarVisible, dismissPromoBar } from '../../lib/freePromo';

// Red strip above the navbar while the free-PRO promo runs: static line on desktop, scrolling line on phones.
const PromoTopBar = () => {
  const { translate } = useTranslate();
  const text = translate('AajExam PRO is FREE now. Everything is FREE till 31 Dec 2026.');
  const gift = (
    <span className="shrink-0 w-5 h-5 rounded-full bg-white/20 ring-1 ring-white/40 flex items-center justify-center animate-pulse">
      <Gift className="w-3 h-3" />
    </span>
  );
  return (
    <div role="status" className="fixed top-0 left-0 right-0 z-[101] h-8 bg-red-600 text-white flex items-center overflow-hidden border-b border-white/10 shadow-md">
      {/* moving light sweep */}
      <span aria-hidden="true" className="promo-shine pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ animation: 'promoShine 4s ease-in-out infinite' }} />

      <div className="relative flex-1 min-w-0 overflow-hidden">
        {/* desktop: gift, the line, a small gap, then the Login Now link */}
        <div className="hidden sm:flex items-center justify-center gap-3 px-3">
          {gift}
          <p className="text-xs font-black uppercase tracking-widest truncate drop-shadow">{text}</p>
        </div>
        {/* phones: the same line scrolls, with the link right after each copy of the text */}
        <div className="sm:hidden flex w-max whitespace-nowrap" style={{ animation: 'marquee 18s linear infinite' }}>
          {[0, 1].map((i) => (
            <span key={i} className="px-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider">
              {gift}
              {text}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={dismissPromoBar}
        aria-label={translate('Close')}
        className="relative shrink-0 mx-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/15 hover:bg-black/30 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const PublicNavbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { translate } = useTranslate();
  const isClient = useClientSide();
  const [scrolled, setScrolled] = useState(false);
  const promoActive = usePromoBarVisible();

  useEffect(() => {
    if (isClient) {
      dispatch(initializeDarkMode());
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isClient, dispatch]);

  const navLinks = [
    { label: 'Home', title: 'Home', href: '/', icon: Compass },
    { label: 'Features', title: 'Features', href: '/features', icon: Sparkles },
    { label: 'Exams', title: 'Exams', href: '/exams', icon: GraduationCap },
    { label: 'Subjects', title: 'Subjects', href: '/subjects', icon: BookOpen },
    { label: 'Topics', title: 'Topics', href: '/topics', icon: FolderOpen },
    { label: 'Quizzes', title: 'Quizzes', href: '/quizzes', icon: Gamepad2 },
    { label: 'CA', title: 'Current Affairs', href: '/current-affairs', icon: Newspaper },
    { label: 'News', title: 'News', href: '/exam-news', icon: Newspaper },
    { label: 'Notes', title: 'Notes', href: '/notes', icon: Layers },
    { label: 'IQs', title: 'Interview Questions', href: '/interview-questions', icon: MessageCircleQuestion },
    { label: 'Blog', title: 'Blog', href: '/blog', icon: Layers },
  ];

  return (
    <>
      {promoActive && <PromoTopBar />}
      <nav
        className={`fixed ${promoActive ? 'top-8' : 'top-0'} left-0 right-0 z-[100] transition-all duration-500 pointer-events-none ${scrolled
          ? 'py-2.5 bg-white dark:bg-black border-b border-slate-100 dark:border-slate-800 shadow-md after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:via-amber-300 after:to-primary-500'
          : 'py-2.5 bg-white dark:bg-black border-b border-slate-100 dark:border-slate-800 shadow-md after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:via-amber-300 after:to-primary-500'
          }`}
      >
        <div className="container mx-auto px-4 xxl:px-0 pointer-events-auto">
          <div className="flex items-center justify-between">

            {/* --- Logo --- */}
            <Link href="/" className="flex gap-2 group items-center relative z-10">
              <div className="absolute -inset-2 bg-primary-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col leading-none">
                <span className="text-2xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                  AAJ<span className="text-primary-600 text-glow-primary">{translate('EXAM')}</span>
                </span>
                <span className="hidden sm:block text-[9px] xl:text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.1em] uppercase mt-0.5">
                  {translate('Prepare Your Exam Today')}
                </span>
              </div>
            </Link>

            {/* --- Desktop Navigation --- */}
            <div className="hidden xl:flex xl:flex-1 xl:justify-center">
              <div className="flex items-center gap-1.5 p-1">
                {navLinks.map((link) => {
                  const isActive = router.pathname === link.href;
                  return (
                    <Link title={translate(link.title)} key={link.href} href={link.href}>
                      <button className={`relative px-2.5 py-2 rounded-lg xl:rounded-xl text-sm font-black uppercase tracking-[0.06em] transition-all group ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`}>
                        {isActive && (
                          <motion.div layoutId="nav-glow" className="absolute inset-0 bg-primary-600 rounded-lg xl:rounded-xl shadow-sm" />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          {translate(link.label)}
                        </span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* --- Actions --- */}
            <div className="flex items-center gap-3 relative z-10">
              <ThemeColorMenuButton buttonClassName="w-10 h-10 rounded-2xl bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-700 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm transition-all" />

              <Link href="/login" data-cta="navbar_get_started">
                <Button variant="primary" size="sm" className="px-6 py-2 sm:py-3 rounded-2xl font-black uppercase tracking-widest text-xs">{translate('Get Started')}</Button>
              </Link>
            </div>
          </div>
        </div>

      </nav>
    </>
  );
};

export default PublicNavbar;

