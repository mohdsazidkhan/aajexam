'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, BookMarked, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../lib/api';
import Loading from '../Loading';

const SubjectDetailPage = ({ resolvedId, initialSubject } = {}) => {
  const router = useRouter();
  const lookupId = resolvedId || router.query.id;
  const [subject, setSubject] = useState(initialSubject || null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lookupId) return;
    API.getSubjectDetail(lookupId).then(res => {
      if (res.success) { setSubject(res.subject); setQuizzes(res.quizzes || []); }
    }).finally(() => setLoading(false));
  }, [lookupId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="lg" /></div>;
  if (!subject) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Subject not found</p></div>;

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-primary-600 mb-4 font-bold"><ArrowLeft className="w-4 h-4" /> Back</button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white mb-5">
          <BookMarked className="w-8 h-8 mb-2" />
          <h1 className="text-xl lg:text-3xl font-black uppercase">{subject.name}</h1>
          {subject.description && <p className="text-sm opacity-80 mt-1">{subject.description}</p>}
          <div className="flex gap-3 mt-3">
            <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg"><BrainCircuit className="w-3 h-3 inline mr-1" />{quizzes.length} Quizzes</span>
          </div>
        </div>

        {/* Quizzes */}
        <div className="space-y-3">
          {quizzes.length === 0 ? <div className="py-16 text-center"><BrainCircuit className="w-12 h-12 text-slate-200 mx-auto mb-2" /><p className="text-sm text-slate-400">No quizzes yet</p></div> : quizzes.map((quiz, idx) => (
            <motion.div key={quiz._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              onClick={() => router.push(`/quiz/${quiz.slug}`)}
              className="flex items-center gap-2 lg:gap-4 p-2 lg:p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0"><BrainCircuit className="w-5 h-5 text-white" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{quiz.title}</p>
                <p className="text-xs text-slate-400">{quiz.topic?.name || ''}{quiz.applicableExams?.length ? ` · ${quiz.applicableExams.map(e => e.name).join(', ')}` : ''} · {quiz.duration} min · {quiz.totalMarks} marks</p>
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg uppercase">Start</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectDetailPage;
