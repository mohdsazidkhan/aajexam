import {
  Users,
  UserPlus,
  UserCheck,
  Crown,
  Zap,
  BookOpen,
  Target,
  Layers,
  Wallet,
  Banknote,
  CreditCard,
  TrendingUp,
  CheckCircle,
  FileText,
  Activity,
  Building,
  BarChart3,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Tag,
  Hash,
  Film,
  StickyNote,
  Newspaper,
  Megaphone,
  Calendar,
  Award,
  Bell,
  Mail,
  Receipt,
  PiggyBank,
  History,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import Card from '../../common/ui/Card';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';
import { getUserRole } from '../../../lib/utils/authUtils';
import { AdminMainDashboardSkeleton } from '../Skeletons';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const formatINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const DashboardPage = () => {
  const { router } = useSSR();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Guard: redirect non-admins before hitting the API
    const role = getUserRole();
    if (role !== 'admin') {
      router.replace('/');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const [analytics, adminStats] = await Promise.all([
          API.getAnalyticsDashboard(),
          API.getAdminStats()
        ]);
        const overview = analytics?.data?.overview || {};
        setStats({ ...adminStats, ...overview });
      } catch (err) {
        console.error('Error fetching stats:', err);
        // Show specific message for 403 errors
        if (err?.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError('Failed to load dashboard statistics');
        }
        setStats({});
      } finally {
        setLoading(false);
      }
    };
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchStats();
  }, [router]);

  const sections = [
    {
      title: 'USERS & ENGAGEMENT',
      accent: 'text-primary-600 dark:text-primary-300',
      cards: [
        { title: 'Total Students', count: stats.students || 0, link: '/admin/students', icon: Users, subtitle: `${stats.newStudentsThisMonth || 0} new this month` },
        { title: 'Yesterday Users', count: stats.newStudentsYesterday || 0, link: '/admin/students', icon: UserPlus, subtitle: 'Signups yesterday' },
        { title: 'Today Users', count: stats.newStudentsToday || 0, link: '/admin/students', icon: UserPlus, subtitle: 'Signups today' },
        { title: 'Active Today', count: stats.activeUsersToday || 0, link: '/admin/analytics', icon: Activity, subtitle: 'Logged in today' },
        { title: 'Active PRO Users', count: stats.activeProUsers || 0, link: '/admin/subscriptions', icon: Crown, subtitle: 'Paid & not expired' },
        { title: 'Mentors', count: stats.mentors || 0, link: '/admin/mentors', icon: UserCheck, subtitle: `${stats.pendingMentors || 0} pending approval` },
        { title: 'Contacts', count: stats.contacts || 0, link: '/admin/contacts', icon: Mail, subtitle: `${stats.newContactsToday || 0} new today` },
        { title: 'Notifications Sent', count: stats.notifications || 0, link: '/admin/notifications', icon: Bell, subtitle: 'All-time' },
      ],
    },
    {
      title: 'EXAMS & PRACTICE TESTS',
      accent: 'text-primary-600 dark:text-primary-300',
      cards: [
        { title: 'Exam Categories', count: stats.examCategories || 0, link: '/admin/govt-exams', icon: Layers, subtitle: 'Central & State' },
        { title: 'Exams', count: stats.exams || 0, link: '/admin/govt-exams/exams', icon: BookOpen, subtitle: `${stats.activeExams || 0} active` },
        { title: 'Exam Patterns', count: stats.examPatterns || 0, link: '/admin/govt-exams/patterns', icon: FileText, subtitle: 'Defined patterns' },
        { title: 'Practice Tests', count: stats.practiceTests || 0, link: '/admin/govt-exams/tests', icon: Target, subtitle: `${stats.freePracticeTests || 0} free • ${stats.pyqPracticeTests || 0} PYQ` },
        { title: 'Test Attempts', count: stats.testAttempts || 0, link: '/admin/govt-exams/results', icon: BarChart3, subtitle: `${stats.completedAttempts || 0} completed` },
      ],
    },
    {
      title: 'QUIZ BANK',
      accent: 'text-primary-600 dark:text-primary-300',
      cards: [
        { title: 'Quizzes', count: stats.quizzes || 0, link: '/admin/quiz/quizzes', icon: Sparkles, subtitle: `${stats.publishedQuizzes || 0} published` },
        { title: 'Questions', count: stats.questions || 0, link: '/admin/quiz/questions', icon: HelpCircle, subtitle: `${stats.activeQuestions || 0} active` },
        { title: 'Subjects', count: stats.subjects || 0, link: '/admin/quiz/subjects', icon: Tag, subtitle: 'In question bank' },
        { title: 'Topics', count: stats.topics || 0, link: '/admin/quiz/topics', icon: Hash, subtitle: 'Across subjects' },
      ],
    },
    {
      title: 'CONTENT LIBRARY',
      accent: 'text-black dark:text-white',
      cards: [
        { title: 'Reels', count: stats.reels || 0, link: '/admin/reels', icon: Film, subtitle: `${stats.publishedReels || 0} published` },
        { title: 'Study Notes', count: stats.studyNotes || 0, link: '/admin/notes', icon: StickyNote, subtitle: 'Total uploaded' },
        { title: 'Blogs', count: stats.blogs || 0, link: '/admin/blogs', icon: Newspaper, subtitle: `${stats.publishedBlogs || 0} published` },
        { title: 'Current Affairs', count: stats.currentAffairs || 0, link: '/admin/current-affairs', icon: Megaphone, subtitle: 'Published items' },
        { title: 'Exam News', count: stats.examNews || 0, link: '/admin/exam-news', icon: Newspaper, subtitle: 'Published news' },
        { title: 'Daily Challenges', count: stats.dailyChallenges || 0, link: '/admin/daily-challenge', icon: Award, subtitle: 'Published challenges' },
      ],
    },
    {
      title: 'FINANCE & PAYOUTS',
      accent: 'text-primary-600 dark:text-primary-300',
      cards: [
        { title: 'Total Revenue', count: formatINR(stats.totalRevenue), link: '/admin/payment-transactions', icon: Banknote, subtitle: 'Lifetime' },
        { title: 'Revenue Today', count: formatINR(stats.revenueToday), link: '/admin/payment-transactions', icon: TrendingUp, subtitle: formatINR(stats.revenueThisMonth) + ' this month' },
        { title: 'Payment Orders', count: stats.paymentOrders || 0, link: '/admin/payment-transactions', icon: CreditCard, subtitle: `${stats.paymentOrdersToday || 0} today` },
        { title: 'Subscriptions', count: stats.subscriptions || 0, link: '/admin/subscriptions', icon: Crown, subtitle: `${stats.activeSubscriptions || 0} active` },
        { title: 'Withdraw Requests', count: stats.withdrawRequests || 0, link: '/admin/withdraw-requests', icon: Wallet, subtitle: 'Pending review' },
        { title: 'Paid Out', count: formatINR(stats.withdrawPaid), link: '/admin/withdraw-requests', icon: History, subtitle: 'Lifetime payouts' },
        { title: 'Bank Details', count: stats.bankDetails || 0, link: '/admin/bank-details', icon: Building, subtitle: 'Student accounts' },
        { title: 'Referral Rewards', count: formatINR(stats.walletBalance), link: '/admin/user-wallets', icon: PiggyBank, subtitle: 'Across all students' },
        { title: 'Total Expenses', count: formatINR(stats.totalExpenses), link: '/admin/expenses', icon: Receipt, subtitle: 'Recorded expenses' },
      ],
    },
  ];

  useAdminMobileHeader({ title: 'Dashboard' });

  if (loading) {
    return (
      <div className="w-full text-slate-900 dark:text-white font-outfit my-4">
        <AdminMainDashboardSkeleton sectionCards={sections.map((s) => s.cards.length)} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-slate-900 dark:text-white font-outfit my-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl xl:text-6xl mb-4">⚠️</div>
            <div className="text-lg text-primary-600 dark:text-white">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-900 dark:text-white font-outfit my-4">
      {/* Top Headline KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-4"
      >
        {[
          { label: 'TOTAL REVENUE', value: formatINR(stats.totalRevenue), subtitle: `${formatINR(stats.revenueThisMonth)} this month`, icon: Banknote, color: 'primary' },
          { label: 'TOTAL STUDENTS', value: (stats.students || 0).toLocaleString('en-IN'), subtitle: `${stats.activeUsersToday || 0} active today`, icon: Users, color: 'primary' },
          { label: 'TOTAL ACTIVE PRO', value: (stats.activeProUsers || 0).toLocaleString('en-IN'), subtitle: `${stats.activeSubscriptions || 0} active subscriptions`, icon: Crown, color: 'primary' },
          { label: 'TEST COMPLETION', value: `${stats.testAttempts > 0 ? Math.round((stats.completedAttempts / stats.testAttempts) * 100) : 0}%`, subtitle: `${stats.completedAttempts || 0} of ${stats.testAttempts || 0} attempts`, icon: Sparkles, color: 'primary' },
          { label: 'LAST 30 DAYS USERS', value: (stats.newStudentsLast30Days || 0).toLocaleString('en-IN'), subtitle: 'Signups in last 30 days', icon: UserPlus, color: 'primary' },
        ].map((item, idx) => (
          <div key={idx} className="group relative isolate overflow-hidden p-3 xl:p-4 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 ring-1 ring-slate-200 dark:ring-white/10 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ borderRadius: 16 }}>
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            <item.icon className="pointer-events-none absolute -right-3 -bottom-3 w-20 h-20 text-primary-600/10 dark:text-white/10 rotate-12" />
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-white/75 leading-tight">{item.label}</p>
              <span className="shrink-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] group-hover:rotate-0 transition-transform" style={{ borderRadius: 10 }}>
                <item.icon className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl xl:text-4xl font-black font-outfit leading-none tracking-tight text-primary-700 dark:text-primary-200">{item.value}</p>
            <p className="mt-2 pt-2 border-t border-dashed border-slate-300 dark:border-white/25 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-white/75 leading-tight">{item.subtitle}</p>
          </div>
        ))}
      </motion.div>

      {/* Sectioned cards */}
      {sections.map((section) => (
        <div key={section.title} className="mb-3">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[10px] font-black ${section.accent} uppercase tracking-[0.3em]`}>
              {section.title}
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          </div>
          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.04 } } }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 xl:grid-cols-4 gap-3"
          >
            {section.cards.map((card) => (
              <motion.div
                key={card.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <div
                  onClick={() => router.push(card.link)}
                  className="group h-full cursor-pointer relative overflow-hidden bg-background-surface border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
                  style={{ borderRadius: 14 }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
                  <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
                    <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] group-hover:rotate-0 transition-transform" style={{ borderRadius: 12 }}>
                      <card.icon className="w-5 h-5" />
                    </span>
                    <span className="text-2xl xl:text-3xl font-black font-outfit tracking-tight text-primary-700 dark:text-primary-200 tabular-nums leading-none">{card.count}</span>
                  </div>
                  <section className="px-3 pb-2">
                    <h2 className="text-xs xl:text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors leading-tight break-words">{card.title}</h2>
                  </section>
                  <div className="relative mt-auto px-3 py-1.5 border-t border-dashed border-slate-300 dark:border-slate-700 bg-primary-50/60 dark:bg-white/5">
                    <span className="absolute -left-1.5 -top-[7px] w-3 h-3 bg-background-page" style={{ borderRadius: 999 }} />
                    <span className="absolute -right-1.5 -top-[7px] w-3 h-3 bg-background-page" style={{ borderRadius: 999 }} />
                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight break-words">{card.subtitle || 'METRIC'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}

      {/* Quick Links */}
      <motion.div
        initial={{ scale: 0.98 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="relative isolate overflow-hidden p-3 xl:p-5 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 ring-1 ring-slate-200 dark:ring-white/10 shadow-xl"
        style={{ borderRadius: 16 }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
        <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
        <Zap className="pointer-events-none absolute right-4 top-3 w-24 h-24 xl:w-32 xl:h-32 text-primary-600/10 dark:text-white/5 rotate-12" />

        <div className="relative flex items-center gap-3 mb-3 xl:mb-4 pb-3 border-b border-dashed border-slate-300 dark:border-white/25">
          <div className="w-11 h-11 xl:w-12 xl:h-12 shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-lg rotate-[-4deg]" style={{ borderRadius: 14 }}>
            <Zap className="w-5 h-5 xl:w-6 xl:h-6 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 dark:text-white/60 uppercase tracking-[0.25em] mb-0.5 block">SHORTCUTS</span>
            <h2 className="text-xl xl:text-2xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white leading-none">
              QUICK <span className="text-primary-600 dark:text-primary-300">LINKS</span>
            </h2>
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {[
            { href: '/admin/students', label: 'Students', desc: 'Browse and manage student accounts', icon: Users },
            { href: '/admin/mentors', label: 'Mentors', desc: 'Approve and manage mentor profiles', icon: UserCheck },
            { href: '/admin/govt-exams/exams', label: 'Practice Exams', desc: 'Manage exams and patterns', icon: BookOpen },
            { href: '/admin/govt-exams/tests', label: 'Practice Tests', desc: 'Create and manage practice tests', icon: Target },
            { href: '/admin/quiz/quizzes', label: 'Quizzes', desc: 'Build and publish topic quizzes', icon: Sparkles },
            { href: '/admin/quiz/questions', label: 'Question Bank', desc: 'Add or moderate questions', icon: HelpCircle },
            { href: '/admin/reels', label: 'Reels', desc: 'Manage learning reels', icon: Film },
            { href: '/admin/blogs', label: 'Blogs', desc: 'Publish and edit blog posts', icon: Newspaper },
            { href: '/admin/current-affairs', label: 'Current Affairs', desc: 'Daily current affairs entries', icon: Megaphone },
            { href: '/admin/payment-transactions', label: 'Payments', desc: 'Track all payment transactions', icon: CreditCard },
            { href: '/admin/subscriptions', label: 'Subscriptions', desc: 'Manage PRO subscription plans', icon: Crown },
            { href: '/admin/withdraw-requests', label: 'Withdraw Requests', desc: 'Process student payout requests', icon: Wallet },
            { href: '/admin/expenses', label: 'Expenses', desc: 'Track platform expenses', icon: Receipt },
            { href: '/admin/notifications', label: 'Notifications', desc: 'Send platform notifications', icon: Bell },
            { href: '/admin/contacts', label: 'Contacts', desc: 'View user contact submissions', icon: Mail },
          ].map((action, i) => (
            <motion.div key={i} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
              <Link href={action.href} className="group relative flex items-center gap-3 p-3 bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 shadow-sm hover:shadow-lg transition-all h-full" style={{ borderRadius: 12 }}>
                <div className="pointer-events-none absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b from-primary-500 via-primary-300 to-primary-500" />
                <span className="ml-1 w-10 h-10 shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg] group-hover:rotate-0 transition-transform" style={{ borderRadius: 12 }}>
                  <action.icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black uppercase text-xs tracking-wide text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-200 transition-colors leading-tight">{action.label}</h3>
                  <p className="mt-0.5 text-[10px] font-bold text-slate-500 dark:text-white/65 leading-snug">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 text-primary-600 dark:text-primary-300 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
