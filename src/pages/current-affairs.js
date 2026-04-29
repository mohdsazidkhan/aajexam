'use client';
import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, Tag, Eye, ChevronRight, Search, X } from 'lucide-react';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../components/datepicker-custom.css';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const categories = ['all', 'national', 'international', 'economy', 'science', 'sports', 'awards', 'appointments', 'defence', 'environment'];

const CurrentAffairsPage = () => {
  const [affairs, setAffairs] = useState([]);
  const [todayAffairs, setTodayAffairs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 20 });
        if (category !== 'all') params.set('category', category);
        if (search.trim()) params.set('search', search.trim());
        if (selectedDate) {
          params.set('month', selectedDate.getMonth() + 1);
          params.set('year', selectedDate.getFullYear());
        }

        const [listRes, todayRes] = await Promise.all([
          API.request(`/api/current-affairs?${params}`),
          API.request('/api/current-affairs/today')
        ]);
        if (listRes?.success) { setAffairs(listRes.data || []); setTotalPages(listRes.pagination?.totalPages || 1); }
        if (todayRes?.success) setTodayAffairs(todayRes.data);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [category, page, search, selectedDate]);

  const clearFilters = () => {
    setSearch('');
    setSelectedDate(null);
    setCategory('all');
    setPage(1);
  };

  const hasFilters = search.trim() || selectedDate || category !== 'all';

  if (loading && affairs.length === 0) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  return (
    <div className="min-h-screen pb-24">
      <Seo
        title="Daily Current Affairs – Free GA & GK for Government Exams | AajExam"
        description="Daily current affairs for SSC, UPSC, Banking, Railway and State PSC exams. National, International, Economy, Sports, Awards, Appointments, Defence and Environment updates with key points and MCQs on AajExam."
        canonical="/current-affairs"
        keywords={[
          'daily current affairs',
          'current affairs MCQs',
          'general awareness',
          'GK quiz',
          'SSC current affairs',
          'banking current affairs',
          'UPSC current affairs',
          'aajexam current affairs'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Current Affairs', url: '/current-affairs' }
        ])}
      />
      <div className="container mx-auto py-4 lg:py-8 px-4 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase">Current Affairs</h1>
            <p className="text-xs font-bold text-slate-400">Daily updates for competitive exams</p>
          </div>
          <span className="text-xs font-bold text-slate-400">{affairs.length} results</span>
        </div>

        {/* Search + Date Filter */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search current affairs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-200 dark:border-slate-700" />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:flex-none lg:w-56">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
              <DatePicker
                selected={selectedDate}
                onChange={date => { setSelectedDate(date); setPage(1); }}
                dateFormat="MMM yyyy"
                showMonthYearPicker
                placeholderText="Select month..."
                isClearable={false}
                className="w-full bg-white dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-200 dark:border-slate-700"
              />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wide hover:bg-rose-100 transition-colors shrink-0">
                <X className="w-3 h-3" /> Clear
              </button>
          )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-colors ${category === cat ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>{cat}</button>
          ))}
        </div>

        {/* Today's Highlight */}
        {todayAffairs && todayAffairs.total > 0 && !search && !selectedDate && (
          <Card className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
            <h2 className="text-sm font-black text-primary-700 dark:text-primary-300 mb-2">Today - {todayAffairs.total} Updates</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(todayAffairs.grouped || {}).map(([cat, items]) => (
                <span key={cat} className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize">{cat}: {items.length}</span>
              ))}
            </div>
          </Card>
        )}

        {/* Affairs List */}
        <div className="space-y-3">
          {affairs.map((affair, i) => (
            <Card key={affair._id || i} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/current-affairs/${affair._id}`)}>
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[9px] font-black text-primary-600 uppercase">{affair.category}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(affair.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{affair.title}</h3>
                  {affair.keyPoints?.length > 0 && <p className="text-[11px] text-slate-500 line-clamp-2">{affair.keyPoints[0]}</p>}
                  <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{affair.views}</span>
                    {affair.questions?.length > 0 && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{affair.questions.length} Q</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 mt-2" />
              </div>
            </Card>
          ))}
        </div>

        {affairs.length === 0 && <div className="text-center py-12"><p className="text-slate-400 font-bold">No current affairs found</p></div>}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Prev</button>
            <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentAffairsPage;
