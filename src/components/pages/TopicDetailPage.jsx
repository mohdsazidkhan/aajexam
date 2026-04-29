'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Layers, FileText, BrainCircuit, Play, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../lib/api';
import Loading from '../Loading';
import TestStartModal from '../TestStartModal';

const TopicDetailPage = ({ resolvedId, initialTopic } = {}) => {
  const router = useRouter();
  const lookupId = resolvedId || router.query.id;
  const [topic, setTopic] = useState(initialTopic || null);
  const [practiceTests, setPracticeTests] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quizzes');
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    if (!lookupId) return;
    API.getTopicDetail(lookupId).then(res => {
      if (res.success) { setTopic(res.topic); setPracticeTests(res.practiceTests || []); setQuizzes(res.quizzes || []); }
    }).finally(() => setLoading(false));
  }, [lookupId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="lg" /></div>;
  if (!topic) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Topic not found</p></div>;

  const tabs = [
    { key: 'quizzes', label: 'Quizzes', icon: BrainCircuit, count: quizzes.length },
    { key: 'tests', label: 'Practice Tests', icon: FileText, count: practiceTests.length },
  ];

  const fmtDur = (m) => { const h = Math.floor(m / 60); const min = m % 60; return h > 0 ? `${h}h${min > 0 ? ` ${min}m` : ''}` : `${min}m`; };

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-primary-600 mb-4 font-bold"><ArrowLeft className="w-4 h-4" /> Back</button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white mb-5">
          <Layers className="w-8 h-8 mb-2" />
          <h1 className="text-xl lg:text-3xl font-black uppercase">{topic.name}</h1>
          <p className="text-sm opacity-80 mt-1">{topic.subject?.name || ''}{topic.exams?.length ? ` · ${topic.exams.map(e => e.name).join(', ')}` : ''}</p>
          <div className="flex gap-3 mt-3">
            <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg"><BrainCircuit className="w-3 h-3 inline mr-1" />{quizzes.length} Quizzes</span>
            <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg"><FileText className="w-3 h-3 inline mr-1" />{practiceTests.length} Tests</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 sticky top-16 z-20 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-slate-100 dark:border-slate-800">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs border-b-4 ${activeTab === tab.key ? 'bg-cyan-500 text-white border-cyan-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="space-y-3">
            {quizzes.length === 0 ? <div className="py-16 text-center"><BrainCircuit className="w-12 h-12 text-slate-200 mx-auto mb-2" /><p className="text-sm text-slate-400">No quizzes</p></div> : quizzes.map((quiz, idx) => (
              <motion.div key={quiz._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                onClick={() => router.push(`/quiz/${quiz._id}`)}
                className="flex items-center gap-2 lg:gap-4 p-2 lg:p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0"><BrainCircuit className="w-5 h-5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{quiz.title}</p>
                  <p className="text-xs text-slate-400">{quiz.subject?.name || ''} · {quiz.duration} min · {quiz.totalMarks} marks</p>
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg uppercase">Start</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Practice Tests */}
        {activeTab === 'tests' && (
          <div className="space-y-3">
            {practiceTests.length === 0 ? <div className="py-16 text-center"><FileText className="w-12 h-12 text-slate-200 mx-auto mb-2" /><p className="text-sm text-slate-400">No practice tests</p></div> : practiceTests.map((test, idx) => {
              const done = test.userAttempt?.status === 'Completed';
              return (
                <motion.div key={test._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-2 lg:gap-4 p-2 lg:p-4 bg-white dark:bg-slate-800 rounded-xl border ${done ? 'border-cyan-200' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${done ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
                    {done ? <Trophy className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{test.title}</p>
                    <p className="text-xs text-slate-400">{test.questionCount || 0} Q · {test.totalMarks} marks · {fmtDur(test.duration)}</p>
                  </div>
                  <button onClick={() => { setSelectedTest(test); setShowTestModal(true); }} className={`text-[10px] font-black px-3 py-2 rounded-lg uppercase ${done ? 'bg-slate-100 text-slate-600' : 'bg-primary-500 text-white'}`}>{done ? 'Retake' : 'Start'}</button>
                </motion.div>
              );
            })}
          </div>
        )}

        {showTestModal && selectedTest && <TestStartModal isOpen={showTestModal} onClose={() => setShowTestModal(false)} onConfirm={() => { setShowTestModal(false); router.push(`/govt-exams/test/${selectedTest.slug || selectedTest._id}/start`); }} test={selectedTest} pattern={selectedTest.examPattern} exam={topic.subject?.exam} />}
      </div>
    </div>
  );
};

export default TopicDetailPage;
