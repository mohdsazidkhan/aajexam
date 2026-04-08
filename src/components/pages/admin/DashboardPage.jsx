import {
  Users,
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
  ChevronRight
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import Sidebar from '../../Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';


const DashboardPage = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [stats, setStats] = useState({
    students: 0,
    activeUsersCurrentMonth: 0,
    exams: 0,
    activeExams: 0,
    examCategories: 0,
    examPatterns: 0,
    practiceTests: 0,
    freePracticeTests: 0,
    testAttempts: 0,
    completedAttempts: 0,
    bankDetails: 0,
    paymentOrders: 0,
    withdrawRequests: 0,
    subscriptions: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch both analytics dashboard and admin stats
        const [analytics, adminStats] = await Promise.all([
          API.getAnalyticsDashboard(),
          API.getAdminStats()
        ]);
        const overview = analytics?.data?.overview || {};
        setStats({
          ...adminStats,
          ...overview
        });
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

  const cards = [
    {
      title: 'Total Students',
      count: stats.students || 0,
      link: '/admin/students',
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-900',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/20',
      gradientFrom: 'from-green-200',
      gradientTo: 'to-emerald-200',
      darkGradientFrom: 'dark:from-green-700',
      darkGradientTo: 'dark:to-emerald-800',
      subtitle: 'Registered on platform'
    },
    {
      title: 'Active Users (Today)',
      count: stats.activeUsersCurrentMonth || 0,
      icon: Activity,
      color: 'bg-red-500',
      textColor: 'text-red-900',
      bgColor: 'bg-red-100',
      darkBgColor: 'dark:bg-red-900/20',
      gradientFrom: 'from-red-200',
      gradientTo: 'to-rose-200',
      darkGradientFrom: 'dark:from-red-700',
      darkGradientTo: 'dark:to-rose-800',
      subtitle: 'Logged in today',
      link: '#'
    },
    {
      title: 'Exam Categories',
      count: stats.examCategories || 0,
      link: '/admin/govt-exams',
      icon: Layers,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-900',
      bgColor: 'bg-indigo-100',
      darkBgColor: 'dark:bg-indigo-900/20',
      gradientFrom: 'from-indigo-200',
      gradientTo: 'to-primary-200',
      darkGradientFrom: 'dark:from-indigo-700',
      darkGradientTo: 'dark:to-primary-800',
      subtitle: 'Central & State exams'
    },
    {
      title: 'Exams',
      count: stats.exams || 0,
      link: '/admin/govt-exams/exams',
      icon: BookOpen,
      color: 'bg-purple-500',
      textColor: 'text-purple-900',
      bgColor: 'bg-purple-100',
      darkBgColor: 'dark:bg-purple-900/20',
      gradientFrom: 'from-purple-200',
      gradientTo: 'to-fuchsia-200',
      darkGradientFrom: 'dark:from-purple-700',
      darkGradientTo: 'dark:to-fuchsia-800',
      subtitle: `${stats.activeExams || 0} active`
    },
    {
      title: 'Exam Patterns',
      count: stats.examPatterns || 0,
      link: '/admin/govt-exams/exams',
      icon: FileText,
      color: 'bg-teal-500',
      textColor: 'text-teal-900',
      bgColor: 'bg-teal-100',
      darkBgColor: 'dark:bg-teal-900/20',
      gradientFrom: 'from-teal-200',
      gradientTo: 'to-cyan-200',
      darkGradientFrom: 'dark:from-teal-700',
      darkGradientTo: 'dark:to-cyan-800',
      subtitle: 'Defined patterns'
    },
    {
      title: 'Practice Tests',
      count: stats.practiceTests || 0,
      link: '/admin/govt-exams/tests',
      icon: Target,
      color: 'bg-primary-500',
      textColor: 'text-primary-900',
      bgColor: 'bg-primary-100',
      darkBgColor: 'dark:bg-primary-900/20',
      gradientFrom: 'from-primary-200',
      gradientTo: 'to-amber-200',
      darkGradientFrom: 'dark:from-primary-700',
      darkGradientTo: 'dark:to-amber-800',
      subtitle: `${stats.freePracticeTests || 0} free`
    },
    {
      title: 'Test Attempts',
      count: stats.testAttempts || 0,
      link: '#',
      icon: BarChart3,
      color: 'bg-pink-500',
      textColor: 'text-pink-900',
      bgColor: 'bg-pink-100',
      darkBgColor: 'dark:bg-pink-900/20',
      gradientFrom: 'from-pink-200',
      gradientTo: 'to-fuchsia-200',
      darkGradientFrom: 'dark:from-pink-700',
      darkGradientTo: 'dark:to-fuchsia-800',
      subtitle: `${stats.completedAttempts || 0} completed`
    },
    {
      title: 'Withdraw Requests',
      count: stats.withdrawRequests || 0,
      link: '/admin/withdraw-requests',
      icon: Wallet,
      color: 'bg-green-500',
      textColor: 'text-green-900',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/20',
      gradientFrom: 'from-green-200',
      gradientTo: 'to-emerald-200',
      darkGradientFrom: 'dark:from-green-700',
      darkGradientTo: 'dark:to-emerald-800',
      subtitle: 'Pending review'
    },
    {
      title: 'Bank Details',
      count: stats.bankDetails || 0,
      link: '/admin/bank-details',
      icon: Building,
      color: 'bg-primary-500',
      textColor: 'text-primary-900',
      bgColor: 'bg-primary-100',
      darkBgColor: 'dark:bg-primary-900/20',
      gradientFrom: 'from-primary-200',
      gradientTo: 'to-amber-200',
      darkGradientFrom: 'dark:from-primary-600',
      darkGradientTo: 'dark:to-amber-700',
      subtitle: 'Student bank accounts'
    },
    {
      title: 'Payment Orders',
      count: stats.paymentOrders || 0,
      link: '/admin/payment-transactions',
      icon: CreditCard,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-900',
      bgColor: 'bg-emerald-100',
      darkBgColor: 'dark:bg-emerald-900/20',
      gradientFrom: 'from-emerald-200',
      gradientTo: 'to-teal-200',
      darkGradientFrom: 'dark:from-emerald-700',
      darkGradientTo: 'dark:to-teal-800',
      subtitle: 'Successful payments'
    },
    {
      title: 'Subscriptions',
      count: stats.subscriptions || 0,
      link: '/admin/subscriptions',
      icon: Crown,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-900',
      bgColor: 'bg-indigo-100',
      darkBgColor: 'dark:bg-indigo-900/20',
      gradientFrom: 'from-indigo-200',
      gradientTo: 'to-primary-200',
      darkGradientFrom: 'dark:from-indigo-700',
      darkGradientTo: 'dark:to-primary-800',
      subtitle: `${stats.activeSubscriptions || 0} active`
    },
    {
      title: 'Total Revenue',
      count: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      link: '/admin/payment-transactions',
      icon: Banknote,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-900',
      bgColor: 'bg-emerald-100',
      darkBgColor: 'dark:bg-emerald-900/20',
      gradientFrom: 'from-green-200',
      gradientTo: 'to-emerald-200',
      darkGradientFrom: 'dark:from-green-700',
      darkGradientTo: 'dark:to-emerald-800',
      subtitle: 'From completed payments'
    },
  ];

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  if (loading) {
    return (
      <AdminMobileAppWrapper title="Dashboard">
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          {user?.role === 'admin' && isAdminRoute && <Sidebar />}
          <div className="adminContent w-full max-auto text-slate-900 dark:text-white font-outfit ">
            <div className="flex items-center justify-center h-64">
              <Loading size="md" color="yellow" message="Loading..." />
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  if (error) {
    return (
      <AdminMobileAppWrapper title="Dashboard">
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          {user?.role === 'admin' && isAdminRoute && <Sidebar />}
          <div className="adminContent w-full max-auto text-slate-900 dark:text-white font-outfit ">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-2xl lg:text-6xl mb-4">âš ï¸</div>
                <div className="text-lg text-primary-700 dark:text-primary-500 dark:text-red-400">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Dashboard">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent w-full max-auto text-slate-900 dark:text-white font-outfit ">
           {/* Header */}
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-4"
           >
             <h1 className="text-2xl lg:text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 uppercase leading-none">
               ADMIN <span className="text-indigo-600">DASHBOARD</span>
             </h1>
             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-2xl leading-relaxed">
               Your complete overview of platform activity, revenue, and content at a glance.
             </p>
           </motion.div>

          <motion.div
            variants={{
              show: { transition: { staggerChildren: 0.05 } }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8 mb-4"
          >
            {cards.map((card, idx) => (
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
                   className="h-full border-4 border-slate-100 dark:border-white/5 shadow-2xl bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] overflow-hidden group"
                 >
                   <div className="p-3 lg:p-6 flex flex-col h-full relative">
                     <div className="flex items-center justify-between mb-4">
                       <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                         <card.icon className="w-6 h-6 lg:w-8 lg:h-8" />
                       </div>
                       <div className="text-md lg:text-2xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400 tabular-nums italic">
                         {card.count}
                       </div>
                     </div>
                     <div className="mt-auto">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{card.subtitle || 'METRIC'}</p>
                       <h2 className="text-sm lg:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-none">
                         {card.title}
                       </h2>
                     </div>
                     <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
                   </div>
                 </Card>
              </motion.div>
            ))}
          </motion.div>

            {/* Financial Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-4"
            >
              {[
               { label: 'TOTAL REVENUE', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, subtitle: 'Lifetime earnings from payments', icon: Banknote, color: 'emerald' },
               { label: 'PAYMENT ORDERS', value: stats.paymentOrders || 0, subtitle: 'Successful payment transactions', icon: BarChart3, color: 'blue' },
               { label: 'ACTIVE PLANS', value: stats.activeSubscriptions || 0, subtitle: `${stats.subscriptions > 0 ? Math.round((stats.activeSubscriptions / stats.subscriptions) * 100) : 0}% of all subscriptions`, icon: TrendingUp, color: 'purple' },
               { label: 'TEST COMPLETION', value: `${stats.testAttempts > 0 ? Math.round((stats.completedAttempts / stats.testAttempts) * 100) : 0}%`, subtitle: `${stats.completedAttempts || 0} of ${stats.testAttempts || 0} attempts completed`, icon: Sparkles, color: 'rose' }
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
            {/* Actions */}
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
                   { href: "/admin/govt-exams", label: "Exam Categories", desc: "Create and organize exam categories", icon: Layers, color: "bg-indigo-100 text-indigo-600" },
                   { href: "/admin/govt-exams/exams", label: "Practice Exams", desc: "Manage practice exams", icon: BookOpen, color: "bg-indigo-100 text-indigo-600" },
                   { href: "/admin/govt-exams/tests", label: "Practice Tests", desc: "Create and manage practice tests", icon: Target, color: "bg-indigo-100 text-indigo-600" },
                   { href: "/admin/withdraw-requests", label: "Withdraw Requests", desc: "Process student payout requests", icon: Wallet, color: "bg-indigo-100 text-indigo-600" },
                   { href: "/admin/students", label: "Students", desc: "Browse and manage student accounts", icon: Users, color: "bg-indigo-100 text-indigo-600" },
                   { href: "/admin/payment-transactions", label: "Payments", desc: "Track all payment transactions", icon: CreditCard, color: "bg-indigo-100 text-indigo-600" },
                   { href: "/admin/subscriptions", label: "Subscriptions", desc: "Manage PRO subscription plans", icon: Crown, color: "bg-indigo-100 text-indigo-600" },
                 ].map((action, i) => (
                   <motion.div
                     key={i}
                     whileHover={{ x: 10 }}
                     whileTap={{ scale: 0.98 }}
                   >
                     <Link href={action.href} className="flex items-center p-3 lg:p-8 rounded-xl lg:rounded-[3rem] bg-slate-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-4 border-slate-100 dark:border-white/5 transition-all duration-300 shadow-xl group h-full">
                       <div className={`w-16 h-16 ${action.color} rounded-lg lg:rounded-[1.5rem] flex items-center justify-center mr-6 shadow-inner group-hover:rotate-6 transition-transform shrink-0`}>
                         <action.icon className="w-8 h-8" />
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
        </div>
      </AdminMobileAppWrapper>
  );
};

export default DashboardPage;


