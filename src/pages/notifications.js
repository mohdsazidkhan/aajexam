'use client';

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
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import MobileAppWrapper from '../components/MobileAppWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/Loading';
import Seo from '../components/Seo';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.getStudentNotifications();
      const items = Array.isArray(res?.data) ? res.data : (res?.items || []);
      setNotifications(items);
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
      toast.success("Inbox caught up!");
    } catch (e) { }
  };

  const clearAll = async () => {
    if (!confirm("Clear your entire inbox?")) return;
    try {
      await API.request('/api/student/notifications/clear-all', { method: 'DELETE' });
      setNotifications([]);
      toast.success("Inbox cleared");
    } catch (e) { }
  };

  const deleteOne = async (id) => {
    try {
      await API.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><Loading size="md" /></div>;

  const getIcon = (type) => {
    switch (type) {
      case 'quiz_completed': return <Target className="w-5 h-5 text-green-500" />;
      case 'level_up': return <Zap className="w-5 h-5 text-primary-500" />;
      case 'reward_earned': return <Trophy className="w-5 h-5 text-primary-500" />;
      case 'subscription_expired': return <CircleAlert className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <MobileAppWrapper title="Notifications">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white mt-0">
      <Seo title={`Inbox ${unreadCount > 0 ? `(${unreadCount})` : ''} - AajExam`} noIndex={true} />

      <div className="container mx-auto px-6 py-12 max-w-4xl space-y-10 mt-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight flex items-center gap-4 justify-center lg:justify-start">
              Inbox {unreadCount > 0 && <span className="bg-primary-500 text-white text-xs px-3 py-1 rounded-full">{unreadCount}</span>}
            </h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Academy and Achievement pings</p>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && <Button variant="ghost" size="sm" className="text-[10px] font-black tracking-widest" onClick={markAllRead}>MARK ALL READ</Button>}
            {notifications.length > 0 && <Button variant="ghost" size="sm" className="text-[10px] font-black tracking-widest text-red-500 hover:text-red-600" onClick={clearAll}>CLEAR ALL</Button>}
          </div>
        </div>

        <Card className="p-2 lg:p-4 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 lg:py-8 text-center space-y-3 lg:space-y-6">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto opacity-50">
                  <Inbox className="w-10 h-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">Inbox Empty</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">You&apos;re all caught up with your academic updates!</p>
                </div>
              </motion.div>
            ) : (
              <div className="divide-y-2 divide-slate-50 dark:divide-slate-800">
                {notifications.map((n, idx) => (
                  <motion.div
                    key={n.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group relative p-6 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex gap-6 items-start ${!n.isRead ? 'bg-primary-500/5' : ''}`}
                  >
                    <div className={`p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm transition-transform group-hover:scale-110 ${!n.isRead ? 'border-2 border-primary-500/20 shadow-primary-500/10' : ''}`}>
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {n.title && <h4 className={`text-sm font-black uppercase tracking-tight ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-gray-500'}`}>{n.title}</h4>}
                        {!n.isRead && <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />}
                      </div>
                      <p className={`text-xs font-bold leading-relaxed ${!n.isRead ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}>{n.message}</p>
                      <div className="flex items-center gap-2 pt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()} â€¢ {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                      {!n.isRead && <button onClick={() => markRead(n.id)} className="p-2 text-primary-500 hover:bg-primary-500/10 rounded-xl transition-colors"><Eye className="w-4 h-4" /></button>}
                      <button onClick={() => deleteOne(n.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
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

