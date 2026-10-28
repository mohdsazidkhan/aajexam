'use client';

import { stripStudent } from '../../lib/utils/appRoutes';
import Link from '@/components/common/AppLink';
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
  Map as MapIcon,
  Building2,
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
  MessageCircle,
  Swords,
  Sparkles,
  MessageCircleQuestion,
  Bell,
  Eye,
  UserCheck
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import { toggleSidebar } from '../../lib/store/sidebarSlice';
import { secureLogout, getCurrentUser, isAuthenticated } from '../../lib/utils/authUtils';
import { useSSR } from '../../hooks/useSSR';
import API from '../../lib/api';
import { ProBadge } from '../common/ui';
import useTranslate from '../../hooks/useTranslate';
import useScrollActiveIntoView from '../../hooks/useScrollActiveIntoView';

const StudentSidebar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const { translate } = useTranslate();
  const isOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const user = getCurrentUser();
  const authenticated = isAuthenticated();
  const navRef = useRef(null);
  useScrollActiveIntoView(navRef, [router?.pathname, isOpen, isMounted, authenticated]);

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
    // /u/[username]/... routes carry the username, so compare the real URL path, not the route pattern.
    const isUserRoute = (router?.pathname || '').startsWith('/u/');
    const pathname = isUserRoute
      ? (router?.asPath || '').split(/[?#]/)[0].replace(/\/$/, '').toLowerCase()
      : stripStudent(router?.pathname);
    if (!pathname) return false;
    path = isUserRoute ? String(path).toLowerCase() : stripStudent(path);
    if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    if (pathname === path) return true;
    if (!pathname.startsWith(path + '/')) return false;
    // Sibling-aware: if any other sidebar path is a longer prefix of pathname, this parent is NOT active
    const allPaths = sidebarSections.flatMap(s => s.items.map(i => (isUserRoute ? String(i.path).toLowerCase() : stripStudent(i.path))));
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
        { path: '/student/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/student/notifications', icon: Bell, label: 'Notifications' },
        { path: '/features', icon: Sparkles, label: 'Features' },
        { path: '/search', icon: Search, label: 'Search' },
        { path: '/reels', icon: PlayCircle, label: 'Reels' },
        { path: '/govt-exams', icon: GraduationCap, label: 'Govt. Exams' },
        { path: '/quizzes', icon: BrainCircuit, label: 'Quizzes' },
        { path: '/subjects', icon: BookMarked, label: 'Subjects' },
        { path: '/topics', icon: Layers, label: 'Topics' },
        { path: '/blog', icon: PenSquare, label: 'Blog' },
        { path: '/community-questions', icon: MessageSquarePlus, label: 'Q&A' },
      ]
    },
    {
      title: 'DAILY',
      items: [
        { path: '/daily-challenge', icon: Target, label: 'Daily Challenge' },
        { path: '/student/streak', icon: Flame, label: 'Streak' },
        { path: '/current-affairs', icon: Newspaper, label: 'Current Affairs' },
        { path: '/exam-news', icon: Megaphone, label: 'Exam News' },
        { path: '/student/exam-calendar', icon: CalendarDays, label: 'Exam Calendar' },
      ]
    },
    {
      title: 'STUDY',
      items: [
        { path: '/pyq', icon: FileText, label: "PYQ's", isPro: true },
        { path: '/student/syllabus-tracker', icon: Layers, label: 'Syllabus Tracker', isPro: true },
        { path: '/student/revision', icon: RotateCcw, label: 'Revision Queue', isPro: true },
        { path: '/student/study-plan', icon: CalendarDays, label: 'Study Planner', isPro: true },
        { path: '/notes', icon: StickyNote, label: 'Notes & Formulas' },
        { path: '/interview-questions', icon: MessageCircleQuestion, label: 'Interview Questions' },
        { path: '/mentors', icon: Users, label: 'Mentors', isPro: true },
      ]
    },
    {
      title: 'PROGRESS',
      items: [
        { path: '/student/all-india-rank', icon: Globe, label: 'All India Rank', isPro: true },
        { path: '/student/state-rank', icon: MapIcon, label: 'State Rank', isPro: true },
        { path: '/student/city-rank', icon: Building2, label: 'City Rank', isPro: true },
        { path: '/student/my-analytics', icon: TrendingUp, label: 'Performance', isPro: true },
        { path: '/student/readiness', icon: Target, label: 'Exam Readiness', isPro: true },
        { path: '/student/exam-history', icon: History, label: 'Exam History', isPro: true },
        { path: '/student/payment-history', icon: CreditCard, label: 'Payment History' },
        { path: '/student/quiz-history', icon: BrainCircuit, label: 'Quiz History', isPro: true },
        { path: '/student/my-challenges', icon: Swords, label: 'My Challenges', isPro: true },
        { path: '/reels/create', icon: PlusCircle, label: 'Create Reel' },
        { path: '/community-questions/ask', icon: PlusCircle, label: 'Create Q&A' },
        { path: '/student/my-reels', icon: PlayCircle, label: 'My Reels' },
        { path: '/student/my-questions', icon: MessageSquarePlus, label: 'My Q&A' },
        { path: '/student/bookmarks', icon: Bookmark, label: 'My Bookmarks' },
        { path: '/student/referral-history', icon: Globe, label: 'My Referrals' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { path: '/student/profile', icon: User, label: 'My Profile' },
        ...(user?.username ? [
          { path: `/@${user.username}/followers`, icon: Users, label: 'My Followers' },
          { path: `/@${user.username}/following`, icon: UserCheck, label: 'My Followings' },
          { path: `/@${user.username}`, icon: Eye, label: 'Public profile' },
        ] : []),
        { path: '/student/subscription', icon: ShieldCheck, label: 'Subscription' },
        { path: '/student/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  // Display order: every free menu together first, then every PRO menu together.
  const allItems = sidebarSections.flatMap((s) => s.items);
  const displaySections = [
    { title: 'FREE', items: allItems.filter((i) => !i.isPro) },
    { title: 'PRO', items: allItems.filter((i) => i.isPro) },
  ];

  if (!isMounted || !authenticated || !user) return null;

  const initials = (user.name || user.username || 'U').charAt(0).toUpperCase();

  return (
    <aside
      className={`fixed left-0 top-12 xl:top-16 bottom-0 z-[140] flex flex-col transition-all duration-300 ease-in-out bg-background-surface border-r border-border-primary overflow-hidden ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 opacity-0'
        }`}
    >

      {/* Navigation */}
      <nav ref={navRef} aria-label={translate('Sidebar navigation')} className="flex-1 overflow-y-auto py-2 px-0 space-y-2 xl:space-y-4 scrollbar-premium min-w-[256px] relative z-10">
        {displaySections.map((section, idx) => (
          <section key={idx}>
            <h3 className="text-[11px] font-bold text-primary-600 uppercase tracking-[0.08em] px-2 mb-2">
              {translate(section.title)}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item, itemIdx) => {
                const active = isActiveRoute(item.path);
                return (
                  <Link key={itemIdx} href={item.path} onClick={handleNavClick} aria-current={active ? 'page' : undefined} data-active={active ? 'true' : undefined}>
                    <button className={`w-full flex items-center justify-between px-2 py-2 transition-all duration-200 relative group overflow-hidden ${active
                      ? 'text-on-primary'
                      : darkMode ? 'text-content-muted hover:text-white' : 'text-content-secondary hover:text-primary-800'
                      }`}>
                      {active && (
                        <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-primary-600" />
                      )}
                      <div className="flex items-center gap-2 relative z-10">
                        <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
                        <span className="text-[11px] xl:text-[13px] font-bold tracking-wide uppercase">{translate(item.label)}</span>
                      </div>
                      {item.isPro && (
                        <ProBadge size="xs" className="relative z-10" />
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border-primary min-w-[256px]">
        <button
          onClick={() => secureLogout(router)}
          className="w-full py-3 rounded-lg xl:rounded-xl hover:brightness-110 text-white text-[11px] font-bold tracking-wide transition-all flex items-center justify-center gap-2 group bg-red-600"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> {translate('LOG OUT')}
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
