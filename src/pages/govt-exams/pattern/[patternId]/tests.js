'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  ArrowLeft,
  Clock,
  Lock,
  Unlock,
  Play,
  Trophy,
  History,
  Eye,
  Zap,
  Award,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

import API from '../../../../lib/api';
import { getCurrentUser, isTokenValid, secureLogout } from '../../../../lib/utils/authUtils';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ProgressBar from '../../../../components/ui/ProgressBar';
import Skeleton from '../../../../components/Skeleton';

const PatternTests = ({ patternId, initialPattern = null, initialTests = [], initialPagination = null, initialError = '', seo }) => {
  const router = useRouter();
  const [pattern, setPattern] = useState(initialPattern);
  const [tests, setTests] = useState(initialTests);
  const [loading, setLoading] = useState(!initialTests.length && !initialError);
  const [error, setError] = useState(initialError);
  const [page, setPage] = useState(initialPagination?.page || 1);
  const [totalPages, setTotalPages] = useState(initialPagination?.pages || 1);
  const [user, setUser] = useState(null);

  const fetchTests = useCallback(async (targetPage) => {
    if (!patternId) return;
    try {
      setLoading(true);
      const res = await API.getTestsByPattern(patternId, { page: targetPage, limit: 10 });
      if (res?.success) {
        let fetchedTests = res.data || [];
        const activeUser = getCurrentUser();
        if (activeUser && isTokenValid()) {
          const attemptsRes = await API.getUserTestResults(activeUser._id, { limit: 100 });
          if (attemptsRes?.success) {
            const attemptMap = (attemptsRes.data || []).reduce((acc, attempt) => {
              acc[attempt.practiceTest?._id || attempt.practiceTest] = attempt;
              return acc;
            }, {});
        fetchedTests = fetchedTests.map(test => ({
          ...test,
          questionCount: test.questionCount || test.questions?.length || 0,
          userAttempt: attemptMap[test._id]
        }));
          }
        }
        setTests(fetchedTests);
        setTotalPages(res.pagination?.pages || 1);
        if (res.pattern) setPattern(res.pattern);
      } else {
        setError('Failed to load tests.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  }, [patternId]);

  useEffect(() => {
    setUser(getCurrentUser());
    if (!initialTests.length && !initialError) fetchTests(page);
  }, [patternId, page, fetchTests, initialTests.length, initialError]);

  const handleStartTest = (test) => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      return;
    }
    if (!test.isFree && !user.hasSubscription) {
      router.push('/subscription');
      return;
    }
    router.push(`/govt-exams/test/${test._id}/start`);
  };

  const handleViewResult = (test) => {
    if (!test?.userAttempt?._id) return;
    router.push(`/govt-exams/test/${test._id}/result?attempt=${test.userAttempt._id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-10">
        <Skeleton height="150px" borderRadius="2rem" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} height="100px" borderRadius="1.5rem" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <Head>
        <title>{seo?.title || 'Practice Tests'}</title>
      </Head>

      <section className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="font-black">
          <ArrowLeft className="w-5 h-5" />
          GO BACK
        </Button>
      </section>

      {/* --- Pattern Quest Card --- */}
      <Card className="bg-gradient-to-br from-accent-purple to-indigo-600 text-white border-none shadow-[0_4px_0_0_#b366ff] overflow-hidden relative">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm">
            <Zap className="w-4 h-4" />
            Practice Tests
          </div>
          <h1 className="text-xl lg:text-3xl font-black font-outfit uppercase leading-tight">{pattern?.title || 'Exam Pattern'}</h1>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm font-bold opacity-90 uppercase tracking-wide">
              <Clock className="w-4 h-4" /> {pattern?.duration || '60'}m
            </div>
            <div className="flex items-center gap-2 text-sm font-bold opacity-90 uppercase tracking-wide">
              <Trophy className="w-4 h-4" /> {pattern?.totalMarks || '100'} Marks
            </div>
          </div>
        </div>
        <Award className="absolute -bottom-10 -right-10 w-24 lg:w-48 h-24 lg:h-48 text-white/10 -rotate-12" />
      </Card>

      {/* --- Quests List --- */}
      <section className="space-y-6">
        <h2 className="text-xl lg:text-2xl font-black text-gray-800 dark:text-gray-100 font-outfit uppercase px-1">Select A Quest</h2>

        <div className="space-y-4">
          {tests.map((test, idx) => {
            const isCompleted = test.userAttempt?.status === 'Completed';
            const isLocked = !test.isFree && !user?.hasSubscription;

            return (
              <motion.div
                key={test._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`group border-2 transition-all p-0 overflow-hidden shadow-md ${isLocked ? 'grayscale opacity-75' : 'hover:border-accent-purple'}`}>
                  <div className="flex flex-col sm:flex-row items-center">
                    {/* Status Pillar */}
                    <div className={`w-full sm:w-16 h-2 sm:h-auto self-stretch ${isCompleted ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'} transition-colors`} />

                    <div className="flex-1 p-5 flex flex-col sm:flex-row items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'} transition-colors`}>
                        {isCompleted ? <Award className="w-9 h-9" /> : <Play className="w-8 h-8" />}
                      </div>

                      <div className="flex-1 text-center sm:text-left space-y-1">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 font-outfit uppercase line-clamp-1">{test.title}</h3>
                          {isLocked ? <Lock className="w-4 h-4 text-accent-red" /> : <Unlock className="w-4 h-4 text-primary-500" />}
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase">
                          {test.questionCount || 0} Questions • {test.totalMarks || 100} Marks
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {isCompleted && (
                          <Button variant="ghost" size="sm" onClick={() => handleViewResult(test)} className="!rounded-full px-4 border-2">
                            RESULTS <Eye className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                        <Button
                          variant={isCompleted ? "ghost" : "primary"}
                          size="md"
                          disabled={isLocked}
                          onClick={() => handleStartTest(test)}
                          className={`min-w-[120px] ${isCompleted ? 'text-primary-600 border-2 border-primary-500' : ''}`}
                        >
                          {isCompleted ? 'RETAKE' : 'START'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {tests.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <ShieldAlert className="w-20 h-20 text-gray-300 mx-auto" />
            <h3 className="text-xl lg:text-2xl font-black text-gray-400 uppercase">No Quests Available</h3>
            <p className="text-gray-400 font-bold">Check back soon for new content!</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-8">
            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <span className="font-black text-gray-400">PAGE {page} OF {totalPages}</span>
            <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default PatternTests;

export async function getServerSideProps({ params, query }) {
  const dbConnect = (await import('../../../../lib/db')).default;
  const PracticeTest = (await import('../../../../models/PracticeTest')).default;
  const ExamPattern = (await import('../../../../models/ExamPattern')).default;
  const patternId = params?.patternId;
  const page = parseInt(query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    await dbConnect();
    const [tests, total, pattern] = await Promise.all([
      PracticeTest.find({ examPattern: patternId }).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
      PracticeTest.countDocuments({ examPattern: patternId }),
      ExamPattern.findById(patternId).populate({ path: 'exam', populate: { path: 'category' } }).lean()
    ]);

    if (!pattern) return { notFound: true };

    return {
      props: {
        patternId,
        initialPattern: JSON.parse(JSON.stringify(pattern)),
        initialTests: JSON.parse(JSON.stringify(tests.map(t => ({
          ...t,
          questionCount: t.questionCount || t.questions?.length || 0
        })))),
        initialPagination: { page, pages: Math.ceil(total / limit) }
      }
    };
  } catch (error) {
    return { props: { initialError: 'An error occurred.' } };
  }
}
