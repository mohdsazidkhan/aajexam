/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fmtNum } from '../../../../lib/utils/formatNumber';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Seo from '../../../../components/common/Seo';
import {
  Trophy,
  Target,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Home,
  CircleCheck,
  XCircle,
  TrendingUp,
  Award,
  Crown,
  ChevronRight
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

import API from '../../../../lib/api';
import { getCurrentUser } from '../../../../lib/utils/authUtils';
import Button from '../../../../components/common/ui/Button';
import Card from '../../../../components/common/ui/Card';
import ProgressBar from '../../../../components/common/ui/ProgressBar';
import Skeleton from '../../../../components/common/Skeleton';
import ShareComponent from '../../../../components/common/ShareComponent';
import DiscussionThread from '../../../../components/common/discussions/DiscussionThread';
import useTranslate from '../../../../hooks/useTranslate';

const TestResult = ({ resolvedId } = {}) => {
  const { translate } = useTranslate();
  const router = useRouter();
  const { attempt } = router.query;
  const testId = resolvedId || router.query.testId;
  const user = getCurrentUser();

  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbStats, setLbStats] = useState({ totalParticipants: 0, topScore: 0, avgScore: 0, avgAccuracy: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // summary, review
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [detailedTest, setDetailedTest] = useState(null);

  useEffect(() => {
    if (!router.isReady || !testId || !attempt) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [lbRes, attemptRes] = await Promise.all([
          API.getTestLeaderboard(testId, { limit: 10 }),
          API.getTestAttemptDetail(testId, attempt)
        ]);

        if (lbRes?.success) {
          setLeaderboard(lbRes.data || []);
          if (lbRes.stats) setLbStats(lbRes.stats);
        }
        if (attemptRes?.success) {
          setAttemptDetail(attemptRes.data.attempt);
          setDetailedTest(attemptRes.data.test);
          setResult({
            score: attemptRes.data.attempt.score,
            accuracy: attemptRes.data.attempt.accuracy,
            correctCount: attemptRes.data.attempt.correctCount,
            wrongCount: attemptRes.data.attempt.wrongCount,
            totalTime: attemptRes.data.attempt.totalTime,
            rank: attemptRes.data.attempt.rank,
            percentile: attemptRes.data.attempt.percentile,
            testTitle: attemptRes.data.test.title,
            totalQuestions: attemptRes.data.test.questions.length,
            sectionWiseScore: attemptRes.data.sectionWiseScore || {}
          });
        }
      } catch (err) {
        console.error(err);
        setError(translate('Failed to load results.'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- translate/fetch helper only feed toasts; re-running on language change would refetch or repeat side effects
  }, [router.isReady, testId, attempt]);

  const formatTime = (val) => {
    if (!val) return "0m 0s";
    // Detect if value is in microseconds (excessively large for ms)
    // 3.6e7 ms = 10 hours. Anything larger is likely microseconds from backend.
    const isMicro = val > 36000000;
    const totalSeconds = Math.floor(isMicro ? val / 1000000 : val / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) return (
    <div className="space-y-4 xl:space-y-8 animate-fade-in py-4 xl:py-8">
      <Skeleton height="300px" borderRadius="1rem" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" borderRadius="1.5rem" />)}
      </div>
      <Skeleton height="400px" borderRadius="1.5rem" />
    </div>
  );

  const accuracy = result?.accuracy || 0;
  const isGreat = accuracy >= 80;
  const percentile = Number(result?.percentile || 0);
  const percentileBand = percentile >= 99 ? 'Top 1%'
    : percentile >= 95 ? 'Top 5%'
    : percentile >= 90 ? 'Top 10%'
    : percentile >= 75 ? 'Top 25%'
    : percentile >= 50 ? 'Top Half'
    : 'Keep Pushing';
  const beatPct = percentile > 0 ? percentile.toFixed(1) : '0';

  return (
    <div className="container mx-auto space-y-6 xl:space-y-10 animate-fade-in pb-24">
      <Seo title={`Result – ${result?.testTitle || 'Test'} | AajExam`} description="Your AajExam practice test result." noIndex={true} />

      {/* --- Celebration Hero --- */}
      <section className="relative">
        {isGreat && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-12 -left-12 z-20 pointer-events-none"
          >
            <Trophy className="w-20 xl:w-32 h-20 xl:h-32 text-primary-600" />
          </motion.div>
        )}

        <Card className={`
          relative overflow-hidden text-center py-8 px-5 xl:py-12 xl:px-8 border-none 
          ${isGreat ? 'text-content-primary border border-border-primary bg-background-surface' : 'bg-background-surface'}
        `}>
          <header className="relative z-10 space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-2"
            >
              <h1 className="text-2xl xl:text-5xl font-bold font-outfit tracking-tight">
                {isGreat ? translate('Excellent Result!') : translate('Good Effort!')}
              </h1>
              <p className="text-xl font-bold opacity-80 tracking-[0.08em]">
                {translate('Test: {title}', { title: result?.testTitle })}
              </p>
            </motion.div>

            <div className="flex justify-center items-center gap-6 xl:gap-12 py-4">
              <div className="flex flex-col items-center">
                <span className="text-xl xl:text-5xl font-bold font-outfit tracking-tight">{fmtNum(result?.score)}</span>
                <span className="text-sm font-bold uppercase opacity-60">{translate('Score')}</span>
              </div>
              <div className="h-20 w-1 bg-primary-300/60 dark:bg-white/20 rounded-full" />
              <div className="flex flex-col items-center">
                <span className="text-xl xl:text-5xl font-bold font-outfit tracking-tight">{accuracy.toFixed(0)}%</span>
                <span className="text-sm font-bold uppercase opacity-60">{translate('Accuracy')}</span>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <ProgressBar progress={accuracy} color="white" height="h-4" />
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.08em] opacity-80">
                {accuracy >= 90 ? translate('Outstanding Performance') : accuracy >= 80 ? translate('Strong Performance') : translate('Keep Practicing')}
              </p>
            </div>

            {lbStats.totalParticipants > 0 && result?.rank && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3 rounded-full border border-border-primary"
              >
                <span className="text-base xl:text-lg font-bold tracking-wide">
                  {translate('All India Rank')} <span className="text-primary-600">#{result.rank}</span> {translate('of {total}', { total: lbStats.totalParticipants.toLocaleString('en-IN') })}
                </span>
                <span className="hidden sm:inline h-5 w-px bg-primary-300 dark:bg-white/30" />
                <span className="text-xs xl:text-sm font-bold uppercase tracking-[0.08em] px-3 py-1 rounded-full text-on-primary bg-primary-600">
                  {translate('{band} · Beat {pct}% candidates', { band: translate(percentileBand), pct: beatPct })}
                </span>
              </motion.div>
            )}
          </header>

          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Target className="w-64 h-64 rotate-12" />
          </div>
        </Card>
      </section>

      {/* --- Key Metrics Grid --- */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'All India Rank',
            value: result?.rank ? `#${result.rank}` : 'N/A',
            sub: lbStats.totalParticipants > 0 ? translate('of {total}', { total: lbStats.totalParticipants.toLocaleString('en-IN') }) : null,
            icon: Award,
            color: ''
          },
          {
            label: 'Percentile',
            value: result?.percentile != null ? `${percentile.toFixed(1)}` : 'N/A',
            sub: result?.percentile != null ? translate('Beat {pct}%', { pct: beatPct }) : null,
            icon: TrendingUp,
            color: ''
          },
          {
            label: 'Top Score',
            value: lbStats.topScore ? fmtNum(lbStats.topScore) : '—',
            sub: result?.score != null ? translate('You: {score}', { score: fmtNum(result.score) }) : null,
            icon: Crown,
            color: ''
          },
          {
            label: 'Time',
            value: formatTime(result?.totalTime),
            sub: translate('Avg: {time}', { time: formatTime(lbStats.avgTime) }),
            icon: Clock,
            color: ''
          }
        ].map((item, idx) => (
          <Card as="article" key={idx} className="flex flex-col items-center text-center gap-1.5 hover:-translate-y-0.5 transition-all">
            <div className="w-14 h-14 shrink-0 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 16 }}>
              <item.icon className="w-6 h-6 xl:w-7 xl:h-7" />
            </div>
            <span className="text-xl xl:text-2xl font-bold font-outfit">{item.value}</span>
            <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">{translate(item.label)}</span>
            {item.sub && <span className="text-[10px] font-bold text-content-muted">{item.sub}</span>}
          </Card>
        ))}
      </section>

      {/* --- Section Tabs --- */}
      <section className="space-y-6">
        <div className="flex gap-4 p-2 bg-background-surface-secondary rounded-3xl w-fit mx-auto xl:mx-0">
          {['summary', 'review'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                 px-8 py-3 rounded-full font-bold uppercase text-sm transition-all
                 ${activeTab === tab ? 'text-on-primary bg-primary-600' : 'text-content-muted hover:text-content-primary'}
               `}
            >
              {translate(tab)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'summary' ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              {/* Leaderboard */}
              <div className="space-y-2 xl:space-y-4">
                <section className="flex items-end justify-between px-2 gap-2 flex-wrap">
                  <h2 className="text-xl font-bold font-outfit">{translate('Leaderboard')}</h2>
                  {lbStats.totalParticipants > 0 && (
                    <span className="text-[11px] font-bold text-content-muted uppercase tracking-[0.08em]">
                      {lbStats.totalParticipants.toLocaleString('en-IN')} candidates · Top {Math.min(leaderboard.length, lbStats.totalParticipants)}
                    </span>
                  )}
                </section>
                <Card padded={false} className="overflow-hidden">
                  <table className="w-full">
                    <thead className="text-primary-900 dark:text-white text-xs font-bold uppercase border-b border-border-primary bg-background-surface">
                      <tr>
                        <th className="px-6 py-4 text-left">{translate('Player')}</th>
                        <th className="px-6 py-4 text-center">{translate('Score')}</th>
                        <th className="px-6 py-4 text-right">{translate('Rank')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-primary">
                      {leaderboard.map((entry, idx) => {
                        const isUser = entry.user?._id === user?.id;
                        const displayRank = entry.rank || idx + 1;
                        return (
                          <tr key={idx} className={`border-b dark:border-slate-700 last:border-0 ${isUser ? '' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${displayRank === 1 ? 'text-amber-950 bg-amber-600' : 'bg-background-surface-secondary'}`}>
                                  {displayRank === 1 ? <Crown className="w-4 h-4" /> : displayRank}
                                </div>
                                <span className="font-bold text-sm">{entry.user?.name || translate('Anonymous Player')}</span>
                                {isUser && <span className="text-[10px] bg-primary-600 text-on-primary px-2 py-0.5 rounded-full font-bold uppercase">{translate('YOU')}</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-bold">{fmtNum(entry.score)}</td>
                            <td className="px-6 py-4 text-right font-bold text-content-muted">#{displayRank}</td>
                          </tr>
                        );
                      })}

                      {result?.rank && result.rank > leaderboard.length && (
                        <tr className="border-t-2 border-primary-500/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-primary-600 text-on-primary">
                                {result.rank}
                              </div>
                              <span className="font-bold text-sm">{user?.name || translate('You')}</span>
                              <span className="text-[10px] bg-primary-600 text-on-primary px-2 py-0.5 rounded-full font-bold uppercase">{translate('YOUR POSITION')}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold">{fmtNum(result.score)}</td>
                          <td className="px-6 py-4 text-right font-bold text-primary-600">#{result.rank}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Card>
              </div>

              {/* Section breakdown */}
              <section className="space-y-2 xl:space-y-4">
                <h2 className="text-xl font-bold font-outfit px-2">{translate('Section Performance')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.entries(result?.sectionWiseScore || {}).map(([name, stats], idx) => (
                    <Card as="article" key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-xs uppercase tracking-[0.08em]">{name}</span>
                        <span className="font-bold text-primary-600">{translate('{score} pts', { score: fmtNum(stats.score) })}</span>
                      </div>
                      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-background-surface-secondary">
                        <div className="bg-primary-600 h-full" style={{ width: `${(stats.correct / (stats.correct + stats.wrong || 1)) * 100}%` }} />
                        <div className="bg-red-500/70 h-full flex-1"/>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold mt-2 text-content-muted uppercase">
                        <span>{translate('{count} Correct', { count: stats.correct })}</span>
                        <span>{translate('{count} Wrong', { count: stats.wrong })}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {detailedTest?.questions.map((q, idx) => {
                const attempt = attemptDetail?.answers?.find(a => a.questionId === q._id);
                const isCorrect = attempt?.isCorrect;
                const isSkipped = attempt?.selectedIndex === -1 || !attempt;

                return (
                  <Card as="section" key={idx} className={`p-0 overflow-hidden border ${isCorrect ? 'border-primary-500/20' : isSkipped ? 'border-border-primary' : 'border-red-300 dark:border-red-500/40'}`}>
                    <section className={`p-3 xl:p-6 border-b flex justify-between items-start ${isCorrect ? '' : isSkipped ? 'bg-background-surface-secondary' : 'bg-red-50 dark:bg-red-500/10'}`}>
                      <div className="space-y-1">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.08em] ${isCorrect ? 'text-primary-600' : isSkipped ? 'text-content-muted' : 'text-red-600 dark:text-red-400'}`}>
                          {isCorrect ? translate('PERFECT') : isSkipped ? translate('SKIPPED') : translate('INCORRECT')}
                        </span>
                        <h3 className="text-lg font-bold leading-tight whitespace-pre-wrap">{q.questionText}</h3>
                      </div>
                      {isCorrect ? <CircleCheck className="text-primary-600 w-8 h-8" /> : isSkipped ? <Target className="text-gray-300 w-8 h-8" /> : <XCircle className="text-red-600 dark:text-red-400 w-8 h-8" />}
                    </section>

                    <div className="p-3 xl:p-6 space-y-2 xl:space-y-4">
                      {q.questionImage && (
                        <img src={q.questionImage} alt="" className="max-h-72 rounded-lg xl:rounded-xl border border-border-primary object-contain bg-background-surface" />
                      )}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = attempt?.selectedIndex === oIdx;
                          const isAnswer = q.correctAnswerIndex === oIdx;
                          const optImg = q.optionImages?.[oIdx] || '';

                          return (
                            <div key={oIdx} data-opt-state={isAnswer ? 'correct' : isSelected ? 'wrong' : undefined} className={`
                                  p-3 rounded-2xl flex items-center gap-3 border text-sm
                                  ${isAnswer ? 'border-primary-600 text-primary-600' :
                                isSelected ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-700 dark:text-red-400' :
                                  'bg-background-surface border-border-primary text-content-muted'}
                                `}>
                              <div className={`w-8 h-8 rounded-lg xl:rounded-xl flex items-center justify-center font-bold shrink-0 ${isAnswer ? 'bg-primary-600 text-on-primary' : 'bg-background-surface-secondary text-content-muted'}`}>
                                {String.fromCharCode(65 + oIdx)}
                              </div>
                              <div className="flex-1 flex flex-col gap-2">
                                {opt && <span className="font-bold">{opt}</span>}
                                {optImg && <img src={optImg} alt="" className="max-h-32 rounded-lg object-contain bg-background-surface" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {(q.explanation || q.explanationImage) && (
                        <div className="p-4 rounded-2xl border-l-4 border-primary-600">
                          <p className="text-xs font-bold text-primary-600 uppercase mb-1">{translate('Explanation')}</p>
                          {q.explanation && <p className="text-sm font-medium leading-relaxed">{q.explanation}</p>}
                          {q.explanationImage && (
                            <img src={q.explanationImage} alt="Solution diagram" loading="lazy" className="max-h-72 mt-2 rounded-lg xl:rounded-xl border border-border-primary object-contain bg-background-surface" />
                          )}
                        </div>
                      )}

                      <DiscussionThread
                        questionId={q._id}
                        sourceType="govt_exam_test"
                        sourceId={testId}
                      />
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- Share Result --- */}
      {mounted && result && (
        <section className="px-0 py-4 xl:py-8">
          <Card as="section" className="dark:bg-slate-800">
            <section className="text-center space-y-2 mb-4">
              <h2 className="text-xl xl:text-2xl font-bold font-outfit">{translate('Flex your result')}</h2>
              <p className="text-sm text-content-secondary max-w-md mx-auto">
                {result.rank && lbStats.totalParticipants > 0
                  ? translate('Share your All India Rank #{rank} of {total} with friends', { rank: result.rank, total: lbStats.totalParticipants.toLocaleString('en-IN') })
                  : translate('Share your score and challenge friends to beat it')}
              </p>
            </section>
            <ShareComponent
              url={(() => {
                const p = new URLSearchParams();
                if (result.rank) p.set('rank', String(result.rank));
                if (lbStats.totalParticipants) p.set('total', String(lbStats.totalParticipants));
                if (result.percentile != null) p.set('pct', String(result.percentile));
                if (result.score != null) p.set('score', String(fmtNum(result.score)));
                if (result.accuracy != null) p.set('accuracy', String(result.accuracy));
                if (result.testTitle) p.set('testTitle', result.testTitle);
                if (user?.name) p.set('user', user.name);
                return `${window.location.origin}/share/result?${p.toString()}`;
              })()}
              text={
                result.rank && lbStats.totalParticipants > 0
                  ? `I scored All India Rank #${result.rank} of ${lbStats.totalParticipants.toLocaleString('en-IN')} in ${result.testTitle} on AajExam. Think you can beat me?`
                  : `I scored ${fmtNum(result.score)} in ${result.testTitle} on AajExam. Think you can beat me?`
              }
            />
          </Card>
        </section>
      )}

      {/* --- Action Bar --- */}
      <section className="flex flex-col xl:flex-row justify-center items-center gap-4 px-0 py-4 xl:py-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => router.push(`/govt-exams/test/${testId}/start`)}
          className="xl:w-auto px-12 py-6 text-xl"
        >
          <RotateCcw className="w-6 h-6 mr-2" /> RETAKE TEST
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => router.push('/govt-exams')}
          className="xl:w-auto px-12 py-6 text-xl"
        >
          <Home className="w-6 h-6 mr-2" /> BACK TO TESTS
        </Button>
      </section>
    </div>
  );
};

export default TestResult;

export async function getServerSideProps({ params, query }) {
  const dbConnect = (await import('../../../../lib/db')).default;
  const PracticeTest = (await import('../../../../models/PracticeTest')).default;
  const { isObjectId } = await import('../../../../lib/web/slugRouting');
  const segment = params?.testId;
  if (!segment) return { notFound: true };

  // Preserve query string (?attempt=...) across the slug redirect.
  const qs = Object.entries(query || {})
    .filter(([k]) => k !== 'testId')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const tail = qs ? `?${qs}` : '';

  try {
    await dbConnect();

    if (isObjectId(segment)) {
      const idDoc = await PracticeTest.findById(segment).select('slug').lean();
      if (idDoc?.slug) {
        return { redirect: { destination: `/govt-exams/test/${idDoc.slug}/result${tail}`, permanent: true } };
      }
      if (!idDoc) return { notFound: true };
      return { props: { resolvedId: segment } };
    }

    const doc = await PracticeTest.findOne({ slug: segment }).select('_id').lean();
    if (!doc) return { notFound: true };

    return { props: { resolvedId: String(doc._id) } };
  } catch (e) {
    console.error('test result ssr error', e);
    return { notFound: true };
  }
}
