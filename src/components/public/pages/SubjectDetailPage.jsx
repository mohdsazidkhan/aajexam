'use client';
import BackButton from '@/components/common/ui/BackButton';
import { useEffect, useState } from 'react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { ArrowLeft, BookMarked, BrainCircuit, ChevronRight, HelpCircle, Clock, BarChart2 } from 'lucide-react';
import { m as motion } from 'framer-motion';
import API from '../../../lib/api';
import { SubjectDetailSkeleton } from '../../common/skeletons/PublicSkeletons';
import Card from '../../common/ui/Card';
import Pagination from '../../common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useTranslate from '../../../hooks/useTranslate';

const diffChip = (d) => {
  if (d === 'easy') return 'text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800/50';
  return 'text-black dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 dark:border-white/50';
};

const SubjectDetailPage = ({ resolvedId, initialSubject } = {}) => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const lookupId = resolvedId || router.query.id;
  const [subject, setSubject] = useState(initialSubject || null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (!lookupId) return;
    API.getSubjectDetail(lookupId).then(res => {
      if (res.success) { setSubject(res.subject); setQuizzes(res.quizzes || []); }
    }).finally(() => setLoading(false));
  }, [lookupId]);

  const totalPages = Math.max(1, Math.ceil(quizzes.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = quizzes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <SubjectDetailSkeleton />;
  if (!subject) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">{translate('Subject not found')}</p></div>;

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <div className="py-0 xl:py-6">
        <div className="hidden xl:flex justify-end mb-4"><BackButton onClick={() => router.back()}><ArrowLeft className="w-4 h-4" /> {translate('Back')}</BackButton></div>

        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white shadow-xl ring-1 ring-slate-200 dark:ring-white/10 p-5 xl:p-6 mb-5" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '18px 18px' }} />
          <div className="pointer-events-none absolute -bottom-24 right-6 w-72 h-72 bg-primary-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
          <div className="relative">
          <BookMarked className="w-8 h-8 mb-2 text-slate-600 dark:text-primary-300" />
          <h1 className="text-xl xl:text-3xl font-black uppercase">{translateData(subject.name)}</h1>
          {subject.description && <p className="text-sm opacity-80 mt-1">{subject.description}</p>}
          <div className="flex gap-3 mt-3">
            <span className="text-xs font-bold bg-white/80 dark:bg-white/15 ring-1 ring-slate-200 dark:ring-white/25 px-3 py-1.5 rounded-lg"><BrainCircuit className="w-3 h-3 inline mr-1" />{translate('{count} Quizzes', { count: quizzes.length })}</span>
          </div>
          </div>
        </div>

        {/* Quizzes */}
        {quizzes.length === 0 ? (
          <div className="py-16 text-center"><BrainCircuit className="w-12 h-12 text-slate-200 mx-auto mb-2" /><p className="text-sm text-slate-400">{translate('No quizzes yet')}</p></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
              {pageItems.map((quiz, idx) => (
                <motion.div key={quiz._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Link href={`/quiz/${quiz.slug}`} className="block">
                    <Card hoverable
                      className="group flex flex-col gap-4 border-slate-200 dark:border-slate-800 hover:border-primary-700 transition-all rounded-[1.5rem] bg-background-surface shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs xl:text-base font-black tabular-nums">
                            {(currentPage - 1) * pageSize + idx + 1}
                          </div>
                          <div>
                            <h2 className="text-base font-black text-content-primary uppercase tracking-tight line-clamp-2 leading-tight">{translateData(quiz.title)}</h2>
                            {quiz.topic?.name && <p className="text-[10px] font-bold text-content-muted uppercase">{translateData(quiz.topic.name)}</p>}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                      </div>

                      {quiz.applicableExams?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {quiz.applicableExams.slice(0, 2).map((e) => (
                            <span key={e._id || e.name} className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{e.name}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                          <HelpCircle className="w-3 h-3" />
                          {quiz.totalMarks || 0} {translate('marks')}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                          <Clock className="w-3 h-3" />
                          {translate('{count} min', { count: quiz.duration || 0 })}
                        </div>
                        {quiz.difficulty && (
                          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg xl:rounded-xl border ${diffChip(quiz.difficulty)}`}>
                            <BarChart2 className="w-3 h-3" />
                            {quiz.difficulty}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="pt-6"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} totalItems={quizzes.length} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubjectDetailPage;
