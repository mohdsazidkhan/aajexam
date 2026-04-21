'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../../../lib/api';
import { getCurrentUser } from '../../../../lib/utils/authUtils';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ProgressBar from '../../../../components/ui/ProgressBar';
import Skeleton from '../../../../components/Skeleton';
import ShareComponent from '../../../../components/ShareComponent';

const TestResult = () => {
  const router = useRouter();
  const { testId, attempt } = router.query;
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
        setError('Failed to load results.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    <div className="space-y-8 animate-fade-in py-10">
      <Skeleton height="300px" borderRadius="2.5rem" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    <div className="space-y-6 lg:space-y-10 animate-fade-in pb-24 max-w-5xl mx-auto">
      <Head>
        <title>Result: {result?.testTitle || 'Test'}</title>
      </Head>

      {/* --- Celebration Hero --- */}
      <section className="relative">
        {isGreat && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-12 -left-12 z-20 pointer-events-none"
          >
            <Trophy className="w-20 lg:w-32 h-20 lg:h-32 text-yellow-400 rotate-[-15deg] drop-shadow-2xl" />
          </motion.div>
        )}

        <Card className={`
          relative overflow-hidden text-center py-8 px-5 lg:py-12 lg:px-8 border-none shadow-2xl
          ${isGreat ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white' : 'bg-white dark:bg-slate-800'}
        `}>
          <div className="relative z-10 space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-2"
            >
              <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">
                {isGreat ? 'Excellent Result!' : 'Good Effort!'}
              </h1>
              <p className="text-xl font-bold opacity-80 uppercase tracking-widest">
                Test: {result?.testTitle}
              </p>
            </motion.div>

            <div className="flex justify-center items-center gap-6 lg:gap-12 py-4">
              <div className="flex flex-col items-center">
                <span className="text-xl lg:text-5xl font-black font-outfit tracking-tighter">{result?.score}</span>
                <span className="text-sm font-black uppercase opacity-60">Score</span>
              </div>
              <div className="h-20 w-1 bg-white/20 rounded-full" />
              <div className="flex flex-col items-center">
                <span className="text-xl lg:text-5xl font-black font-outfit tracking-tighter">{accuracy.toFixed(0)}%</span>
                <span className="text-sm font-black uppercase opacity-60">Accuracy</span>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <ProgressBar progress={accuracy} color="white" height="h-4" />
              <p className="mt-4 text-sm font-black uppercase tracking-widest opacity-80">
                {accuracy >= 90 ? 'Outstanding Performance' : accuracy >= 80 ? 'Strong Performance' : 'Keep Practicing'}
              </p>
            </div>

            {lbStats.totalParticipants > 0 && result?.rank && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm"
              >
                <span className="text-base lg:text-lg font-black tracking-wide">
                  All India Rank <span className="text-yellow-300">#{result.rank}</span> of {lbStats.totalParticipants.toLocaleString('en-IN')}
                </span>
                <span className="hidden sm:inline h-5 w-px bg-white/30" />
                <span className="text-xs lg:text-sm font-black uppercase tracking-widest px-3 py-1 rounded-full bg-yellow-300 text-yellow-900">
                  {percentileBand} · Beat {beatPct}% candidates
                </span>
              </motion.div>
            )}
          </div>

          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Target className="w-64 h-64 rotate-12" />
          </div>
        </Card>
      </section>

      {/* --- Key Metrics Grid --- */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'All India Rank',
            value: result?.rank ? `#${result.rank}` : 'N/A',
            sub: lbStats.totalParticipants > 0 ? `of ${lbStats.totalParticipants.toLocaleString('en-IN')}` : null,
            icon: Award,
            color: 'text-yellow-500'
          },
          {
            label: 'Percentile',
            value: result?.percentile != null ? `${percentile.toFixed(1)}` : 'N/A',
            sub: result?.percentile != null ? `Beat ${beatPct}%` : null,
            icon: TrendingUp,
            color: 'text-primary-500'
          },
          {
            label: 'Top Score',
            value: lbStats.topScore ? lbStats.topScore : '—',
            sub: result?.score != null ? `You: ${result.score}` : null,
            icon: Crown,
            color: 'text-amber-500'
          },
          {
            label: 'Time',
            value: formatTime(result?.totalTime),
            sub: `Avg: ${formatTime(lbStats.avgTime)}`,
            icon: Clock,
            color: 'text-purple-500'
          }
        ].map((item, idx) => (
          <Card key={idx} className="flex flex-col items-center text-center p-6 gap-1.5 border-2 hover:border-primary-500 transition-colors">
            <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center ${item.color}`}>
              <item.icon className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <span className="text-xl lg:text-2xl font-black font-outfit">{item.value}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
            {item.sub && <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{item.sub}</span>}
          </Card>
        ))}
      </section>

      {/* --- Section Tabs --- */}
      <section className="space-y-6">
        <div className="flex gap-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-[2rem] w-fit mx-auto lg:mx-0">
          {['summary', 'review'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                 px-8 py-3 rounded-full font-black uppercase text-sm transition-all
                 ${activeTab === tab ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}
               `}
            >
              {tab}
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
              <div className="space-y-4">
                <div className="flex items-end justify-between px-2 gap-2 flex-wrap">
                  <h3 className="text-xl font-black font-outfit uppercase">Leaderboard</h3>
                  {lbStats.totalParticipants > 0 && (
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                      {lbStats.totalParticipants.toLocaleString('en-IN')} candidates · Top {Math.min(leaderboard.length, lbStats.totalParticipants)}
                    </span>
                  )}
                </div>
                <Card className="p-0 overflow-hidden border-2">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs font-black uppercase text-gray-400 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left">Player</th>
                        <th className="px-6 py-4 text-center">Score</th>
                        <th className="px-6 py-4 text-right">Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, idx) => {
                        const isUser = entry.user?._id === user?.id;
                        const displayRank = entry.rank || idx + 1;
                        return (
                          <tr key={idx} className={`border-b dark:border-slate-700 last:border-0 ${isUser ? 'bg-primary-500/10' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${displayRank === 1 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                  {displayRank === 1 ? <Crown className="w-4 h-4" /> : displayRank}
                                </div>
                                <span className="font-bold text-sm">{entry.user?.name || 'Anonymous Player'}</span>
                                {isUser && <span className="text-[10px] bg-primary-500 text-white px-2 py-0.5 rounded-full font-black uppercase">YOU</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-black">{entry.score}</td>
                            <td className="px-6 py-4 text-right font-bold text-gray-400">#{displayRank}</td>
                          </tr>
                        );
                      })}

                      {result?.rank && result.rank > leaderboard.length && (
                        <tr className="border-t-2 border-primary-500/30 bg-primary-500/10">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs bg-primary-500 text-white">
                                {result.rank}
                              </div>
                              <span className="font-bold text-sm">{user?.name || 'You'}</span>
                              <span className="text-[10px] bg-primary-500 text-white px-2 py-0.5 rounded-full font-black uppercase">YOUR POSITION</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-black">{result.score}</td>
                          <td className="px-6 py-4 text-right font-bold text-primary-600">#{result.rank}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Card>
              </div>

              {/* Section breakdown */}
              <div className="space-y-4">
                <h3 className="text-xl font-black font-outfit uppercase px-2">Section Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(result?.sectionWiseScore || {}).map(([name, stats], idx) => (
                    <Card key={idx} className="p-4 border-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-xs uppercase tracking-wider">{name}</span>
                        <span className="font-black text-primary-500">{stats.score} pts</span>
                      </div>
                      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700">
                        <div className="bg-green-500 h-full" style={{ width: `${(stats.correct / (stats.correct + stats.wrong || 1)) * 100}%` }} />
                        <div className="bg-accent-red h-full flex-1" />
                      </div>
                      <div className="flex justify-between text-[10px] font-black mt-2 text-gray-400 uppercase">
                        <span>{stats.correct} Correct</span>
                        <span>{stats.wrong} Wrong</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
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
                  <Card key={idx} className={`p-0 overflow-hidden border-2 ${isCorrect ? 'border-green-500/20' : isSkipped ? 'border-gray-200' : 'border-accent-red/20'}`}>
                    <div className={`p-3 lg:p-6 border-b flex justify-between items-start ${isCorrect ? 'bg-green-500/5' : isSkipped ? 'bg-gray-50' : 'bg-accent-red/5'}`}>
                      <div className="space-y-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'text-green-500' : isSkipped ? 'text-gray-400' : 'text-accent-red'}`}>
                          {isCorrect ? 'PERFECT' : isSkipped ? 'SKIPPED' : 'INCORRECT'}
                        </span>
                        <h4 className="text-lg font-bold leading-tight whitespace-pre-wrap">{q.questionText}</h4>
                      </div>
                      {isCorrect ? <CircleCheck className="text-green-500 w-8 h-8" /> : isSkipped ? <Target className="text-gray-300 w-8 h-8" /> : <XCircle className="text-accent-red w-8 h-8" />}
                    </div>

                    <div className="p-3 lg:p-6 space-y-4">
                      {q.questionImage && (
                        <img src={q.questionImage} alt="" className="max-h-72 rounded-xl border border-slate-200 dark:border-slate-700 object-contain bg-white" />
                      )}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = attempt?.selectedIndex === oIdx;
                          const isAnswer = q.correctAnswerIndex === oIdx;
                          const optImg = q.optionImages?.[oIdx] || '';

                          return (
                            <div key={oIdx} className={`
                                  p-3 rounded-2xl flex items-start gap-3 border-2 text-sm
                                  ${isAnswer ? 'bg-green-100 border-green-500 text-green-700' :
                                isSelected ? 'bg-accent-red/10 border-accent-red text-accent-red' :
                                  'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}
                                `}>
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black shrink-0 ${isAnswer ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                {String.fromCharCode(65 + oIdx)}
                              </div>
                              <div className="flex-1 flex flex-col gap-2">
                                {opt && <span className="font-bold">{opt}</span>}
                                {optImg && <img src={optImg} alt="" className="max-h-32 rounded-lg object-contain bg-white" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="p-4 bg-primary-100/50 dark:bg-primary-900/10 rounded-2xl border-l-4 border-primary-500">
                          <p className="text-xs font-black text-primary-600 uppercase mb-1">Explanation</p>
                          <p className="text-sm font-medium leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
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
        <section className="pt-4">
          <Card className="p-6 lg:p-8 border-2 bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40">
            <div className="text-center space-y-2 mb-4">
              <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">Flex your result</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {result.rank && lbStats.totalParticipants > 0
                  ? `Share your All India Rank #${result.rank} of ${lbStats.totalParticipants.toLocaleString('en-IN')} with friends`
                  : 'Share your score and challenge friends to beat it'}
              </p>
            </div>
            <ShareComponent
              url={(() => {
                const p = new URLSearchParams();
                if (result.rank) p.set('rank', String(result.rank));
                if (lbStats.totalParticipants) p.set('total', String(lbStats.totalParticipants));
                if (result.percentile != null) p.set('pct', String(result.percentile));
                if (result.score != null) p.set('score', String(result.score));
                if (result.accuracy != null) p.set('accuracy', String(result.accuracy));
                if (result.testTitle) p.set('testTitle', result.testTitle);
                if (user?.name) p.set('user', user.name);
                return `${window.location.origin}/share/result?${p.toString()}`;
              })()}
              text={
                result.rank && lbStats.totalParticipants > 0
                  ? `I scored All India Rank #${result.rank} of ${lbStats.totalParticipants.toLocaleString('en-IN')} in ${result.testTitle} on AajExam. Think you can beat me?`
                  : `I scored ${result.score} in ${result.testTitle} on AajExam. Think you can beat me?`
              }
            />
          </Card>
        </section>
      )}

      {/* --- Action Bar --- */}
      <section className="flex flex-col lg:flex-row justify-center items-center gap-4 pt-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => router.push(`/govt-exams/test/${testId}/start`)}
          className="lg:w-auto px-12 py-6 text-xl"
        >
          <RotateCcw className="w-6 h-6 mr-2" /> RETAKE TEST
        </Button>
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={() => router.push('/govt-exams')}
          className="lg:w-auto px-12 py-6 text-xl border-2"
        >
          <Home className="w-6 h-6 mr-2" /> BACK TO TESTS
        </Button>
      </section>
    </div>
  );
};

export default TestResult;
