'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  ArrowLeft, Clock, Trophy, FileText, BrainCircuit, ShieldCheck, Target,
  ChevronRight, Play, Eye, Lock, Unlock
} from 'lucide-react';
import { motion } from 'framer-motion';

import API from '../../../lib/api';
import { isAuthenticated } from '../../../lib/auth';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Skeleton from '../../../components/Skeleton';
import TestStartModal from '../../../components/TestStartModal';

const ExamDetails = ({ initialExam = null, initialPracticeTests = [], initialQuizzes = [], initialError = '', seo, examId }) => {
  const router = useRouter();
  const [exam, setExam] = useState(initialExam);
  const [activeTab, setActiveTab] = useState('tests');
  const [practiceTests, setPracticeTests] = useState(initialPracticeTests);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [loading, setLoading] = useState(!initialExam && !initialError);
  const [error, setError] = useState(initialError);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const fetchData = useCallback(async () => {
    if (!examId) return;
    try {
      setLoading(true);
      const [ptRes, qzRes, patternsRes] = await Promise.all([
        API.getPracticeTestsByExam(examId, { limit: 50 }),
        API.getQuizzes({ exam: examId, limit: 50 }),
        API.getPatternsByExam(examId)
      ]);
      if (ptRes?.success) setPracticeTests(ptRes.data || []);
      if (qzRes?.success) setQuizzes(qzRes.data || []);
      if (patternsRes?.exam) setExam(patternsRes.exam);
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (!initialExam && !initialError) fetchData();
  }, [initialExam, initialError, fetchData]);

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in py-10">
        <Skeleton height="120px" borderRadius="1.5rem" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} height="80px" borderRadius="1.5rem" />)}
        </div>
      </div>
    );
  }

  const examName = exam?.name || 'Government Exam';
  const tabs = [
    { key: 'tests', label: 'Practice Tests', icon: FileText, count: practiceTests.length },
    { key: 'quizzes', label: 'Quizzes', icon: BrainCircuit, count: quizzes.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <Head>
        <title>{seo?.title || `${examName} | AajExam`}</title>
      </Head>

      {/* Back */}
      <section className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="font-black">
          <ArrowLeft className="w-5 h-5" /> GO BACK
        </Button>
      </section>

      {/* Exam Hero */}
      <Card className="bg-gradient-to-br from-primary-500 to-indigo-600 text-white border-none shadow-duo-primary overflow-hidden relative">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" /> Verified Exam
          </div>
          <h1 className="text-xl md:text-2xl lg:text-4xl font-black uppercase tracking-tight">{examName}</h1>
          {exam?.code && <p className="text-primary-100 font-black text-lg opacity-80">Code: {exam.code}</p>}
          <div className="flex gap-3 pt-2">
            <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
              <FileText className="w-3.5 h-3.5" /> {practiceTests.length} Tests
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
              <BrainCircuit className="w-3.5 h-3.5" /> {quizzes.length} Quizzes
            </span>
          </div>
        </div>
        <Target className="absolute -bottom-10 -right-10 w-24 lg:w-48 h-24 lg:h-48 text-white/10 -rotate-12" />
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-slate-100 dark:border-slate-800/50">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-4 ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white border-primary-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'tests' && (
        <div className="space-y-3">
          {practiceTests.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-400">No practice tests available yet</p>
            </div>
          ) : (
            practiceTests.map((test, idx) => {
              const isCompleted = test.userAttempt?.status === 'Completed';
              return (
                <motion.div key={test._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className={`group border-2 transition-all p-4 overflow-hidden ${isCompleted ? 'border-primary-200 dark:border-primary-800' : 'border-border-primary hover:border-primary-500'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        {isCompleted ? <Trophy className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm lg:text-base font-black text-content-primary uppercase truncate">{test.title}</h3>
                        <p className="text-xs font-bold text-content-muted">
                          {test.questionCount || 0} Q · {test.totalMarks || 0} marks · {formatDuration(test.duration || 60)}
                          {test.examPattern?.title ? ` · ${test.examPattern.title}` : ''}
                        </p>
                        {isCompleted && test.userAttempt && (
                          <p className="text-xs font-bold text-primary-600 mt-1">
                            Score: {test.userAttempt.score} · Accuracy: {Math.round(test.userAttempt.accuracy || 0)}%
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {isCompleted && (
                          <button onClick={() => router.push(`/govt-exams/test/${test._id}/result?attempt=${test.userAttempt._id}`)}
                            className="text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-2 rounded-xl uppercase">
                            Results
                          </button>
                        )}
                        <button onClick={() => { setSelectedTest(test); setShowTestModal(true); }}
                          className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase ${isCompleted ? 'text-slate-600 bg-slate-100 dark:bg-slate-800' : 'text-white bg-primary-500'}`}>
                          {isCompleted ? 'Retake' : 'Start'}
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-3">
          {quizzes.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <BrainCircuit className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-400">No quizzes available yet</p>
            </div>
          ) : (
            quizzes.map((quiz, idx) => {
              const diffColor = quiz.difficulty === 'easy' ? 'text-green-600 bg-green-50' : quiz.difficulty === 'hard' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50';
              return (
                <motion.div key={quiz._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card
                    hoverable
                    onClick={() => router.push(`/quiz/${quiz._id}`)}
                    className="group border-2 border-border-primary hover:border-emerald-500 transition-all p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                        <BrainCircuit className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm lg:text-base font-black text-content-primary uppercase truncate">{quiz.title}</h3>
                        <p className="text-xs font-bold text-content-muted">
                          {quiz.subject?.name || ''}{quiz.topic?.name ? ` · ${quiz.topic.name}` : ''} · {quiz.duration} min · {quiz.totalMarks} marks
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg capitalize ${diffColor}`}>{quiz.difficulty}</span>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2 rounded-xl uppercase">Start</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Test Start Modal */}
      {showTestModal && selectedTest && (
        <TestStartModal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          onConfirm={() => {
            setShowTestModal(false);
            localStorage.setItem('testNavigationData', JSON.stringify({ fromPage: 'exam-detail', testData: selectedTest }));
            router.push(`/govt-exams/test/${selectedTest._id}/start`);
          }}
          test={selectedTest}
          pattern={selectedTest.examPattern}
          exam={exam}
        />
      )}
    </div>
  );
};

export default ExamDetails;

export async function getServerSideProps({ params }) {
  const dbConnect = (await import('../../../lib/db')).default;
  const Exam = (await import('../../../models/Exam')).default;
  const ExamPattern = (await import('../../../models/ExamPattern')).default;
  const PracticeTest = (await import('../../../models/PracticeTest')).default;
  const Quiz = (await import('../../../models/Quiz')).default;
  const examId = params?.examId;
  if (!examId) return { notFound: true };

  try {
    await dbConnect();

    const [exam, patternIds, quizDocs] = await Promise.all([
      Exam.findById(examId).populate('category', 'name type').lean(),
      ExamPattern.find({ exam: examId }).select('_id').lean(),
      Quiz.find({ exam: examId, status: 'published' })
        .populate('subject', 'name')
        .populate('topic', 'name')
        .select('-questions')
        .sort({ publishedAt: -1 })
        .lean()
    ]);

    if (!exam) return { notFound: true };

    const pIds = patternIds.map(p => p._id);
    const testDocs = pIds.length > 0
      ? await PracticeTest.find({ examPattern: { $in: pIds } })
          .populate('examPattern', 'title duration totalMarks sections negativeMarking')
          .select('-questions.correctAnswerIndex')
          .sort({ publishedAt: -1 })
          .lean()
      : [];

    const practiceTests = testDocs.map(t => ({
      ...JSON.parse(JSON.stringify(t)),
      questionCount: t.questions?.length || 0
    }));

    return {
      props: {
        examId,
        initialExam: JSON.parse(JSON.stringify(exam)),
        initialPracticeTests: practiceTests,
        initialQuizzes: JSON.parse(JSON.stringify(quizDocs)),
        seo: { title: `${exam.name} - Practice | AajExam` }
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return { props: { examId, initialError: 'Failed to load data.' } };
  }
}
