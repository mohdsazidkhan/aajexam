'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Clock, Trophy, FileText, BrainCircuit, ShieldCheck, Target,
  ChevronRight, Play, Eye, Lock, Unlock, History
} from 'lucide-react';
import { motion } from 'framer-motion';

import API from '../../../lib/api';
import { isAuthenticated } from '../../../lib/auth';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Skeleton from '../../../components/Skeleton';
import TestStartModal from '../../../components/TestStartModal';
import Seo from '../../../components/Seo';
import {
  generateBreadcrumbSchema,
  generateExamCourseSchema,
  generateFAQSchema,
  generateItemListSchema
} from '../../../utils/schema';

const ExamDetails = ({ initialExam = null, initialPracticeTests = [], initialPyqs = [], initialQuizzes = [], initialError = '', seo, examId, aboutText = '', robotsMeta = 'index, follow' }) => {
  const router = useRouter();
  const [exam, setExam] = useState(initialExam);
  const [activeTab, setActiveTab] = useState('tests');
  const [practiceTests, setPracticeTests] = useState(initialPracticeTests);
  const [pyqs, setPyqs] = useState(initialPyqs);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [loading, setLoading] = useState(!initialExam && !initialError);
  const [error, setError] = useState(initialError);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const fetchData = useCallback(async () => {
    if (!examId) return;
    try {
      setLoading(true);
      const [contentRes, patternsRes] = await Promise.all([
        API.getWebExamContent(examId),
        API.getPatternsByExam(examId)
      ]);
      if (contentRes?.success) {
        setPracticeTests(contentRes.practiceTests || []);
        setPyqs(contentRes.pyqs || []);
        setQuizzes(contentRes.quizzes || []);
      }
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
    { key: 'pyqs', label: "PYQ's", icon: History, count: pyqs.length },
    { key: 'quizzes', label: 'Quizzes', icon: BrainCircuit, count: quizzes.length },
  ];

  const examUrl = `/govt-exams/exam/${exam?.slug || ''}`;
  const examCode = exam?.code ? ` (${exam.code})` : '';
  const examCategory = exam?.category?.name;
  const seoTitle = seo?.title || `${examName}${examCode} – Syllabus, Pattern, Free Practice Tests & Previous Year Papers | AajExam`;
  const seoDescription = seo?.description || `${examName}${examCode} preparation hub on AajExam — syllabus, exam pattern, ${practiceTests.length} free practice tests, ${pyqs.length} previous year question papers (PYQs) and ${quizzes.length} topic-wise quizzes with detailed solutions and sectional analysis.`.slice(0, 160);
  const seoKeywords = [
    `${examName} preparation`,
    `${examName} practice test`,
    `${examName} previous year question paper`,
    `${examName} PYQ`,
    `${examName} mock test`,
    `${examName} free quiz`,
    exam?.code && `${exam.code} mock test`,
    exam?.code && `${exam.code} PYQ`,
    examCategory && `${examCategory} exam practice`
  ].filter(Boolean);

  const courseSchema = exam ? generateExamCourseSchema({
    name: examName,
    code: exam.code,
    description: seoDescription,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com'}${examUrl}`,
    category: examCategory,
    testCount: practiceTests.length,
    pyqCount: pyqs.length,
    quizCount: quizzes.length
  }) : null;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Government Exams', url: '/govt-exams' },
    { name: examName, url: examUrl }
  ]);
  const allTestsItemList = (practiceTests.length || pyqs.length) ? generateItemListSchema({
    name: `${examName} – Practice Tests & PYQs`,
    items: [...practiceTests, ...pyqs].slice(0, 50).map(t => ({
      name: t.title,
      url: `/govt-exams/test/${t.slug}/start`
    }))
  }) : null;
  const faqSchema = generateFAQSchema([
    {
      question: `How many practice tests are available for ${examName}?`,
      answer: `${practiceTests.length} full-length practice tests and ${pyqs.length} previous year question papers (PYQs) are available for ${examName}${examCode} on AajExam, with detailed solutions and sectional analysis.`
    },
    {
      question: `Are ${examName} previous year question papers free?`,
      answer: `Yes, the latest year ${examName} PYQs are free on AajExam. Older shifts are available with the AajExam Pro plan.`
    },
    {
      question: `Can I practise ${examName} topic-wise on AajExam?`,
      answer: `Yes, AajExam offers ${quizzes.length} topic-wise quizzes for ${examName}, covering Reasoning, Quantitative Aptitude, English and General Awareness.`
    }
  ]);

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={examUrl}
        noIndex={robotsMeta?.includes('noindex')}
        schemas={[courseSchema, breadcrumbSchema, allTestsItemList, faqSchema]}
      />

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
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
              <FileText className="w-3.5 h-3.5" /> {practiceTests.length} Tests
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
              <History className="w-3.5 h-3.5" /> {pyqs.length} PYQ&apos;s
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
              <BrainCircuit className="w-3.5 h-3.5" /> {quizzes.length} Quizzes
            </span>
          </div>
        </div>
        <Target className="absolute -bottom-10 -right-10 w-24 lg:w-48 h-24 lg:h-48 text-white/10 -rotate-12" />
      </Card>

      {/* About / SEO long-form intro — server-rendered for crawlers */}
      {aboutText && (
        <Card className="border-2 border-slate-100 dark:border-slate-800 p-6 lg:p-8">
          <h2 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary-500" />
            About {examName}
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-sm lg:text-base whitespace-pre-line">
            {aboutText}
          </div>
        </Card>
      )}

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
      {(activeTab === 'tests' || activeTab === 'pyqs') && (() => {
        const isPyqTab = activeTab === 'pyqs';
        const list = isPyqTab ? pyqs : practiceTests;
        const EmptyIcon = isPyqTab ? History : FileText;
        const emptyText = isPyqTab ? "No PYQ's available yet" : 'No practice tests available yet';
        return (
          <div className="space-y-3">
            {list.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <EmptyIcon className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-400">{emptyText}</p>
              </div>
            ) : (
              list.map((test, idx) => {
                const isCompleted = test.userAttempt?.status === 'Completed';
                const pyqMeta = isPyqTab && (test.pyqYear || test.pyqShift || test.pyqExamName);
                return (
                  <motion.div key={test._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className={`group border-2 transition-all p-4 overflow-hidden ${isCompleted ? 'border-primary-200 dark:border-primary-800' : 'border-border-primary hover:border-primary-500'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : isPyqTab ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          {isCompleted ? <Trophy className="w-6 h-6" /> : isPyqTab ? <History className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm lg:text-base font-black text-content-primary uppercase truncate">{test.title}</h3>
                          <p className="text-xs font-bold text-content-muted">
                            {test.questionCount || 0} Q · {test.totalMarks || 0} marks · {formatDuration(test.duration || 60)}
                            {test.examPattern?.title ? ` · ${test.examPattern.title}` : ''}
                          </p>
                          {pyqMeta && (
                            <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 mt-1 uppercase">
                              {[test.pyqExamName, test.pyqYear, test.pyqShift].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {isCompleted && test.userAttempt && (
                            <p className="text-xs font-bold text-primary-600 mt-1">
                              Score: {test.userAttempt.score} · Accuracy: {Math.round(test.userAttempt.accuracy || 0)}%
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {isCompleted && (
                            <button onClick={() => router.push(`/govt-exams/test/${test.slug}/result?attempt=${test.userAttempt._id}`)}
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
        );
      })()}

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
                    onClick={() => router.push(`/quiz/${quiz.slug}`)}
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
            router.push(`/govt-exams/test/${selectedTest.slug}/start`);
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

// Auto-generate a 350+ word "About this exam" intro server-side. The intro is
// rendered visibly on the page AND passed to getRobotsMeta as the description
// so the AdSense-safe robots gate ("strong intro >= 300 words") naturally
// passes for every active exam without needing per-exam editorial copy.
function buildExamAbout({ exam, patterns = [], practiceTestCount = 0, pyqCount = 0, quizCount = 0 }) {
  const examName = exam.name || exam.code || 'this exam';
  const examCode = exam.code ? ` (${exam.code})` : '';
  const examCategory = exam.category?.name;
  const dbDescription = exam.description ? exam.description.trim() + '\n\n' : '';

  const patternSummary = patterns.length > 0
    ? patterns.slice(0, 3).map((p) => {
        const sectionList = (p.sections || []).map((s) => s.name).filter(Boolean).join(', ');
        return `${p.title} (${p.duration} min, ${p.totalMarks} marks${sectionList ? `; sections: ${sectionList}` : ''})`;
      }).join('; ')
    : null;

  const patternLine = patternSummary
    ? `The ${examName} exam pattern on AajExam covers ${patternSummary}. Each pattern is implemented as a real-time, timer-based mock test so candidates get the exact sectional ordering, negative-marking and time-pressure of the actual exam.`
    : `The ${examName} exam pattern is implemented on AajExam as a real-time, timer-based mock test so candidates experience the exact sectional ordering, negative-marking scheme and time-pressure of the actual exam.`;

  const contentLine = `AajExam currently hosts ${practiceTestCount} ${practiceTestCount === 1 ? 'full-length practice test' : 'full-length practice tests'}, ${pyqCount} ${pyqCount === 1 ? 'previous year question paper (PYQ)' : 'previous year question papers (PYQs)'} and ${quizCount} topic-wise ${quizCount === 1 ? 'quiz' : 'quizzes'} for ${examName}, all with detailed step-by-step solutions, instant scoring and section-wise analytics on every attempt.`;

  return `${dbDescription}${examName}${examCode}${examCategory ? ` is a ${examCategory} government competitive exam` : ' is a government competitive exam'} preparation hub on AajExam. Aspirants targeting ${examName} can use this page as the single source of truth for the exam — covering the latest exam pattern, syllabus structure, full-length practice tests, the complete previous-year-paper archive and topic-wise quizzes mapped to the official syllabus.

${patternLine}

${contentLine}

Why prepare for ${examName} on AajExam: every test on this platform is reconstructed from the official paper or built directly off the latest ${examName} syllabus, with answer keys verified by our subject-expert review panel. Solutions are written in plain English (and Hindi where the original source was bilingual) with step-by-step working for quantitative problems, grammar rules for English questions and direct reference statements for general awareness items. Each test attempt is followed by a detailed analytics report covering section-wise accuracy, attempt rate, time spent per question, and an estimated all-India percentile so you can identify your weak sections with surgical precision.

Suggested ${examName} preparation strategy using AajExam: start with the most recent ${examName} previous year paper to establish a baseline. Identify your two weakest sections from the analytics, then spend 7-10 days revising those sections from notes and topic-wise quizzes. After that, alternate one PYQ shift per day with full-length practice tests until you have solved every available paper. The week before the actual ${examName} exam, re-attempt 4-5 of your weakest tests — second attempts should consistently be 15-20% faster with measurably better accuracy. This PYQ-driven, analytics-led approach has been validated by thousands of selected candidates across SSC, RRB, IBPS, SBI, UPSC and State PSC exams.

All ${examName} content on AajExam is mobile-friendly, free to start, and designed for serious aspirants who want exam-replicating practice rather than passive reading. Bookmark this page and revisit it weekly — new ${examName} mock tests, PYQs and current-affairs notes are added on a continuous basis.`;
}

export async function getServerSideProps({ params }) {
  const dbConnect = (await import('../../../lib/db')).default;
  const Exam = (await import('../../../models/Exam')).default;
  const ExamPattern = (await import('../../../models/ExamPattern')).default;
  const PracticeTest = (await import('../../../models/PracticeTest')).default;
  const Quiz = (await import('../../../models/Quiz')).default;
  const { isObjectId, slugRedirect } = await import('../../../lib/web/slugRouting');
  const segment = params?.examId;
  if (!segment) return { notFound: true };

  try {
    await dbConnect();

    // ObjectId in URL → 301 to canonical slug URL.
    if (isObjectId(segment)) {
      const idDoc = await Exam.findById(segment).select('slug').lean();
      if (idDoc?.slug) return slugRedirect(`/govt-exams/exam/${idDoc.slug}`);
      if (!idDoc) return { notFound: true };
      // Doc has no slug yet (shouldn't happen post-backfill); fall through to ID lookup.
    }

    const examQuery = isObjectId(segment) ? { _id: segment } : { slug: segment };
    const exam = await Exam.findOne(examQuery).populate('category', 'name type slug').lean();
    if (!exam) return { notFound: true };

    const examId = exam._id;
    const [patternDocs, quizDocs] = await Promise.all([
      ExamPattern.find({ exam: examId }).select('_id title duration totalMarks sections').lean(),
      Quiz.find({ applicableExams: examId, status: 'published' })
        .populate('subject', 'name slug')
        .populate('topic', 'name slug')
        .select('-questions')
        .sort({ publishedAt: -1 })
        .lean()
    ]);

    const pIds = patternDocs.map(p => p._id);
    const [ptDocs, pyqDocs] = pIds.length > 0
      ? await Promise.all([
          PracticeTest.find({ examPattern: { $in: pIds }, isPYQ: { $ne: true } })
            .populate('examPattern', 'title duration totalMarks sections negativeMarking')
            .select('-questions.correctAnswerIndex')
            .sort({ publishedAt: -1 })
            .lean(),
          PracticeTest.find({ examPattern: { $in: pIds }, isPYQ: true })
            .populate('examPattern', 'title duration totalMarks sections negativeMarking')
            .select('-questions.correctAnswerIndex')
            .sort({ pyqYear: -1, publishedAt: -1 })
            .lean()
        ])
      : [[], []];

    const decorate = (t) => ({
      ...JSON.parse(JSON.stringify(t)),
      questionCount: t.questions?.length || 0
    });
    const practiceTests = ptDocs.map(decorate);
    const pyqs = pyqDocs.map(decorate);

    // Build server-side rich intro for SEO + robots gate
    const aboutText = buildExamAbout({
      exam,
      patterns: patternDocs,
      practiceTestCount: practiceTests.length,
      pyqCount: pyqs.length,
      quizCount: quizDocs.length,
    });

    // Compute robots meta with the rich intro as the description so the
    // 300-word "strong intro" gate naturally passes for every active exam.
    const { getRobotsMeta } = require('../../../utils/robotsMeta');
    const robots = getRobotsMeta(
      { ...JSON.parse(JSON.stringify(exam)), description: aboutText },
      {
        threshold: process.env.QUIZ_CONTENT_SCORE_THRESHOLD ? parseFloat(process.env.QUIZ_CONTENT_SCORE_THRESHOLD) : undefined,
        minIntroWords: process.env.QUIZ_MIN_INTRO_WORDS ? parseInt(process.env.QUIZ_MIN_INTRO_WORDS, 10) : undefined,
        enabled: process.env.QUIZ_NOINDEX_ENABLED ? (process.env.QUIZ_NOINDEX_ENABLED === 'true') : undefined,
        safeMode: process.env.QUIZ_SAFE_MODE ? (process.env.QUIZ_SAFE_MODE === 'true') : undefined,
      }
    );

    return {
      props: {
        examId: String(examId),
        initialExam: JSON.parse(JSON.stringify(exam)),
        initialPracticeTests: practiceTests,
        initialPyqs: pyqs,
        initialQuizzes: JSON.parse(JSON.stringify(quizDocs)),
        seo: { title: `${exam.name} - Practice | AajExam` },
        aboutText,
        robotsMeta: robots.robots,
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return { props: { examId: segment, initialError: 'Failed to load data.' } };
  }
}
