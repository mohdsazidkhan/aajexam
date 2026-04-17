'use client';
import React, { useState, useEffect } from 'react';
import { StickyNote, Bookmark, Eye, Search, BookOpen, Hash, Sparkles, Calculator } from 'lucide-react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';

const noteTypes = ['all', 'notes', 'formulas', 'shortcuts', 'important_points', 'tables', 'mnemonics'];
const typeIcons = { notes: BookOpen, formulas: Calculator, shortcuts: Sparkles, important_points: Hash, tables: StickyNote, mnemonics: Sparkles };

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
        const params = new URLSearchParams({ page, limit: 20 });
        if (type !== 'all') params.set('type', type);
        if (search) params.set('search', search);
        const res = await API.request(`/api/notes?${params}`);
        if (res?.success) { setNotes(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [type, page, search]);

  if (loading && notes.length === 0) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  return (
    <div className="min-h-screen pb-24">
      <Head><title>Notes & Formulas - AajExam</title></Head>
      <div className="container mx-auto py-0 lg:py-6">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><StickyNote className="w-6 h-6 text-primary-500" /> Notes & Formulas</h1>
          <p className="text-sm font-bold text-slate-400">Quick revision notes for all subjects</p>
        </div>

        <div className="my-2 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search notes..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {noteTypes.map(t => (
            <button key={t} onClick={() => { setType(t); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-colors ${type === t ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{t.replace('_', ' ')}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notes.map((note, i) => (
            <Card key={note._id || i} className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500"
              onClick={() => router.push(`/notes/${note.slug}`)}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[9px] font-black text-primary-600 uppercase">{note.noteType?.replace('_', ' ')}</span>
                  {note.difficulty && <span className="text-[9px] font-bold text-slate-400 capitalize">{note.difficulty}</span>}
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">{note.title}</h3>
                {note.subject?.name && <p className="text-[10px] font-bold text-slate-400">{note.subject.name}{note.topic?.name ? ` > ${note.topic.name}` : ''}</p>}
                <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{note.views}</span>
                  <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" />{note.bookmarks}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {notes.length === 0 && <div className="text-center py-12"><p className="text-slate-400 font-bold">No notes found</p></div>}

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

export default NotesPage;
