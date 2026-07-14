'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, Bell, CreditCard,
  BarChart2, Key, Users, AlertTriangle, Megaphone, Clock,
  ExternalLink, MapPin, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Seo from '../components/Seo';

// ─── Type Config (matches exam-news.js style) ──────────────────────────────────
const typeConfig = {
  notification: { icon: Bell, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', label: 'Notification', border: 'border-blue-200 dark:border-blue-800/50' },
  admit_card:   { icon: CreditCard, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Admit Card', border: 'border-emerald-200 dark:border-emerald-800/50' },
  result:       { icon: BarChart2, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', dot: 'bg-orange-500', label: 'Result', border: 'border-orange-200 dark:border-orange-800/50' },
  answer_key:   { icon: Key, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', dot: 'bg-purple-500', label: 'Answer Key', border: 'border-purple-200 dark:border-purple-800/50' },
  vacancy:      { icon: Users, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400', dot: 'bg-pink-500', label: 'Vacancy', border: 'border-pink-200 dark:border-pink-800/50' },
  date_change:  { icon: AlertTriangle, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', dot: 'bg-red-500', label: 'Date Change', border: 'border-red-200 dark:border-red-800/50' },
  syllabus:     { icon: Megaphone, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400', dot: 'bg-teal-500', label: 'Syllabus', border: 'border-teal-200 dark:border-teal-800/50' },
  other:        { icon: Megaphone, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400', dot: 'bg-slate-400', label: 'Other', border: 'border-slate-200 dark:border-slate-700' },
};
const getType = (t) => typeConfig[t] || typeConfig.other;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg ${className}`} />
);
const CalendarSkeleton = () => (
  <div className="space-y-4">
    <Sh className="h-48 lg:h-52 w-full rounded-[2.5rem]" />
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 35 }).map((_, i) => <Sh key={i} className="h-12 sm:h-14 rounded-xl" />)}
    </div>
  </div>
);

// ─── Event pill (small, for calendar cells) ───────────────────────────────────
const EventDot = ({ event }) => {
  const cfg = getType(event.type);
  return (
    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${cfg.dot} flex-shrink-0`} title={event.label} />
  );
};

// ─── Event Card (upcoming list & day detail) ──────────────────────────────────
const EventCard = ({ event, compact = false }) => {
  const cfg = getType(event.type);
  const Icon = cfg.icon;
  const dateStr = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (compact) {
    return (
      <Link href={`/exam-news/${event.examNewsSlug}`}>
        <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${cfg.border} ${cfg.color} transition-all hover:opacity-80 group`}>
          <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black truncate leading-tight">{event.label}</p>
            <p className="text-[10px] font-bold opacity-70 truncate">{event.examName || event.examNewsTitle}</p>
          </div>
          <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-70 transition-opacity mt-0.5" />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/exam-news/${event.examNewsSlug}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 border-b-4 ${cfg.border} bg-background-surface hover:border-opacity-80 transition-all group cursor-pointer`}
      >
        <div className={`w-9 h-9 rounded-xl ${cfg.color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-content-primary leading-tight line-clamp-2">{event.label}</p>
          {(event.examName || event.examNewsTitle) && (
            <p className="text-[11px] font-bold text-content-muted mt-0.5 truncate">
              {event.examName || event.examNewsTitle}
            </p>
          )}
          <div className="flex items-center gap-1 mt-1.5">
            <Clock className="w-3 h-3 text-content-muted" />
            <span className="text-[10px] font-bold text-content-muted">{dateStr}</span>
            <span className={`ml-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-border-secondary group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </motion.div>
    </Link>
  );
};

// ─── Day Detail Panel ─────────────────────────────────────────────────────────
const DayPanel = ({ date, events, onClose }) => {
  if (!date || !events?.length) return null;
  const dateLabel = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="mt-4"
      >
        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-black text-content-primary">{dateLabel}</span>
              <span className="text-[10px] font-black uppercase bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                {events.length} event{events.length > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-content-muted hover:text-content-primary transition-colors text-[10px] font-black uppercase"
            >
              Close
            </button>
          </div>
          <div className="p-4 space-y-2.5">
            {events.map((ev, i) => (
              <EventCard key={i} event={ev} />
            ))}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ExamCalendarPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
  const [events, setEvents] = useState({});   // { 'YYYY-MM-DD': [...] }
  const [upcoming, setUpcoming] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showUpcoming, setShowUpcoming] = useState(true);

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      setSelectedDate(null);
      const res = await API.request(`/api/exam-news/calendar?month=${month}&year=${year}`);
      if (res?.success) {
        setEvents(res.events || {});
        setUpcoming(res.upcoming || []);
        setTotalEvents(res.totalEvents || 0);
      }
    } catch (e) {
      console.error('Calendar fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  // Navigate month
  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const goToday = () => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()); };

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null); // empty leading cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, eventsForDay: events[dateStr] || [] });
  }

  const selectedEvents = selectedDate ? (events[selectedDate] || []) : [];

  if (loading) return <CalendarSkeleton />;

  return (
    <div className="min-h-screen pb-20 font-outfit">
      <Seo
        title="Exam Calendar – Important Dates & Deadlines | AajExam"
        description="Track all government exam important dates — admit cards, results, vacancies, notifications — on AajExam's Exam Calendar."
        canonical="/exam-calendar"
        noIndex={false}
      />

      <div className="space-y-5 lg:space-y-8">

        {/* ── Hero ── */}
        <section className="relative rounded-[2rem] lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-12 overflow-hidden shadow-2xl border-b-8 border-teal-600/20 dark:border-teal-900/30">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-600 dark:from-teal-900 dark:via-emerald-900/70 dark:to-slate-900" />
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
          <CalendarDays className="absolute -bottom-8 -right-8 w-56 h-56 text-white/10 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white/20 border border-white/30 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-3"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {totalEvents} events this month
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight leading-tight"
              >
                Exam Calendar
              </motion.h1>
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mt-1">Important Dates at a Glance</p>
            </div>

            {/* Type legend */}
            <div className="flex flex-wrap gap-2">
              {['admit_card', 'result', 'vacancy', 'notification'].map(t => {
                const cfg = getType(t);
                return (
                  <div key={t} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className="text-[10px] font-black text-white uppercase">{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Month Navigation ── */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prevMonth}
            className="flex items-center gap-1 px-3 sm:px-4 py-2.5 rounded-xl font-black text-[11px] uppercase border-2 border-b-4 border-border-primary bg-background-surface text-content-primary hover:border-primary-400 dark:hover:border-primary-600 transition-all active:translate-y-0.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <div className="flex-1 text-center">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-content-primary tracking-tight">
              {MONTHS[month - 1]} {year}
            </h2>
            {(month !== now.getMonth() + 1 || year !== now.getFullYear()) && (
              <button
                onClick={goToday}
                className="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-wide mt-0.5"
              >
                Back to Today
              </button>
            )}
          </div>

          <button
            onClick={nextMonth}
            className="flex items-center gap-1 px-3 sm:px-4 py-2.5 rounded-xl font-black text-[11px] uppercase border-2 border-b-4 border-border-primary bg-background-surface text-content-primary hover:border-primary-400 dark:hover:border-primary-600 transition-all active:translate-y-0.5"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Calendar Grid ── */}
        <Card padded={false} className="overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border-primary">
            {DAYS.map(day => (
              <div key={day} className="py-2 text-center text-[10px] sm:text-[11px] font-black text-content-muted uppercase tracking-wide">
                <span className="sm:hidden">{day.charAt(0)}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-12 sm:h-16 border-b border-r border-border-primary/50 last:border-r-0 bg-background-surface/50" />;
              }
              const { day, dateStr, eventsForDay } = cell;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const hasEvents = eventsForDay.length > 0;
              const isWeekend = (idx % 7 === 0 || idx % 7 === 6);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : (hasEvents ? dateStr : null))}
                  disabled={!hasEvents}
                  className={`
                    h-12 sm:h-16 border-b border-r border-border-primary/50 last:border-r-0
                    flex flex-col items-center justify-start pt-1.5 sm:pt-2 px-0.5 sm:px-1
                    transition-all duration-150 relative group
                    ${hasEvents ? 'cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-950/20' : 'cursor-default'}
                    ${isSelected ? 'bg-primary-50 dark:bg-primary-950/30 ring-2 ring-inset ring-primary-400 dark:ring-primary-600' : ''}
                    ${isWeekend && !isToday && !isSelected ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''}
                  `}
                >
                  {/* Day number */}
                  <span className={`
                    w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[11px] sm:text-xs font-black
                    ${isToday ? 'bg-primary-500 text-white shadow-md' : 'text-content-primary'}
                    ${isWeekend && !isToday ? 'text-rose-500 dark:text-rose-400' : ''}
                  `}>
                    {day}
                  </span>

                  {/* Event dots */}
                  {hasEvents && (
                    <div className="flex items-center gap-0.5 flex-wrap justify-center mt-1 max-w-full px-0.5">
                      {eventsForDay.slice(0, 3).map((ev, i) => (
                        <EventDot key={i} event={ev} />
                      ))}
                      {eventsForDay.length > 3 && (
                        <span className="text-[8px] font-black text-content-muted">+{eventsForDay.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── Selected Day Events ── */}
        <DayPanel
          date={selectedDate}
          events={selectedEvents}
          onClose={() => setSelectedDate(null)}
        />

        {/* ── Upcoming Events (next 30 days) ── */}
        {upcoming.length > 0 && (
          <section className="space-y-3">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setShowUpcoming(v => !v)}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                <h2 className="text-base sm:text-lg font-black text-content-primary uppercase tracking-tight">
                  Upcoming (Next 30 Days)
                </h2>
                <span className="text-[10px] font-black bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                  {upcoming.length}
                </span>
              </div>
              {showUpcoming
                ? <ChevronUp className="w-4 h-4 text-content-muted" />
                : <ChevronDown className="w-4 h-4 text-content-muted" />
              }
            </button>

            <AnimatePresence>
              {showUpcoming && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 overflow-hidden"
                >
                  {upcoming.map((ev, i) => (
                    <motion.div
                      key={`${ev.date}-${i}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <EventCard event={ev} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Empty state */}
        {totalEvents === 0 && upcoming.length === 0 && (
          <div className="py-16 text-center space-y-4">
            <CalendarDays className="w-16 h-16 sm:w-20 sm:h-20 text-slate-200 dark:text-slate-700 mx-auto" />
            <h3 className="text-lg font-black text-content-muted uppercase">No events this month</h3>
            <p className="text-sm text-content-muted font-bold">Check back later or navigate to another month.</p>
            <Link href="/exam-news">
              <button className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-full font-black text-xs uppercase mt-2 transition-colors">
                View Exam News
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCalendarPage;
