'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Seo from '../../../../components/common/Seo';
import { generateBreadcrumbSchema } from '../../../../utils/schema';
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
import { m as motion } from 'framer-motion';

import API from '../../../../lib/api';
import { getCurrentUser, isTokenValid, secureLogout } from '../../../../lib/utils/authUtils';
import Button from '../../../../components/common/ui/Button';
import Card from '../../../../components/common/ui/Card';
import ProgressBar from '../../../../components/common/ui/ProgressBar';
import Skeleton from '../../../../components/common/Skeleton';
import { ProBadge } from '../../../../components/common/ui';
import useTranslate from '../../../../hooks/useTranslate';
import Pagination from '../../../../components/common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../../../lib/constants/pagination';

const PatternTests = ({ patternId, initialPattern = null, initialTests = [], initialPagination = null, initialError = '', seo }) => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const [pattern, setPattern] = useState(initialPattern);
  const [tests, setTests] = useState(initialTests);
  const [loading, setLoading] = useState(!initialTests.length && !initialError);
  const [error, setError] = useState(initialError);
  const [page, setPage] = useState(initialPagination?.page || 1);
  const [totalPages, setTotalPages] = useState(initialPagination?.pages || 1);
  const [pageSize, setPageSize] = useState(initialPagination?.limit || PUBLIC_DEFAULT_PAGE_SIZE);
  const firstRun = useRef(true);
  const [user, setUser] = useState(null);

  const fetchTests = useCallback(async (targetPage) => {
    if (!patternId) return;
    try {
      setLoading(true);
      const res = await API.getTestsByPattern(patternId, { page: targetPage, limit: pageSize });
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
        setError(translate('Failed to load tests.'));
      }
    } catch (err) {
      console.error(err);
      setError(translate('An error occurred.'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- translate/fetch helper only feed toasts; re-running on language change would refetch or repeat side effects
  }, [patternId, pageSize]);

  useEffect(() => {
    setUser(getCurrentUser());
    // The server already rendered the first page; refetch only when page/size change afterwards.
    const skipInitial = firstRun.current && (initialTests.length || initialError);
    firstRun.current = false;
    if (!skipInitial) fetchTests(page);
  }, [patternId, page, pageSize, fetchTests, initialTests.length, initialError]);

  const handleStartTest = (test) => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      return;
    }
    // Logic: latest-year PYQ is free, older years are PRO. Full Mocks: first is free, rest are PRO.
    const isPro = (user?.subscriptionStatus || '').toUpperCase() === 'PRO' || user?.role === 'admin';
    let isLocked = false;
    if (!isPro) {
      if (test.isPYQ) {
        isLocked = !test.isLastYear;
      } else if ((user?.fullMockAttemptCount || 0) >= 1) {
        isLocked = true;
      }
    }

    if (isLocked) {
      router.push('/student/subscription');
      return;
    }
    router.push(`/govt-exams/test/${test.slug || test._id}/start`);
  };

  const handleViewResult = (test) => {
    if (!test?.userAttempt?._id) return;
    router.push(`/govt-exams/test/${test.slug}/result?attempt=${test.userAttempt._id}`);
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
      <Seo
        title={seo?.title || 'Pattern Practice Tests | AajExam'}
        description={seo?.description || 'Browse all practice tests under this exam pattern on AajExam – verified questions with detailed solutions and sectional analysis.'}
        canonical={`/govt-exams/pattern/${patternId}/tests`}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Government Exams', url: '/govt-exams' },
          { name: 'Pattern Tests' }
        ])}
      />

      <section className="hidden xl:flex items-center justify-end pt-4">
        <Button variant="secondary" size="sm" onClick={() => router.back()} className="font-black">
          <ArrowLeft className="w-5 h-5" />
          {translate('GO BACK')}
        </Button>
      </section>

      {/* --- Pattern Quest Card --- */}
      <Card className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white border-none shadow-xl ring-1 ring-white/10 overflow-hidden relative">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-primary-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">
            <Zap className="w-4 h-4" />
            {translate('Practice Tests')}
          </div>
          <h1 className="text-xl xl:text-3xl font-black font-outfit uppercase leading-tight">{translateData(pattern?.title) || translate('Exam Pattern')}</h1>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm font-bold opacity-90 uppercase tracking-wide">
              <Clock className="w-4 h-4" /> {pattern?.duration || '60'}m
            </div>
            <div className="flex items-center gap-2 text-sm font-bold opacity-90 uppercase tracking-wide">
              <Trophy className="w-4 h-4" /> {translate('{count} Marks', { count: pattern?.totalMarks || '100' })}
            </div>
          </div>
        </div>
        <Award className="absolute -bottom-10 -right-10 w-24 xl:w-48 h-24 xl:h-48 text-white/10 -rotate-12" />
      </Card>

      {/* --- Quests List --- */}
      <section className="space-y-6">
        <h2 className="text-xl xl:text-2xl font-black text-gray-800 dark:text-gray-100 font-outfit uppercase px-1">{translate('Select A Quest')}</h2>

        <div className="space-y-2 xl:space-y-4">
          {tests.map((test, idx) => {
            const isCompleted = test.userAttempt?.status === 'Completed';
            const isPro = (user?.subscriptionStatus || '').toUpperCase() === 'PRO' || user?.role === 'admin';

            // Logic: latest-year PYQ is free, older years are PRO. Full Mocks: first is free, rest are PRO.
            let isLocked = false;
            if (!isPro) {
              if (test.isPYQ) {
                isLocked = !test.isLastYear;
              } else if ((user?.fullMockAttemptCount || 0) >= 1) {
                isLocked = true;
              }
            }

            return (
              <motion.div
                key={test._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`group border-2 transition-all p-0 overflow-hidden shadow-sm ${isLocked ? 'grayscale opacity-75' : 'hover:border-black dark:hover:border-white'}`}>
                  <div className="flex flex-col sm:flex-row items-center">
                    {/* Status Pillar */}
                    <div className={`w-full sm:w-16 h-2 sm:h-auto self-stretch ${isCompleted ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'} transition-colors`} />

                    <div className="flex-1 p-5 flex flex-col sm:flex-row items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'} transition-colors`}>
                        {isCompleted ? <Award className="w-9 h-9" /> : <Play className="w-8 h-8" />}
                      </div>

                      <div className="flex-1 text-center sm:text-left space-y-1">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 font-outfit uppercase line-clamp-1">{translateData(test.title)}</h3>
                          {isLocked ? <ProBadge size="xs" /> : <Unlock className="w-4 h-4 text-primary-600" />}
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase">
                          {translate('{questions} Questions • {marks} Marks', { questions: test.questionCount || 0, marks: test.totalMarks || 100 })}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {isCompleted && (
                          <Button variant="secondary" size="sm" onClick={() => handleViewResult(test)} className="!rounded-full px-4">
                            {translate('RESULTS')} <Eye className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          size="md"
                          disabled={isLocked}
                          onClick={() => handleStartTest(test)}
                          className="min-w-[120px]"
                        >
                          {isCompleted ? translate('RETAKE') : translate('START')}
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
          <div className="py-20 text-center space-y-2 xl:space-y-4">
            <ShieldAlert className="w-20 h-20 text-gray-300 mx-auto" />
            <h3 className="text-xl xl:text-2xl font-black text-gray-400 uppercase">{translate('No Quests Available')}</h3>
            <p className="text-gray-400 font-bold">{translate('Check back soon for new content!')}</p>
          </div>
        )}

        {/* Pagination */}
        <div className="pt-8"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
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
  const limit = [12, 24, 50, 100, 200, 500].includes(parseInt(query.limit, 10)) ? parseInt(query.limit, 10) : 24;
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
        initialPagination: { page, pages: Math.ceil(total / limit), limit }
      }
    };
  } catch (error) {
    return { props: { initialError: 'An error occurred.' } };
  }
}
