'use client';
import BackButton from '@/components/common/ui/BackButton';
import { useEffect, useState } from 'react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { ArrowLeft, Layers, FileText, BrainCircuit, ChevronRight, HelpCircle, Clock, Sparkles } from 'lucide-react';
import { m as motion } from 'framer-motion';
import API from '../../../lib/api';
import { TopicDetailSkeleton } from '../../common/skeletons/PublicSkeletons';
import Card from '../../common/ui/Card';
import Pagination from '../../common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useTranslate from '../../../hooks/useTranslate';

const TopicDetailPage = ({ resolvedId, initialTopic } = {}) => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const lookupId = resolvedId || router.query.id;
  const [topic, setTopic] = useState(initialTopic || null);
  const [practiceTests, setPracticeTests] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quizzes');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
  useEffect(() => { setPage(1); }, [activeTab]);

  const [generatingAdaptive, setGeneratingAdaptive] = useState(false);

  useEffect(() => {
    if (!lookupId) return;
    setLoading(true);
    const detailPromise = API.getTopicDetail(lookupId).then(res => {
      if (res.success) { setTopic(res.topic); setPracticeTests(res.practiceTests || []); setQuizzes(res.quizzes || []); }
    }).catch(console.error);

    // Fetch flashcards for this topic
    const flashcardsPromise = API.request(`/api/flashcards?topic=${lookupId}`).then(res => {
      if (res?.success) setFlashcards(res.data || []);
    }).catch(console.error);

    Promise.all([detailPromise, flashcardsPromise]).finally(() => setLoading(false));
  }, [lookupId]);

  const activeList = activeTab === 'flashcards' ? flashcards : activeTab === 'tests' ? practiceTests : quizzes;
  const totalPages = Math.max(1, Math.ceil(activeList.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = (list) => list.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const sno = (idx) => (currentPage - 1) * pageSize + idx + 1;

  if (loading) return <TopicDetailSkeleton />;
  if (!topic) return <div className="min-h-screen flex items-center justify-center"><p className="text-content-muted">{translate('Topic not found')}</p></div>;

  const tabs = [
    { key: 'quizzes', label: 'Quizzes', icon: BrainCircuit, count: quizzes.length },
    { key: 'tests', label: 'Practice Tests', icon: FileText, count: practiceTests.length },
    { key: 'flashcards', label: 'Flashcards', icon: Sparkles, count: flashcards.length },
  ];

  const handleStartAdaptive = async () => {
    if (generatingAdaptive) return;
    try {
      setGeneratingAdaptive(true);
      const res = await API.request('/api/quiz/adaptive/generate', {
        method: 'POST',
        body: JSON.stringify({ topicId: topic._id })
      });
      if (res?.success && res?.data?.quizSlug) {
        router.push(`/quiz/${res.data.quizSlug}`);
      } else {
        if (res?.isLocked) {
           router.push('/student/subscription');
        }
      }
    } catch (e) {
      console.error('Adaptive error', e);
    } finally {
      setGeneratingAdaptive(false);
    }
  };

  const fmtDur = (m) => { const h = Math.floor(m / 60); const min = m % 60; return h > 0 ? `${h}h${min > 0 ? ` ${min}m` : ''}` : `${min}m`; };

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <div className="py-0 xl:py-6">
        <div className="hidden xl:flex justify-end mb-4"><BackButton onClick={() => router.back()}><ArrowLeft className="w-4 h-4" /> {translate('Back')}</BackButton></div>

        {/* Hero */}
        <div className="relative overflow-hidden text-on-primary ring-1 ring-white/10 p-5 xl:p-6 mb-5 bg-primary-600" style={{ borderRadius: 16 }}>
          <header className="z-auto relative">
          <Layers className="w-8 h-8 mb-2 text-primary-300" />
          <h1 className="text-xl xl:text-3xl font-bold">{translateData(topic.name)}</h1>
          <p className="text-sm opacity-80 mt-1">{topic.subject?.name || ''}{topic.exams?.length ? ` · ${topic.exams.map(e => e.name).join(', ')}` : ''}</p>
          <div className="flex gap-3 mt-3">
            <span className="text-xs font-bold ring-1 ring-white/25 px-3 py-1.5 rounded-lg"><BrainCircuit className="w-3 h-3 inline mr-1" />{translate('{count} Quizzes', { count: quizzes.length })}</span>
            <span className="text-xs font-bold ring-1 ring-white/25 px-3 py-1.5 rounded-lg"><FileText className="w-3 h-3 inline mr-1" />{translate('{count} Tests', { count: practiceTests.length })}</span>
          </div>
          
          {/* Adaptive Practice Button */}
          <div className="mt-5">
            <button 
              onClick={handleStartAdaptive}
              disabled={generatingAdaptive}
              className="w-full sm:w-auto bg-background-surface text-content-primary hover:bg-background-surface-secondary font-bold text-sm uppercase tracking-[0.08em] px-6 py-3 rounded-lg xl:rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generatingAdaptive ? (
                <><div className="w-4 h-4 border border-black dark:border-white border-t-transparent rounded-full animate-spin" /> {translate('GENERATING...')}</>
              ) : (
                <><BrainCircuit className="w-5 h-5" /> {translate('START ADAPTIVE PRACTICE')} <span className="text-[10px] bg-background-surface-secondary text-content-primary px-1.5 py-0.5 rounded-md ml-1">{translate('PRO')}</span></>
              )}
            </button>
            <p className="text-[10px] font-bold text-white/80 mt-2 pl-1">{translate('Generates custom difficulty based on your past accuracy.')}</p>
          </div>
          </header>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 sticky top-16 z-20 py-3 -mx-4 px-4 border-b border-border-primary overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold uppercase text-xs border-b-2 shrink-0 ${activeTab === tab.key ?'bg-primary-600 text-on-primary border-primary-600':'bg-background-surface-secondary text-content-muted border-border-primary'}`}>
              <tab.icon className="w-3.5 h-3.5" /> {translate(tab.label)} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-black/20' : 'bg-background-surface-secondary dark:text-slate-200'}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Flashcards */}
        {activeTab === 'flashcards' && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {flashcards.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-content-muted">{translate('No flashcards available yet.')}</p>
              </div>
            ) : paged(flashcards).map((deck, idx) => (
              <motion.div key={deck._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                onClick={() => router.push(`/flashcards/${deck.slug || deck._id}`)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all border border-border-primary"
              >
                <div className="absolute inset-0 bg-primary-600 opacity-90 group-hover:opacity-100 transition-opacity"/>
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-background-surface text-content-primary w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl flex items-center justify-center text-xs xl:text-base font-bold tabular-nums">
                      {sno(idx)}
                    </span>
                    <span className="bg-background-surface text-content-primary text-[10px] font-bold px-2 py-1 rounded-md">
                      {translate('{count} CARDS', { count: deck.cardCount })}
                    </span>
                  </div>
                  <section>
                    <h2 className="text-white dark:text-black font-bold text-lg leading-tight group-hover:scale-105 transition-transform origin-left">{deck.title}</h2>
                    <p className="text-white/70 dark:text-black/70 text-xs font-medium mt-1 line-clamp-2">{deck.description}</p>
                  </section>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quizzes */}
        {activeTab === 'quizzes' && (
          quizzes.length === 0 ? <div className="py-16 text-center"><BrainCircuit className="w-12 h-12 text-slate-200 mx-auto mb-2" /><p className="text-sm text-content-muted">{translate('No quizzes')}</p></div> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
              {paged(quizzes).map((quiz, idx) => (
                <motion.div key={quiz._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Link href={`/quiz/${quiz.slug}`} className="block">
                    <Card as="section" hoverable
                      className="group flex flex-col gap-4 border-border-primary hover:border-primary-700 transition-all rounded-2xl bg-background-surface">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 text-on-primary text-xs xl:text-base font-bold tabular-nums">{sno(idx)}</div>
                          <section>
                            <h2 className="text-base font-bold text-content-primary uppercase tracking-tight line-clamp-2 leading-tight">{translateData(quiz.title)}</h2>
                            {quiz.subject?.name && <p className="text-[10px] font-bold text-content-muted uppercase">{translateData(quiz.subject.name)}</p>}
                          </section>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-content-primary uppercase px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-border-primary">
                          <HelpCircle className="w-3 h-3" />
                          {quiz.totalMarks || 0} {translate('marks')}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-content-primary uppercase px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-border-primary">
                          <Clock className="w-3 h-3" />
                          {translate('{count} min', { count: quiz.duration || 0 })}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* Practice Tests */}
        {activeTab === 'tests' && (
          practiceTests.length === 0 ? <div className="py-16 text-center"><FileText className="w-12 h-12 text-slate-200 mx-auto mb-2" /><p className="text-sm text-content-muted">{translate('No practice tests')}</p></div> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
              {paged(practiceTests).map((test, idx) => {
                const done = test.userAttempt?.status === 'Completed';
                return (
                  <motion.div key={test._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                    <Card as="section" className={`flex flex-col gap-4 rounded-2xl bg-background-surface ${done ? 'border-primary-200 dark:border-primary-600' : 'border-border-primary'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 text-on-primary text-xs xl:text-base font-bold tabular-nums">{sno(idx)}</div>
                        <h2 className="text-base font-bold text-content-primary uppercase tracking-tight line-clamp-2 leading-tight">{translateData(test.title)}</h2>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-content-primary uppercase px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-border-primary">
                          <HelpCircle className="w-3 h-3" />
                          {test.questionCount || 0} Qs
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-content-primary uppercase px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-border-primary">
                          {test.totalMarks || 0} {translate('marks')}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-content-primary uppercase px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-border-primary">
                          <Clock className="w-3 h-3" />
                          {fmtDur(test.duration || 0)}
                        </div>
                      </div>
                      <button onClick={() => router.push(`/govt-exams/test/${test.slug || test._id}/start`)} className={`text-[10px] font-bold px-3 py-2 rounded-lg xl:rounded-xl uppercase ${done ? 'bg-background-surface-secondary text-content-secondary' : 'bg-primary-600 text-on-primary'}`}>{done ? translate('Retake') : translate('Start')}</button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )
        )}

        {activeList.length > 0 && (
          <div className="pt-6"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} totalItems={activeList.length} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
        )}

      </div>
    </div>
  );
};

export default TopicDetailPage;
