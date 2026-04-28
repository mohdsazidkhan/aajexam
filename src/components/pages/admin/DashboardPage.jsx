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
import { motion } from 'framer-motion';
import Loading from '../../Loading';
import Card from '../../ui/Card';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';

const formatINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const DashboardPage = () => {
  const { router } = useSSR();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
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
        setError('Failed to load dashboard statistics');
        setStats({});
      } finally {
        setLoading(false);
      }
    };
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchStats();
  }, []);

  const sections = [
    {
      title: 'USERS & ENGAGEMENT',
      accent: 'text-emerald-600',
      cards: [
        { title: 'Total Students', count: stats.students || 0, link: '/admin/students', icon: Users, subtitle: `${stats.newStudentsThisMonth || 0} new this month` },
        { title: 'New Today', count: stats.newStudentsToday || 0, link: '/admin/students', icon: UserPlus, subtitle: 'Signups today' },
        { title: 'Active Today', count: stats.activeUsersToday || 0, link: '/admin/analytics', icon: Activity, subtitle: 'Logged in today' },
        { title: 'Active PRO Users', count: stats.activeProUsers || 0, link: '/admin/subscriptions', icon: Crown, subtitle: 'Paid & not expired' },
        { title: 'Mentors', count: stats.mentors || 0, link: '/admin/mentors', icon: UserCheck, subtitle: `${stats.pendingMentors || 0} pending approval` },
        { title: 'Contacts', count: stats.contacts || 0, link: '/admin/contacts', icon: Mail, subtitle: `${stats.newContactsToday || 0} new today` },
        { title: 'Notifications Sent', count: stats.notifications || 0, link: '/admin/notifications', icon: Bell, subtitle: 'All-time' },
      ],
    },
    {
      title: 'EXAMS & PRACTICE TESTS',
      accent: 'text-indigo-600',
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
      accent: 'text-purple-600',
      cards: [
        { title: 'Quizzes', count: stats.quizzes || 0, link: '/admin/quiz/quizzes', icon: Sparkles, subtitle: `${stats.publishedQuizzes || 0} published` },
        { title: 'Questions', count: stats.questions || 0, link: '/admin/quiz/questions', icon: HelpCircle, subtitle: `${stats.activeQuestions || 0} active` },
        { title: 'Subjects', count: stats.subjects || 0, link: '/admin/quiz/subjects', icon: Tag, subtitle: 'In question bank' },
        { title: 'Topics', count: stats.topics || 0, link: '/admin/quiz/topics', icon: Hash, subtitle: 'Across subjects' },
      ],
    },
    {
      title: 'CONTENT LIBRARY',
      accent: 'text-rose-600',
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
      accent: 'text-emerald-600',
      cards: [
        { title: 'Total Revenue', count: formatINR(stats.totalRevenue), link: '/admin/payment-transactions', icon: Banknote, subtitle: 'Lifetime' },
        { title: 'Revenue Today', count: formatINR(stats.revenueToday), link: '/admin/payment-transactions', icon: TrendingUp, subtitle: formatINR(stats.revenueThisMonth) + ' this month' },
        { title: 'Payment Orders', count: stats.paymentOrders || 0, link: '/admin/payment-transactions', icon: CreditCard, subtitle: `${stats.paymentOrdersToday || 0} today` },
        { title: 'Subscriptions', count: stats.subscriptions || 0, link: '/admin/subscriptions', icon: Crown, subtitle: `${stats.activeSubscriptions || 0} active` },
        { title: 'Withdraw Requests', count: stats.withdrawRequests || 0, link: '/admin/withdraw-requests', icon: Wallet, subtitle: 'Pending review' },
        { title: 'Paid Out', count: formatINR(stats.withdrawPaid), link: '/admin/withdraw-requests', icon: History, subtitle: 'Lifetime payouts' },
        { title: 'Bank Details', count: stats.bankDetails || 0, link: '/admin/bank-details', icon: Building, subtitle: 'Student accounts' },
        { title: 'Wallet Balance', count: formatINR(stats.walletBalance), link: '/admin/user-wallets', icon: PiggyBank, subtitle: 'Across all wallets' },
        { title: 'Total Expenses', count: formatINR(stats.totalExpenses), link: '/admin/expenses', icon: Receipt, subtitle: 'Recorded expenses' },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="w-full text-slate-900 dark:text-white font-outfit my-4">
        <div className="flex items-center justify-center h-64">
          <Loading size="md" color="yellow" message="Loading..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-slate-900 dark:text-white font-outfit my-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl lg:text-6xl mb-4">⚠️</div>
            <div className="text-lg text-primary-700 dark:text-red-400">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-900 dark:text-white font-outfit my-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 uppercase leading-none">
          ADMIN <span className="text-indigo-600">DASHBOARD</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-2xl leading-relaxed">
          Your complete overview of platform activity, revenue, and content at a glance.
        </p>
      </motion.div>

      {/* Top Headline KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-8"
      >
        {[
          { label: 'TOTAL REVENUE', value: formatINR(stats.totalRevenue), subtitle: `${formatINR(stats.revenueThisMonth)} this month`, icon: Banknote, color: 'emerald' },
          { label: 'TOTAL STUDENTS', value: (stats.students || 0).toLocaleString('en-IN'), subtitle: `${stats.activeUsersToday || 0} active today`, icon: Users, color: 'indigo' },
          { label: 'ACTIVE PRO', value: (stats.activeProUsers || 0).toLocaleString('en-IN'), subtitle: `${stats.activeSubscriptions || 0} active subscriptions`, icon: Crown, color: 'purple' },
          { label: 'TEST COMPLETION', value: `${stats.testAttempts > 0 ? Math.round((stats.completedAttempts / stats.testAttempts) * 100) : 0}%`, subtitle: `${stats.completedAttempts || 0} of ${stats.testAttempts || 0} attempts`, icon: Sparkles, color: 'rose' },
        ].map((item, idx) => (
          <Card key={idx} variant="white" className="border-4 border-slate-100 dark:border-white/5 shadow-2xl bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-3 lg:p-10 rounded-xl lg:rounded-[2.5rem] group hover:border-indigo-600/30 transition-all overflow-hidden relative">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className={`text-${item.color}-600 dark:text-${item.color}-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2`}>{item.label}</p>
                <p className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic">{item.value}</p>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-6 flex items-center gap-2">
                  <CheckCircle className={`w-3.5 h-3.5 text-${item.color}-500`} /> {item.subtitle}
                </p>
              </div>
              <div className={`p-5 rounded-2xl bg-${item.color}-500/10 text-${item.color}-600 group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-inner`}>
                <item.icon className="w-8 h-8 lg:w-10 lg:h-10" />
              </div>
            </div>
            <div className={`absolute -bottom-6 -left-6 w-24 h-24 bg-${item.color}-500/5 rounded-full blur-3xl`} />
          </Card>
        ))}
      </motion.div>

      {/* Sectioned cards */}
      {sections.map((section) => (
        <div key={section.title} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-[10px] font-black ${section.accent} uppercase tracking-[0.4em]`}>
              {section.title}
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          </div>
          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.04 } } }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
          >
            {section.cards.map((card) => (
              <motion.div
                key={card.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <Card
                  hoverable
                  padded={false}
                  onClick={() => router.push(card.link)}
                  className="h-full border-4 border-slate-100 dark:border-white/5 shadow-2xl bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2rem] overflow-hidden group"
                >
                  <div className="p-3 lg:p-5 flex flex-col h-full relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        <card.icon className="w-5 h-5 lg:w-7 lg:h-7" />
                      </div>
                      <div className="text-md lg:text-2xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400 tabular-nums italic">
                        {card.count}
                      </div>
                    </div>
                    <div className="mt-auto">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{card.subtitle || 'METRIC'}</p>
                      <h2 className="text-sm lg:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-none">
                        {card.title}
                      </h2>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-900/40 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] p-0 lg:p-4 shadow-2xl border-none relative overflow-hidden"
      >
        <div className="flex items-center gap-3 lg:gap-6 mb-4 px-0 lg:px-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-xl border border-indigo-500/20">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-1 block">SHORTCUTS</span>
            <h2 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
              QUICK <span className="text-indigo-600">LINKS</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 relative z-10">
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
            <motion.div
              key={i}
              whileHover={{ x: 10 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={action.href} className="flex items-center p-3 lg:p-6 rounded-xl lg:rounded-[2rem] bg-slate-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-4 border-slate-100 dark:border-white/5 transition-all duration-300 shadow-xl group h-full">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-lg lg:rounded-[1.25rem] flex items-center justify-center mr-5 shadow-inner group-hover:rotate-6 transition-transform shrink-0">
                  <action.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-none mb-2">{action.label}</h3>
                  <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 leading-relaxed">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
