'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, Bell, CreditCard,
  BarChart2, Key, Users, AlertTriangle, Megaphone, Clock,
  ExternalLink, MapPin, ChevronDown, ChevronUp
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from '@/components/common/AppLink';
import API from '../../lib/api';
import useTargetExamsVersion from '../../hooks/useTargetExamsVersion';
import Card from '../../components/common/ui/Card';
import PageHero from '../../components/common/ui/PageHero';
import Seo from '../../components/common/Seo';
import useTranslate from '../../hooks/useTranslate';
import useRequireLogin from '../../hooks/useRequireLogin';

// ─── Type Config (matches exam-news.js style) ──────────────────────────────────
const typeConfig = {
  notification: { icon: Bell, color:'bg-background-surface-secondary text-content-primary', dot:'bg-primary-600', label:'Notification', border:'border-border-primary'},
  admit_card:   { icon: CreditCard, color: 'text-primary-600', dot: 'bg-primary-600', label: 'Admit Card', border: 'border-primary-200 dark:border-primary-800/50' },
  result: { icon: BarChart2, color:'bg-background-surface-secondary text-content-primary', dot:'bg-primary-600', label:'Result', border:'border-border-primary'},
  answer_key: { icon: Key, color:'bg-background-surface-secondary text-content-primary', dot:'bg-primary-600', label:'Answer Key', border:'border-border-primary'},
  vacancy: { icon: Users, color:'bg-background-surface-secondary text-content-primary', dot:'bg-primary-600', label:'Vacancy', border:'border-border-primary'},
  date_change: { icon: AlertTriangle, color:'bg-background-surface-secondary text-content-primary', dot:'bg-primary-600', label:'Date Change', border:'border-border-primary'},
  syllabus: { icon: Megaphone, color:'bg-background-surface-secondary text-content-primary', dot:'bg-primary-600', label:'Syllabus', border:'border-border-primary'},
  other:        { icon: Megaphone, color: 'bg-background-surface-secondary text-content-secondary', dot: 'bg-border-secondary', label: 'Other', border: 'border-border-primary' },
};
const getType = (t) => typeConfig[t] || typeConfig.other;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-primary-500/15 dark:bg-primary-500/20 rounded-lg ${className}`} />
);
const CalendarSkeleton = () => (
  <div className="space-y-2 xl:space-y-4">
    <Sh className="h-48 xl:h-52 w-full rounded-2xl" />
    <div className="flex gap-2">
      {Array.from({ length: 10 }).map((_, i) => <Sh key={i} className="shrink-0 w-14 sm:w-16 h-20 sm:h-24 rounded-2xl" />)}
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
  const { translate, locale } = useTranslate();
  const cfg = getType(event.type);
  const Icon = cfg.icon;
  const dateStr = new Date(event.date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  if (compact) {
    return (
      <Link href={`/exam-news/${event.examNewsSlug}`}>
        <div className={`flex items-start gap-2.5 p-3 rounded-lg xl:rounded-xl border ${cfg.border} ${cfg.color} transition-all hover:opacity-80 group`}>
          <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold truncate leading-tight">{event.label}</p>
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
        style={{ borderRadius: 'var(--radius)' }} className="relative overflow-hidden flex items-start gap-3 p-3.5 pl-4 border border-border-primary bg-background-surface hover:-translate-y-0.5 transition-all group cursor-pointer"
      >
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-content-primary leading-tight line-clamp-2">{event.label}</p>
          {(event.examName || event.examNewsTitle) && (
            <p className="text-base font-bold text-content-primary mt-0.5">
              {event.examName || event.examNewsTitle}
            </p>
          )}
          <div className="flex items-center gap-1 mt-1.5">
            <Clock className="w-3 h-3 text-content-muted" />
            <span className="text-[10px] font-bold text-content-muted">{dateStr}</span>
            <span className="ml-1 text-[9px] font-bold uppercase px-2 py-0.5 text-on-primary bg-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
              {translate(cfg.label)}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-border-secondary group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </motion.div>
    </Link>
  );
};

// ─── Day Detail Panel ─────────────────────────────────────────────────────────
const DayPanel = ({ date, events, onClose }) => {
  const { translate, locale } = useTranslate();
  if (!date || !events?.length) return null;
  const dateLabel = new Date(date).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="mt-4"
      >
        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 text-content-primary border-b border-border-primary dark:border-transparent bg-background-surface">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}><CalendarDays className="w-4 h-4" /></span>
              <span className="text-sm font-bold">{dateLabel}</span>
              <span className="text-[10px] font-bold uppercase text-on-primary px-2 py-0.5 rounded-full bg-primary-600">
                {events.length} event{events.length > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-primary-800/70 dark:text-white/70 hover:text-primary-900 dark:hover:text-white transition-colors text-[10px] font-bold uppercase"
            >
              {translate('Close')}
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-2.5">
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
  useRequireLogin();
  const { translate, locale } = useTranslate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
  const [events, setEvents] = useState({});   // { 'YYYY-MM-DD': [...] }
  const [upcoming, setUpcoming] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const todayChipRef = React.useRef(null);
  const targetVersion = useTargetExamsVersion();

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      setSelectedDate(null);
      const { examIds } = API.withTargetExams({});
      const res = await API.request(`/api/exam-news/calendar?month=${month}&year=${year}${examIds ? `&examIds=${examIds}` : ''}`);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, targetVersion]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  // Scroll the today chip into view whenever the visible month changes
  useEffect(() => {
    if (loading) return;
    todayChipRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [loading, month, year]);

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
        canonical="/student/exam-calendar"
        noIndex={true}
      />

      <div className="space-y-5 xl:space-y-8 pt-3 xl:pt-4">

        {/* ── Hero ── */}
        <PageHero
          icon={CalendarDays}
          eyebrow={translate('Exam Calendar')}
          title={translate('Exam Calendar')}
          badge={translate('{count} events this month', { count: totalEvents })}
          actions={
            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full">
              {['admit_card', 'result', 'vacancy', 'notification'].map(typeKey => {
                const cfg = getType(typeKey);
                return (
                  <div key={typeKey} className="flex items-center gap-1.5 ring-1 ring-slate-200 dark:ring-white/20 px-2.5 py-1 shrink-0 whitespace-nowrap" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className="text-[10px] font-bold text-content-primary uppercase">{translate(cfg.label)}</span>
                  </div>
                );
              })}
            </div>
          }
        >
          <div className="space-y-3 border-t border-dashed border-border-primary pt-4">
        {/* ── Month Navigation ── */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prevMonth}
            aria-label={translate('Previous month')}
            style={{ borderRadius: 'var(--radius-sm)' }} className="flex items-center gap-1 px-3 sm:px-4 py-2.5 font-bold text-[11px] uppercase border border-border-primary bg-background-surface text-content-primary hover:border-primary-500 transition-all active:translate-y-0.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{translate('Prev')}</span>
          </button>

          <section className="flex-1 text-center">
            <h2 className="text-lg sm:text-xl xl:text-2xl font-bold font-outfit text-primary-600 tracking-tight">
              {translate(MONTHS[month - 1])} {year}
            </h2>
            {(month !== now.getMonth() + 1 || year !== now.getFullYear()) && (
              <button
                onClick={goToday}
                className="text-[10px] font-bold text-primary-600 hover:text-primary-600 uppercase tracking-wide mt-0.5"
              >
                {translate('Back to Today')}
              </button>
            )}
          </section>

          <button
            onClick={nextMonth}
            aria-label={translate('Next month')}
            style={{ borderRadius: 'var(--radius-sm)' }} className="flex items-center gap-1 px-3 sm:px-4 py-2.5 font-bold text-[11px] uppercase border border-border-primary bg-background-surface text-content-primary hover:border-primary-500 transition-all active:translate-y-0.5"
          >
            <span className="hidden sm:inline">{translate('Next')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Calendar Strip (single scrollable row) ── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {cells.filter(Boolean).map(cell => {
            const { day, dateStr, eventsForDay } = cell;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const hasEvents = eventsForDay.length > 0;
            const dayName = new Date(year, month - 1, day).toLocaleDateString(locale, { weekday: 'short' });

            return (
              <button
                key={dateStr}
                ref={isToday ? todayChipRef : null}
                onClick={() => setSelectedDate(isSelected ? null : (hasEvents ? dateStr : null))}
                disabled={!hasEvents}
                className={`
                  shrink-0 w-14 sm:w-16 py-2.5 sm:py-3 border 
                  flex flex-col items-center justify-center gap-1
                  transition-all duration-150
                  ${hasEvents ? 'cursor-pointer' : 'cursor-default opacity-60'}
                  ${isToday
                    ? 'border-primary-400 bg-primary-600'
                    : isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30'
                      : 'bg-background-surface border-border-primary hover:border-primary-300 dark:hover:border-primary-700'}
                `}
                style={{ borderRadius: 'var(--radius)' }}
              >
                <span className={`text-[9px] font-bold uppercase tracking-wide ${isToday ? 'text-on-primary' : 'text-content-muted'}`}>
                  {dayName}
                </span>
                <span className={`text-base sm:text-lg font-bold ${isToday ? 'text-on-primary' : 'text-content-primary'}`}>
                  {day}
                </span>
                <div className="flex items-center gap-1 h-1.5">
                  {hasEvents && (
                    <>
                      <EventDot event={eventsForDay[0]} />
                      <span className={`text-[8px] font-bold ${isToday ? 'text-on-primary' : 'text-content-muted'}`}>{eventsForDay.length}</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

          </div>
        </PageHero>

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
                <span className="w-8 h-8 flex items-center justify-center text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}><Clock className="w-4 h-4" /></span>
                <h2 className="text-base sm:text-lg font-bold text-content-primary tracking-tight">
                  {translate('Upcoming (Next 30 Days)')}
                </h2>
                <span className="text-[10px] font-bold text-on-primary px-2 py-0.5 rounded-full bg-primary-600">
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
                  className="grid grid-cols-1 xl:grid-cols-3 gap-2.5 overflow-hidden"
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
          <div className="py-16 text-center space-y-2 xl:space-y-4">
            <CalendarDays className="w-16 h-16 sm:w-20 sm:h-20 text-slate-200 dark:text-slate-700 mx-auto" />
            <h3 className="text-lg font-bold text-content-muted">{translate('No events this month')}</h3>
            <p className="text-sm text-content-muted font-bold">{translate('Check back later or navigate to another month.')}</p>
            <Link href="/exam-news">
              <button className="px-6 py-2.5 text-on-primary hover:brightness-105 rounded-full font-bold text-xs uppercase mt-2 transition-all bg-primary-600">
                {translate('View Exam News')}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCalendarPage;
