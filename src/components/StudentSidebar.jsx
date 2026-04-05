'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Home,
  Search,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Trophy,
  Crown,
  PlusCircle,
  Edit3,
  Layout,
  Wallet,
  CreditCard,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Layers,
  Award,
  Globe,
  Zap,
  Target,
  History,
  MessageSquare,
  ShieldCheck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [claimableRewards, setClaimableRewards] = useState(0);
  const fetchRef = useRef(false);

  useEffect(() => {
    const fetchWallet = async () => {
      if (authenticated && isMounted) {
        try {
          const res = await API.getWalletData();
          if (res?.success && res.data) {
            setWalletBalance(res.data.walletBalance || 0);
            setClaimableRewards(res.data.claimableRewards || 0);
          }
        } catch (err) { console.error('Wallet Stats offline'); }
      }
    };
    if (authenticated && isMounted && !fetchRef.current) {
      fetchRef.current = true;
      fetchWallet();
    }
  }, [authenticated, isMounted]);

  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActiveRoute = (path) => {
    if (!router?.pathname) return false;
    return path === '/home' ? router.pathname === '/home' || router.pathname === '/' : router.pathname.startsWith(path);
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) dispatch(toggleSidebar());
  };

  const getProfileChildren = useMemo(() => {
    const username = user?.username;
    const children = [
      { path: '/profile', label: 'My Profile' },
      { path: '/pro/quizzes/mine', label: 'My Quizzes' },
      { path: '/pro/questions/mine', label: 'My Questions' },
      { path: '/pro/my-blogs', label: 'My Articles' },
    ];
    if (username) {
      children.push(
        { path: `/profile/${username}/followers`, label: 'Followers' },
        { path: `/profile/${username}/following`, label: 'Following' }
      );
    }
    children.push({ path: '/exam-history', label: 'Exam History' });
    children.push({ path: '/quiz-history', label: 'Quiz History' });
    children.push({ path: '/settings', label: 'Settings' });
    return children;
  }, [user]);

  const sidebarSections = [
    {
      title: 'NAVIGATION',
      items: [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/search', icon: Search, label: 'Search' },
      ]
    },
    {
      title: 'STUDY CENTER',
      items: [
        { path: '/questions/public', icon: HelpCircle, label: 'Questions' },
        { path: '/govt-exams', icon: GraduationCap, label: 'Govt. Exams' },
        { path: '/quiz-levels', icon: Layers, label: 'Levels' },
      ]
    },
    {
      title: 'RANKING & REWARDS',
      items: [
        { path: '/leaderboard', icon: Crown, label: 'Leaderboard' },
        { path: '/monthly-winners', icon: Trophy, label: 'Monthly Winners' },
        { path: '/rewards', icon: Award, label: 'Rewards', badge: claimableRewards > 0 ? `₹${claimableRewards}` : null, badgeColor: 'primary' },
      ]
    },
    {
      title: 'CREATION',
      items: [
        { path: '/pro/questions/new', icon: PlusCircle, label: 'Add Question' },
        { path: '/pro/quiz/create', icon: Edit3, label: 'Create Quiz' },
        { path: '/pro/create-blog', icon: MessageSquare, label: 'Write Article' },
      ]
    },
    {
      title: 'MY ACCOUNT',
      items: [
        { path: '/profile', icon: User, label: 'Profile', hasChildren: true, children: getProfileChildren },
        { path: '/pro/wallet', icon: Wallet, label: 'Wallet', badge: walletBalance > 0 ? `₹${walletBalance}` : null, badgeColor: 'emerald' },
        { path: '/subscription', icon: ShieldCheck, label: 'Subscription' },
      ]
    },
    {
      title: 'MY PROGRESS',
      items: [
        { path: '/my-analytics', icon: TrendingUp, label: 'Performance' },
        { path: '/referral-history', icon: Globe, label: 'Referrals' },
      ]
    }
  ];

  if (!isMounted || !authenticated || !user) return null;

  return (
    <>
      {/* Main Sidebar Container Ã¢â‚¬â€ No internal overlay, handled by AppLayout */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          width: isOpen ? 320 : 0,
          opacity: isOpen ? 1 : 0
        }}
        className="fixed left-0 top-16 lg:top-20 bottom-0 z-[140] flex flex-col transition-all duration-700 ease-out border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 shadow-[30px_0_60px_rgba(0,0,0,0.1)] dark:shadow-[30px_0_60px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        <div className="absolute top-0 -left-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-2 scrollbar-premium relative z-10">
          {sidebarSections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-3 px-4">
                <h3 className="text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] whitespace-nowrap">
                  {section.title}
                </h3>
              </div>
              <div className="space-y-1.5 px-1">
                {section.items.map((item, itemIdx) => {
                  const isExpanded = expandedMenus[item.label] || false;
                  const active = isActiveRoute(item.path);

                  return (
                    <div key={itemIdx} className="relative">
                      {item.hasChildren ? (
                        <div className="space-y-1.5">
                          <button
                            onClick={() => toggleMenu(item.label)}
                            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${active
                              ? 'text-primary-700 dark:text-primary-500'
                              : darkMode ? 'text-slate-600 dark:text-slate-400 hover:text-white' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900'
                              }`}
                          >
                            {active && (
                              <motion.div layoutId="sidebar-active-glow" className="absolute inset-0 bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 shadow-[0_0_20px_rgba(88,204,2,0.05)] rounded-2xl" />
                            )}
                            {!active && <div className="absolute inset-0 bg-slate-500/0 group-hover:bg-slate-500/5 transition-colors" />}

                            <div className="flex items-center gap-4 relative z-10">
                              <item.icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${active ? 'text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400'}`} />
                              <span className="text-[10px] font-black tracking-[0.15em] uppercase">{item.label}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-400 transition-transform duration-500 relative z-10 ${isExpanded ? 'rotate-180 text-primary-700 dark:text-primary-500' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="pl-14 space-y-1 overflow-hidden"
                              >
                                {item.children.map((child, childIdx) => (
                                  <Link key={childIdx} href={child.path} onClick={handleNavClick}>
                                    <button className={`w-full text-left py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all relative group flex items-center gap-3 ${isActiveRoute(child.path) ? 'text-primary-700 dark:text-primary-500' : 'text-slate-700 dark:text-slate-400 hover:text-slate-300'
                                      }`}>
                                      <div className={`w-1 h-1 rounded-full ${isActiveRoute(child.path) ? 'bg-primary-500 shadow-duo-primary' : 'bg-slate-700'}`} />
                                      <span className="group-hover:translate-x-1 transition-transform">{child.label}</span>
                                    </button>
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link href={item.path} onClick={handleNavClick}>
                          <button className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${active
                            ? 'text-white'
                            : darkMode ? 'text-slate-600 dark:text-slate-400 hover:text-white' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900'
                            }`}>
                            {active && (
                              <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-primary-500 shadow-duo-primary rounded-2xl border-t border-white/20" />
                            )}
                            {!active && <div className="absolute inset-0 bg-slate-500/0 group-hover:bg-slate-500/5 transition-colors" />}

                            <div className="flex items-center gap-4 relative z-10">
                              <item.icon className="w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110" />
                              <span className="text-[10px] font-black tracking-[0.15em] uppercase truncate">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black relative z-10 shadow-sm border border-white/10 ${active ? 'bg-white/20 text-white' : item.badgeColor === 'emerald' ? 'bg-emerald-500 text-white' : 'bg-primary-500 text-white'
                                }`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 relative z-20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => secureLogout(router)}
            className="w-full py-5 rounded-[1.75rem] bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-duo-red hover:bg-rose-600 transition-all flex items-center justify-center gap-3 border-t border-white/20 group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> LOG OUT
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default StudentSidebar;


