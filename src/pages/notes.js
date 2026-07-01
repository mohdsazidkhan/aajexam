'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { StickyNote, Bookmark, Eye, Search, BookOpen, Hash, Sparkles, Calculator, ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sh = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />
);

const NotesSkeleton = () => (
  <div className="space-y-6 lg:space-y-10 pb-10 font-outfit">
    <Sh className="h-40 lg:h-52 w-full rounded-[2.5rem]" />
    <div className="flex gap-2 px-1">{[1,2,3,4].map(i => <Sh key={i} className="h-10 w-28 rounded-full" />)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 border-b-8 p-5 space-y-3">
          <div className="flex gap-3">
            <Sh className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2"><Sh className="h-4 w-3/4 rounded-lg" /><Sh className="h-2.5 w-1/2 rounded-full" /></div>
          </div>
          <div className="flex gap-2"><Sh className="h-7 w-20 rounded-xl" /><Sh className="h-7 w-16 rounded-xl" /></div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Note type config ──────────────────────────────────────────────────────────
const noteTypeConfig = {
  notes:            { icon: BookOpen,   color: 'from-blue-500 to-blue-700',    chip: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100',    label: 'Notes' },
  formulas:         { icon: Calculator, color: 'from-violet-500 to-violet-700', chip: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border-violet-100', label: 'Formulas' },
  shortcuts:        { icon: Zap,        color: 'from-amber-500 to-amber-700',   chip: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-100', label: 'Shortcuts' },
  important_points: { icon: Hash,       color: 'from-red-500 to-red-700',       chip: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-100',        label: 'Key Points' },
  tables:           { icon: StickyNote, color: 'from-teal-500 to-teal-700',    chip: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border-teal-100',    label: 'Tables' },
  mnemonics:        { icon: Sparkles,   color: 'from-pink-500 to-pink-700',    chip: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 border-pink-100',    label: 'Mnemonics' },
};
const defaultNoteType = { icon: StickyNote, color: 'from-slate-400 to-slate-600', chip: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border-slate-200', label: 'Note' };

const noteFilters = [
  { id: 'all', label: 'All Notes', icon: Sparkles },
  ...Object.entries(noteTypeConfig).map(([id, c]) => ({ id, label: c.label, icon: c.icon }))
];

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 30 });
        if (type !== 'all') params.set('type', type);
        if (search) params.set('search', search);
        const res = await API.request(`/api/notes?${params}`);
        if (res?.success) { setNotes(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [type, page, search]);

  const filtered = useMemo(() => notes, [notes]);

  if (loading && notes.length === 0) return <NotesSkeleton />;

  return (
    <div className="space-y-6 lg:space-y-10 animate-fade-in bg-transparent font-outfit pb-10">
      <Seo title="Free Notes & Formulas – Quick Revision for Government Exams | AajExam"
        description="Quick revision notes, formulas, shortcuts and mnemonics for SSC, UPSC, Banking and Railway exams."
        canonical="/notes"
        schemas={generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Notes & Formulas', url: '/notes' }])} />

      {/* ── Hero ── */}
      <section className="relative rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-2xl border-b-8 border-violet-600/20 dark:border-violet-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-600 to-violet-500 dark:from-slate-900 dark:via-violet-900/40 dark:to-slate-900" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/30">
            <TrendingUp className="w-3.5 h-3.5" /> {notes.length} Notes Available
          </motion.div>
          <h1 className="text-2xl lg:text-5xl font-black uppercase leading-tight text-white tracking-tighter">Notes Hub</h1>
          <div className="w-full max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search notes, formulas..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border-none" />
            </div>
          </div>
        </div>
        <StickyNote className="absolute -bottom-10 -right-10 w-80 h-80 text-white/10 rotate-12 pointer-events-none" />
      </section>

      {/* ── Filters ── */}
      <section className="space-y-4">
        <div className="sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {noteFilters.map(f => (
              <button key={f.id} onClick={() => { setType(f.id); setPage(1); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-4 active:translate-y-0.5 ${
                  type === f.id
                    ? 'bg-violet-500 text-white border-violet-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                <f.icon className="w-3.5 h-3.5" /> {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pt-2">
          {filtered.map((note, idx) => {
            const cfg = noteTypeConfig[note.noteType] || defaultNoteType;
            const Icon = cfg.icon;
            return (
              <motion.div key={note._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <Card hoverable onClick={() => router.push(`/notes/${note.slug}`)}
                  className="group p-5 flex flex-col gap-4 border-border-primary hover:border-violet-500 transition-all rounded-[1.5rem] bg-background-surface shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-content-primary tracking-tight line-clamp-2 leading-tight">{note.title}</h3>
                        {note.subject?.name && (
                          <p className="text-[10px] font-bold text-content-muted uppercase mt-0.5">
                            {note.subject.name}{note.topic?.name ? ` › ${note.topic.name}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>

                  {/* Stat chips */}
                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border ${cfg.chip}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase bg-slate-50 dark:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                      <Eye className="w-3 h-3" />
                      {note.views || 0}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800/50">
                      <Bookmark className="w-3 h-3" />
                      {note.bookmarks || 0}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-4">
              <StickyNote className="w-20 h-20 text-slate-200 mx-auto" />
              <h3 className="text-xl font-black text-slate-400 uppercase">No notes found</h3>
              <button onClick={() => { setType('all'); setSearch(''); }}
                className="px-6 py-2.5 bg-violet-500 text-white rounded-full font-black text-xs uppercase">View All</button>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-6">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-b-4 rounded-xl text-sm font-black disabled:opacity-30">Prev</button>
            <span className="text-sm font-black text-slate-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-b-4 rounded-xl text-sm font-black disabled:opacity-30">Next</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default NotesPage;
