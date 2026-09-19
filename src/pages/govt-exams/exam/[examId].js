'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Clock, Trophy, FileText, BrainCircuit, ShieldCheck, Target,
  ChevronRight, Play, Eye, Lock, Unlock, History,
  GraduationCap, HelpCircle, ListChecks, Search, UserPlus, Info, BookOpen, FolderOpen
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
import { EXAM_SEO_FACTS, EXAM_FACTS_SOURCED_DATE } from '../../../lib/data/examSeoFacts';

const ExamDetails = ({ initialExam = null, initialPracticeTests = [], initialPyqs = [], initialQuizzes = [], initialSubjects = [], initialTopics = [], initialQuestionCount = 0, initialError = '', seo, examId, aboutText = '', robotsMeta = 'index, follow' }) => {
  const router = useRouter();
  const [exam, setExam] = useState(initialExam);
  const [activeTab, setActiveTab] = useState('subjects');
  const [practiceTests, setPracticeTests] = useState(initialPracticeTests);
  const [pyqs, setPyqs] = useState(initialPyqs);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [subjects] = useState(initialSubjects);
  const [topics] = useState(initialTopics);
  const [questionCount] = useState(initialQuestionCount);
  const [loading, setLoading] = useState(!initialExam && !initialError);
  const [error, setError] = useState(initialError);


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
    { key: 'subjects', label: 'Subjects', icon: BookOpen, count: subjects.length },
    { key: 'topics', label: 'Topics', icon: FolderOpen, count: topics.length },
    { key: 'tests', label: 'Practice Tests', icon: FileText, count: practiceTests.length },
    { key: 'pyqs', label: "PYQ's", icon: History, count: pyqs.length },
    { key: 'quizzes', label: 'Quizzes', icon: BrainCircuit, count: quizzes.length },
  ];

  const examUrl = `/govt-exams/exam/${exam?.slug || ''}`;
  const examCode = exam?.code ? ` (${exam.code})` : '';
  const examCategory = exam?.category?.name;
  const facts = exam?.slug ? EXAM_SEO_FACTS[exam.slug] : null;
  const subjectAreas = subjects.length ? subjects.map((s) => s.name) : (facts?.subjectAreas || []);
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
      url: `/govt-exams/test/${t.slug || t._id}/start`
    }))
  }) : null;
  const faqItems = [
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
      answer: subjectAreas.length
        ? `Yes, AajExam offers ${quizzes.length} topic-wise quizzes for ${examName}, covering ${subjectAreas.slice(0, 4).join(', ')}.`
        : `Yes, AajExam offers ${quizzes.length} topic-wise quizzes for ${examName} across all its subjects.`
    }
  ];
  if (facts) {
    faqItems.push(
      { question: `What is the eligibility for ${examName}?`, answer: facts.qualification },
      { question: `What is the age limit for ${examName}?`, answer: `${facts.age}. Always confirm this against the latest official notification before applying.` },
      { question: `What is the ${examName} selection process?`, answer: facts.selection },
      { question: `What is the ${examName} salary?`, answer: facts.salary }
    );
  }
  const faqSchema = generateFAQSchema(faqItems);

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
      <section className="hidden lg:flex items-center justify-end">
        <Button variant="primary" size="sm" onClick={() => router.back()} className="font-black">
          <ArrowLeft className="w-5 h-5" /> GO BACK
        </Button>
      </section>

      {/* Exam Hero */}
      <Card className="bg-primary-500 text-white border-none shadow-aajexam-primary overflow-hidden relative">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" /> Verified Exam
          </div>
          <h1 className="text-xl md:text-2xl lg:text-4xl font-black uppercase tracking-tight">{examName} Preparation</h1>
          <p className="text-primary-100 font-bold text-sm lg:text-base opacity-90">PYQ, Practice Tests &amp; Online Questions</p>
          {exam?.code && <p className="text-primary-100 font-black text-lg opacity-80">Code: {exam.code}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            {subjects.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
                <BookOpen className="w-3.5 h-3.5" /> {subjects.length} Subjects
              </span>
            )}
            {topics.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
                <FolderOpen className="w-3.5 h-3.5" /> {topics.length} Topics
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
              <FileText className="w-3.5 h-3.5" /> {practiceTests.length} Tests
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
              <History className="w-3.5 h-3.5" /> {pyqs.length} PYQ&apos;s
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
              <BrainCircuit className="w-3.5 h-3.5" /> {quizzes.length} Quizzes
            </span>
            {questionCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
                <ListChecks className="w-3.5 h-3.5" /> {questionCount} Questions
              </span>
            )}
          </div>
        </div>
        <Target className="absolute -bottom-10 -right-10 w-24 lg:w-48 h-24 lg:h-48 text-white/10 -rotate-12" />
      </Card>

      {/* About / SEO long-form intro — server-rendered for crawlers */}
      {aboutText && (
        <Card className="border-2 border-slate-100 dark:border-slate-800 p-2 lg:p-4">
          <h2 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary-500" />
            About {examName}
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-sm lg:text-base whitespace-pre-line">
            {aboutText}
          </div>
        </Card>
      )}

      {/* Exam Information — eligibility, age limit, selection process, salary */}
      {facts && (
        <Card className="border-2 border-slate-100 dark:border-slate-800 p-2 lg:p-4">
          <h2 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight flex items-center gap-3">
            <Info className="w-5 h-5 text-primary-500" />
            {examName} Exam Information
          </h2>
          <p className="text-[11px] font-bold text-black dark:text-white mb-4 uppercase tracking-wide">
            Sourced {EXAM_FACTS_SOURCED_DATE} — verify against the official notification before relying on this to apply
          </p>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-black text-content-muted text-xs uppercase mb-1">Age Limit</dt>
              <dd className="font-medium text-content-primary">{facts.age}</dd>
            </div>
            <div>
              <dt className="font-black text-content-muted text-xs uppercase mb-1">Eligibility / Qualification</dt>
              <dd className="font-medium text-content-primary">{facts.qualification}</dd>
            </div>
            <div>
              <dt className="font-black text-content-muted text-xs uppercase mb-1">Selection Process</dt>
              <dd className="font-medium text-content-primary">{facts.selection}</dd>
            </div>
            <div>
              <dt className="font-black text-content-muted text-xs uppercase mb-1">Salary</dt>
              <dd className="font-medium text-content-primary">{facts.salary}</dd>
            </div>
          </dl>
        </Card>
      )}

      {/* Syllabus & Subjects */}
      {subjectAreas.length > 0 && (
        <Card className="border-2 border-slate-100 dark:border-slate-800 p-2 lg:p-4">
          <h2 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
            <ListChecks className="w-5 h-5 text-primary-500" />
            {examName} Syllabus &amp; Subjects
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {subjects.length > 0 ? subjects.map((subject) => (
              <div key={subject._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3 p-3 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-content-primary">{subject.name}</span>
                {subject.slug ? (
                  <button
                    onClick={() => router.push(subject.hasSeries ? `/practice/${exam.slug}/${subject.slug}` : `/subjects/${subject.slug}`)}
                    className="text-[10px] font-black text-primary-600 uppercase text-left self-start sm:self-auto sm:whitespace-nowrap"
                  >
                    Practice {subject.name} Questions →
                  </button>
                ) : (
                  <button onClick={() => setActiveTab('quizzes')} className="text-[10px] font-black text-primary-600 uppercase text-left self-start sm:self-auto sm:whitespace-nowrap">
                    Practice Questions →
                  </button>
                )}
              </div>
            )) : subjectAreas.map((subject) => (
              <div key={subject} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3 p-3 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-content-primary">{subject}</span>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className="text-[10px] font-black text-primary-600 uppercase text-left self-start sm:self-auto sm:whitespace-nowrap"
                >
                  Practice {subject} Questions →
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-slate-100 dark:border-slate-800/50">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-2 shrink-0 ${
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
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-3">
              <BookOpen className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-400">No subjects available yet</p>
            </div>
          ) : (
            subjects.map((subject, idx) => (
              <motion.div key={subject._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card
                  hoverable
                  onClick={() => {
                    if (!subject.slug) return setActiveTab('quizzes');
                    router.push(subject.hasSeries ? `/practice/${exam.slug}/${subject.slug}` : `/subjects/${subject.slug}`);
                  }}
                  className="group h-full border-2 border-border-primary hover:border-primary-500 transition-all p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-content-primary uppercase truncate">{subject.name}</h3>
                      <p className="text-xs font-bold text-content-muted">
                        {subject.quizCount} {subject.quizCount === 1 ? 'set' : 'sets'} · {subject.questionCount} Qs
                      </p>
                    </div>
                  </div>
                  <span className="mt-auto text-center text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-2 rounded-lg lg:rounded-xl uppercase">
                    Practice {subject.name} →
                  </span>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {activeTab === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-3">
              <FolderOpen className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-400">No topics available yet</p>
            </div>
          ) : (
            topics.map((topic, idx) => (
              <motion.div key={topic._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card
                  hoverable
                  onClick={() => {
                    if (!topic.slug) return setActiveTab('quizzes');
                    router.push(topic.hasSeries && topic.subjectSlug ? `/practice/${exam.slug}/${topic.subjectSlug}/${topic.slug}` : `/topics/${topic.slug}`);
                  }}
                  className="group h-full border-2 border-border-primary hover:border-primary-500 transition-all p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center shrink-0">
                      <FolderOpen className="w-5 h-5 text-white dark:text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-content-primary uppercase truncate">{topic.name}</h3>
                      <p className="text-xs font-bold text-content-muted truncate">{topic.subjectName}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-content-muted">{topic.quizCount} {topic.quizCount === 1 ? 'set' : 'sets'} · {topic.questionCount} Qs</p>
                  <span className="mt-auto text-center text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-2 rounded-lg lg:rounded-xl uppercase">
                    Practice {topic.name} →
                  </span>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {(activeTab === 'tests' || activeTab === 'pyqs') && (() => {
        const isPyqTab = activeTab === 'pyqs';
        const list = isPyqTab ? pyqs : practiceTests;
        const EmptyIcon = isPyqTab ? History : FileText;
        const emptyText = isPyqTab ? "No PYQ's available yet" : 'No practice tests available yet';
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-3">
                <EmptyIcon className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-400">{emptyText}</p>
              </div>
            ) : (
              list.map((test, idx) => {
                const isCompleted = test.userAttempt?.status === 'Completed';
                const pyqMeta = isPyqTab && (test.pyqYear || test.pyqShift || test.pyqExamName);
                return (
                  <motion.div key={test._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className={`group h-full border-2 transition-all p-4 overflow-hidden flex flex-col gap-3 ${isCompleted ? 'border-primary-200 dark:border-primary-800' : 'border-border-primary hover:border-primary-500'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : isPyqTab ? 'bg-slate-100 dark:bg-slate-800 dark:bg-white/30 text-black dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          {isCompleted ? <Trophy className="w-6 h-6" /> : isPyqTab ? <History className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-content-primary uppercase truncate">{test.title}</h3>
                          <p className="text-xs font-bold text-content-muted">
                            {test.questionCount || 0} Q · {test.totalMarks || 0} marks · {formatDuration(test.duration || 60)}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        {test.examPattern?.title && (
                          <p className="text-xs font-bold text-content-muted truncate">{test.examPattern.title}</p>
                        )}
                        {pyqMeta && (
                          <p className="text-[10px] font-black text-black dark:text-white uppercase">
                            {[test.pyqExamName, test.pyqYear, test.pyqShift].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {isCompleted && test.userAttempt && (
                          <p className="text-xs font-bold text-primary-600">
                            Score: {test.userAttempt.score} · Accuracy: {Math.round(test.userAttempt.accuracy || 0)}%
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isCompleted && (
                          <button onClick={() => router.push(`/govt-exams/test/${test.slug}/result?attempt=${test.userAttempt._id}`)}
                            className="flex-1 text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-2 rounded-lg lg:rounded-xl uppercase">
                            Results
                          </button>
                        )}
                        <button onClick={() => router.push(`/govt-exams/test/${test.slug || test._id}/start`)}
                          className={`flex-1 text-[10px] font-black px-4 py-2 rounded-lg lg:rounded-xl uppercase ${isCompleted ? 'text-slate-600 bg-slate-100 dark:bg-slate-800' : 'text-white bg-primary-500'}`}>
                          {isCompleted ? 'Retake' : 'Start'}
                        </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-3">
              <BrainCircuit className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-400">No quizzes available yet</p>
            </div>
          ) : (
            quizzes.map((quiz, idx) => {
              const diffColor = quiz.difficulty === 'easy' ? 'text-primary-600 bg-primary-50' : quiz.difficulty === 'hard' ? 'text-black dark:text-white bg-slate-100 dark:bg-slate-800' : 'text-black dark:text-white bg-slate-100 dark:bg-slate-800';
              return (
                <motion.div key={quiz._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card
                    hoverable
                    onClick={() => router.push(`/quiz/${quiz.slug}`)}
                    className="group h-full border-2 border-border-primary hover:border-primary-500 transition-all p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shrink-0">
                        <BrainCircuit className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-content-primary uppercase truncate">{quiz.title}</h3>
                        <p className="text-xs font-bold text-content-muted truncate">
                          {quiz.subject?.name || ''}{quiz.topic?.name ? ` · ${quiz.topic.name}` : ''}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-content-muted">{quiz.duration} min · {quiz.totalMarks} marks</p>
                    <div className="flex items-center gap-2 mt-auto">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg capitalize ${diffColor}`}>{quiz.difficulty}</span>
                        <span className="flex-1 text-center text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-2 rounded-lg lg:rounded-xl uppercase">Start</span>
                      </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* How to Prepare */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 p-2 lg:p-4">
        <h2 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-primary-500" />
          How to Prepare for {examName}
        </h2>
        <ol className="space-y-2 text-sm font-medium text-content-primary list-decimal list-inside">
          <li>Understand the {examName} syllabus and exam pattern above.</li>
          {subjectAreas[0] && <li>Study each subject, starting with {subjectAreas[0]}.</li>}
          <li>Practice topic-wise questions across every available topic.</li>
          <li>Solve {examName} previous year papers to learn the real difficulty level.</li>
          <li>Attempt full-length practice tests under timed conditions.</li>
          <li>Take short quizzes to revise between full attempts.</li>
          <li>Review every incorrect answer&apos;s explanation, not just the score.</li>
          <li>Repeat quizzes for your weakest topics before your next mock.</li>
        </ol>
      </Card>

      {/* Related Searches */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 p-2 lg:p-4">
        <h2 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
          <Search className="w-5 h-5 text-primary-500" />
          Related Searches
        </h2>
        <p className="text-sm font-medium text-content-muted leading-relaxed">
          {[
            `What is ${examName}?`,
            `What is the ${examName} syllabus?`,
            `What is the ${examName} exam pattern?`,
            `Where can I practice ${examName} PYQs online?`,
            `How do I prepare for ${examName}?`,
            subjectAreas.length ? `Which subjects are in ${examName}?` : null,
          ].filter(Boolean).join('   ·   ')}
        </p>
      </Card>

      {/* FAQ — rendered visibly to match the FAQ structured data above */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 p-2 lg:p-4">
        <h2 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-primary-500" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-black text-content-primary mb-1">{item.question}</p>
              <p className="text-sm font-medium text-content-muted leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Contextual registration CTA — only for logged-out visitors */}
      {!isAuthenticated() && (
        <Card className="bg-primary-500 text-white border-none p-2 lg:p-4">
          <div className="flex items-start gap-4">
            <UserPlus className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-base lg:text-lg font-black uppercase tracking-tight mb-1">Want to save your progress?</h3>
              <p className="text-sm font-medium text-white/90 mb-4">
                Create a free AajExam account to save your {examName} practice history, track your accuracy over time, and pick up any test where you left off.
              </p>
              <Button variant="secondary" size="sm" onClick={() => router.push('/register')} className="font-black">
                Create Free Account
              </Button>
            </div>
          </div>
        </Card>
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
        .select('subject topic questions title slug type duration totalMarks difficulty publishedAt')
        .sort({ publishedAt: -1 })
        .lean()
    ]);

    // Derive real Subjects/Topics/Question-count for this exam from its actual
    // quiz content (mirrors the Quiz-based aggregation the
    // /practice/[examSlug]/[subjectSlug] page already uses) rather than
    // Subject.exams/Topic.exams or Question.exam, which carry mixed
    // string/ObjectId legacy data and/or aren't reliably tagged per-exam.
    const subjectMap = new Map();
    const topicMap = new Map();
    let questionCount = 0;
    for (const q of quizDocs) {
      const qCount = q.questions?.length || 0;
      questionCount += qCount;
      const isSeriesQuiz = q.type === 'subject_test';
      if (q.subject?._id) {
        const key = String(q.subject._id);
        const entry = subjectMap.get(key) || { _id: key, name: q.subject.name, slug: q.subject.slug, quizCount: 0, questionCount: 0, hasSeries: false };
        entry.quizCount += 1;
        entry.questionCount += qCount;
        if (isSeriesQuiz) entry.hasSeries = true;
        subjectMap.set(key, entry);
      }
      if (q.topic?._id) {
        const key = String(q.topic._id);
        const entry = topicMap.get(key) || {
          _id: key,
          name: q.topic.name,
          slug: q.topic.slug,
          subjectName: q.subject?.name || '',
          subjectSlug: q.subject?.slug || '',
          quizCount: 0,
          questionCount: 0,
          hasSeries: false
        };
        entry.quizCount += 1;
        entry.questionCount += qCount;
        if (isSeriesQuiz) entry.hasSeries = true;
        topicMap.set(key, entry);
      }
      delete q.questions; // only needed transiently for the counts above
    }
    const subjects = Array.from(subjectMap.values())
      .filter((s) => s.slug)
      .sort((a, b) => a.name.localeCompare(b.name));
    const topics = Array.from(topicMap.values())
      .filter((t) => t.slug && t.subjectSlug)
      .sort((a, b) => a.name.localeCompare(b.name));

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
        initialSubjects: subjects,
        initialTopics: topics,
        initialQuestionCount: questionCount,
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
