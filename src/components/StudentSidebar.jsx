'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Home,
  Search,
  GraduationCap,
  Wallet,
  TrendingUp,
  User,
  LogOut,
  Globe,
  ShieldCheck,
  History,
  Settings,
  PenSquare,
  MessageSquarePlus,
  PlayCircle,
  BrainCircuit,
  BookMarked,
  Layers,
  CreditCard,
  PlusCircle,
  Bookmark,
  Flame,
  Target,
  RotateCcw,
  Newspaper,
  Megaphone,
  FileText,
  StickyNote,
  CalendarDays,
  Users,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toggleSidebar } from '../lib/store/sidebarSlice';
import { secureLogout, getCurrentUser, isAuthenticated } from '../lib/utils/authUtils';
import { useSSR } from '../hooks/useSSR';
import API from '../lib/api';

const StudentSidebar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const user = getCurrentUser();
  const authenticated = isAuthenticated();

  const [walletBalance, setWalletBalance] = useState(0);
  const fetchRef = useRef(false);

  useEffect(() => {
    const fetchWallet = async () => {
      if (authenticated && isMounted) {
        try {
          const res = await API.getWalletData();
          if (res?.success && res.data) {
            setWalletBalance(res.data.walletBalance || 0);
          }
        } catch (err) { console.error('Wallet Stats offline'); }
      }
    };
    if (authenticated && isMounted && !fetchRef.current) {
      fetchRef.current = true;
      fetchWallet().catch(() => { fetchRef.current = false; });
    }
  }, [authenticated, isMounted]);

  const isActiveRoute = (path) => {
    const pathname = router?.pathname;
    if (!pathname) return false;
    if (path === '/home') return pathname === '/home' || pathname === '/';
    if (pathname === path) return true;
    if (!pathname.startsWith(path + '/')) return false;
    // Sibling-aware: if any other sidebar path is a longer prefix of pathname, this parent is NOT active
    const allPaths = sidebarSections.flatMap(s => s.items.map(i => i.path));
    const longerMatch = allPaths.some(p => p !== path && p.length > path.length && (pathname === p || pathname.startsWith(p + '/')));
    return !longerMatch;
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) dispatch(toggleSidebar());
  };

  const sidebarSections = [
    {
      title: 'MAIN',
      items: [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/search', icon: Search, label: 'Search' },
        { path: '/reels', icon: PlayCircle, label: 'Reels' },
        { path: '/reels/create', icon: PlusCircle, label: 'Create Reel' },
        { path: '/my-reels', icon: PlayCircle, label: 'My Reels' },
        { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
        { path: '/govt-exams', icon: GraduationCap, label: 'Govt. Exams' },
        { path: '/quizzes', icon: BrainCircuit, label: 'Quizzes' },
        { path: '/subjects', icon: BookMarked, label: 'Subjects' },
        { path: '/topics', icon: Layers, label: 'Topics' },
        { path: '/blog', icon: PenSquare, label: 'Blog' },
        { path: '/community-questions', icon: MessageSquarePlus, label: 'Community Q&A' },
        { path: '/community-questions/ask', icon: PlusCircle, label: 'Create Q&A' },
        { path: '/my-questions', icon: MessageSquarePlus, label: 'My Q&A' },
      ]
    },
    {
      title: 'DAILY',
      items: [
        { path: '/daily-challenge', icon: Target, label: 'Daily Challenge' },
        { path: '/streak', icon: Flame, label: 'Streak' },
        { path: '/current-affairs', icon: Newspaper, label: 'Current Affairs' },
        { path: '/exam-news', icon: Megaphone, label: 'Exam News' },
      ]
    },
    {
      title: 'STUDY',
      items: [
        { path: '/pyq', icon: FileText, label: 'Previous Year Q' },
        { path: '/revision', icon: RotateCcw, label: 'Revision Queue' },
        { path: '/study-plan', icon: CalendarDays, label: 'Study Planner' },
        { path: '/notes', icon: StickyNote, label: 'Notes & Formulas' },
        { path: '/mentors', icon: Users, label: 'Mentors' },
      ]
    },
    {
      title: 'PROGRESS',
      items: [
        { path: '/my-analytics', icon: TrendingUp, label: 'Performance' },
        { path: '/readiness', icon: Target, label: 'Exam Readiness' },
        { path: '/exam-history', icon: History, label: 'Exam History' },
        { path: '/payment-history', icon: CreditCard, label: 'Payment History' },
        { path: '/quiz-history', icon: BrainCircuit, label: 'Quiz History' },
        { path: '/referral-history', icon: Globe, label: 'Referrals' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { path: '/profile', icon: User, label: 'Profile' },
        { path: '/subscription', icon: ShieldCheck, label: 'Subscription' },
        { path: '/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  if (!isMounted || !authenticated || !user) return null;

  const initials = (user.name || user.username || 'U').charAt(0).toUpperCase();

  return (
    <div
      className={`fixed left-0 top-12 lg:top-20 bottom-0 z-[140] flex flex-col transition-all duration-300 ease-in-out bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 shadow-[30px_0_60px_rgba(0,0,0,0.1)] dark:shadow-[30px_0_60px_rgba(0,0,0,0.3)] overflow-hidden ${
        isOpen ? 'translate-x-0 w-60' : '-translate-x-full w-0 opacity-0'
      }`}
    >

      {/* Navigation */}
      <nav aria-label="Sidebar navigation" className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-premium min-w-[240px] relative z-10">
        {sidebarSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] px-3 mb-2">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item, itemIdx) => {
                const active = isActiveRoute(item.path);
                return (
                  <Link key={itemIdx} href={item.path} onClick={handleNavClick} aria-current={active ? 'page' : undefined}>
                    <button className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 relative group overflow-hidden ${active
                      ? 'text-white'
                      : darkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}>
                      {active && (
                        <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-primary-500 shadow-duo-primary rounded-xl" />
                      )}
                      <div className="flex items-center gap-3 relative z-10">
                        <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
                        <span className="text-[11px] font-bold tracking-wide uppercase">{item.label}</span>
                      </div>
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5 min-w-[240px]">
        <button
          onClick={() => secureLogout(router)}
          className="w-full py-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 text-[11px] font-bold tracking-wide hover:bg-rose-100 dark:hover:bg-rose-500/25 transition-colors flex items-center justify-center gap-2 group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> LOG OUT
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;
