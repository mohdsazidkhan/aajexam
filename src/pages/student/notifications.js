'use client';

import { NotificationsPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Trash2,
  Eye,
  CircleCheck,
  Trophy,
  Target,
  Zap,
  CircleAlert,
  Info,
  Clock,
  ArrowRight,
  Inbox
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/common/MobileAppWrapper';
import Card from '../../components/common/ui/Card';
import Button from '../../components/common/ui/Button';
import PageHero from '../../components/common/ui/PageHero';
import Loading from '../../components/common/Loading';
import Seo from '../../components/common/Seo';
import useTranslate from '../../hooks/useTranslate';

const NotificationsPage = () => {
  const { translate } = useTranslate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.getStudentNotifications();
      const items = Array.isArray(res?.data) ? res.data : (res?.items || []);
      setNotifications(items.map(n => ({ ...n, id: n.id || n._id })));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    setMarkingId(id);
    try {
      await API.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } finally { setMarkingId(null); }
  };

  const markAllRead = async () => {
    try {
      await API.request('/api/student/notifications/mark-all-read', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success(translate('Inbox caught up!'));
    } catch (e) { }
  };

  const clearAll = async () => {
    if (!confirm(translate('Clear your entire inbox?'))) return;
    try {
      await API.request('/api/student/notifications/clear-all', { method: 'DELETE' });
      setNotifications([]);
      toast.success(translate('Inbox cleared'));
    } catch (e) { }
  };

  const deleteOne = async (id) => {
    try {
      await API.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { }
  };

  if (loading) return (
    <MobileAppWrapper title={translate('Notifications')}>
      <div className="py-2 xl:py-4"><NotificationsPageSkeleton rows={7} /></div>
    </MobileAppWrapper>
  );

  const getIcon = (type) => {
    switch (type) {
      case 'quiz_attempt':
      case 'exam_attempt':
      case 'daily_challenge':
        return <Target className="w-5 h-5 text-primary-600" />;
      case 'referral_registration':
      case 'mentor':
        return <Trophy className="w-5 h-5 text-primary-600" />;
      case 'streak':
        return <Zap className="w-5 h-5 text-primary-600" />;
      case 'subscription':
        return <CircleAlert className="w-5 h-5 text-content-primary" />;
      default: return <Info className="w-5 h-5 text-content-primary" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <MobileAppWrapper title={translate('Notifications')}>
      <div className="min-h-screen animate-fade-in selection:bg-primary-600 selection:text-white mt-0">
      <Seo title={`Inbox ${unreadCount > 0 ? `(${unreadCount})` : ''} - AajExam`} noIndex={true} />

      <div className="container mx-auto py-2 xl:py-4 space-y-3 xl:space-y-5 mt-0">
        <PageHero
          icon={Bell}
          eyebrow={translate('Notifications')}
          title={translate('Notifications')}
          badge={unreadCount > 0 ? String(unreadCount) : undefined}
          actions={
            <>
              <div className="relative overflow-hidden ring-1 ring-slate-200 dark:ring-white/20 px-3 py-1.5 min-w-[96px]" style={{ borderRadius: 'var(--radius)' }}>
                <p className="text-lg font-bold font-outfit leading-none text-primary-600">{notifications.length}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75">{translate('Notifications')}</p>
              </div>
              <div className="relative overflow-hidden ring-1 ring-slate-200 dark:ring-white/20 px-3 py-1.5 min-w-[96px]" style={{ borderRadius: 'var(--radius)' }}>
                <p className="text-lg font-bold font-outfit leading-none text-primary-600">{unreadCount}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75">{translate('Unread')}</p>
              </div>
              {unreadCount > 0 && <Button variant="primary" size="sm" className="text-[10px] font-bold tracking-[0.08em]" onClick={markAllRead}>{translate('MARK ALL READ')}</Button>}
              {notifications.length > 0 && <Button variant="secondary" size="sm" className="text-[10px] font-bold tracking-[0.08em]" onClick={clearAll}>{translate('CLEAR ALL')}</Button>}
            </>
          }
        />

        <Card as="section" className="overflow-hidden">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 xl:py-8 text-center space-y-3 xl:space-y-6">
                <div className="w-24 h-24 bg-background-surface-secondary rounded-3xl flex items-center justify-center mx-auto opacity-50">
                  <Inbox className="w-10 h-10 text-content-muted" />
                </div>
                <section className="space-y-2">
                  <h2 className="text-xl xl:text-2xl font-bold font-outfit">{translate('Inbox Empty')}</h2>
                  <p className="text-xs font-bold text-content-muted uppercase tracking-[0.08em]">{translate('You\'re all caught up with your academic updates!')}</p>
                </section>
              </motion.div>
            ) : (
              <div className="divide-y-2 divide-slate-50 dark:divide-slate-800">
                {notifications.map((n, idx) => (
                  <motion.div
                    key={n.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group relative p-4 xl:p-6 transition-all duration-300 hover:bg-background-surface-secondary flex flex-col xl:flex-row gap-3 xl:gap-6 items-start ${!n.isRead ? '' : ''}`}
                  >
                    <div className={`shrink-0 p-3 xl:p-4 rounded-2xl bg-background-surface transition-transform group-hover:scale-110 ${!n.isRead ? 'border border-primary-500/20' : ''}`}>
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {n.title && <h3 className={`text-sm font-bold uppercase tracking-tight ${!n.isRead ? 'text-content-primary' : 'text-content-muted'}`}>{n.title}</h3>}
                        {!n.isRead && <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse shrink-0" />}
                      </div>
                      <p className={`text-xs font-bold leading-relaxed ${!n.isRead ? 'text-content-secondary' : 'text-content-muted'}`}>{n.description}</p>
                      <div className="flex items-center gap-2 pt-2 opacity-70">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em]">{new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!n.isRead && <button onClick={() => markRead(n.id)} className="p-2 text-primary-600 rounded-lg xl:rounded-xl transition-colors" aria-label={translate('Mark as read')}><Eye className="w-4 h-4" /></button>}
                      <button onClick={() => deleteOne(n.id)} className="p-2 text-content-primary hover:bg-black/10 rounded-lg xl:rounded-xl transition-colors" aria-label={translate('Delete notification')}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      </div>
    </MobileAppWrapper>
  );
};

export default NotificationsPage;

