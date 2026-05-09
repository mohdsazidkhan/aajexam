'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { BrainCircuit, Search } from 'lucide-react';
import API from '../../lib/api';
import Loading from '../Loading';
import { ProBadge } from '../ui';

const QuizListPage = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    API.getQuizzes({ page, limit: 20 }).then(res => {
      if (res.success) { setQuizzes(res.data || []); setTotalPages(res.pagination?.totalPages || 1); setTotalCount(res.pagination?.total || res.data?.length || 0); }
    }).finally(() => setLoading(false));
  }, [page]);

  const filtered = search.trim()
    ? quizzes.filter(q => q.title?.toLowerCase().includes(search.trim().toLowerCase()) || q.subject?.name?.toLowerCase().includes(search.trim().toLowerCase()) || q.topic?.name?.toLowerCase().includes(search.trim().toLowerCase()))
    : quizzes;

  const diffColor = (d) => d === 'easy' ? 'text-green-600 bg-green-50' : d === 'hard' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50';

  if (loading && page === 1) return <div className="min-h-screen flex items-center justify-center"><Loading size="lg" /></div>;

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase">Quizzes</h1>
          <span className="text-xs font-bold text-slate-400">{totalCount} quizzes</span>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search quizzes..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-200 dark:border-slate-700" />
        </div>

        <div className="flex flex-col gap-1.5 lg:gap-3">
          {filtered.map(quiz => (
            <div key={quiz._id} onClick={() => router.push(`/quiz/${quiz.slug}`)}
              className="flex items-center gap-2 lg:gap-4 p-2 lg:p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition-all shadow-sm">
              <div className="w-6 lg:w-12 h-6 lg:h-12 rounded-lg lg:rounded-xl text-white bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{quiz.title}</p>
                <p className="text-xs text-slate-400">{quiz.subject?.name || ''}{quiz.topic?.name ? ` · ${quiz.topic.name}` : ''} · {quiz.duration} min · {quiz.totalMarks} marks</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {quiz.accessLevel === 'pro' && <ProBadge size="xs" />}
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg capitalize ${diffColor(quiz.difficulty)}`}>{quiz.difficulty}</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2 rounded-lg uppercase">Start</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-16 text-center"><p className="text-sm text-slate-400">No quizzes found</p></div>}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-6">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Prev</button>
            <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;
