'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layers, BrainCircuit, HelpCircle, ChevronRight, Search } from 'lucide-react';
import API from '../../lib/api';
import Loading from '../Loading';

const TopicListPage = () => {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.getAllTopics().then(res => { if (res.success) setTopics(res.data || []); }).finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? topics.filter(t => t.name.toLowerCase().includes(search.trim().toLowerCase()) || t.subject?.name?.toLowerCase().includes(search.trim().toLowerCase()))
    : topics;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="lg" /></div>;

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase">Topics</h1>
          <span className="text-xs font-bold text-slate-400">{filtered.length} topics</span>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search topics..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-200 dark:border-slate-700" />
        </div>

        <div className="space-y-3">
          {filtered.map(topic => (
            <div key={topic._id} onClick={() => router.push(`/topics/${topic._id}`)}
              className="flex items-center gap-2 lg:gap-4 p-2 lg:p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-cyan-500 transition-all shadow-sm">
              <div className="w-6 lg:w-12 h-6 lg:h-12 rounded-lg lg:rounded-xl text-white bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{topic.name}</p>
                <p className="text-xs text-slate-400">{topic.subject?.name || ''}{topic.subject?.exam?.name ? ` · ${topic.subject.exam.name}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">{topic.quizCount || 0} Quiz</span>
                <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded-lg">{topic.questionCount || 0} Q</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>
          ))}
          {filtered.length === 0 && <div className="py-16 text-center"><p className="text-sm text-slate-400">No topics found</p></div>}
        </div>
      </div>
    </div>
  );
};

export default TopicListPage;
