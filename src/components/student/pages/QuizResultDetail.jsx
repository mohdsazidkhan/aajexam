'use client';

import { useEffect, useState } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
  Trophy, CheckCircle, XCircle, Brain, ArrowLeft, ArrowRight, Crown, Home, BrainCircuit, Share2, Users, Clock, Zap, AlertCircle
} from 'lucide-react';
import { QuizResultSkeleton } from '../../common/skeletons/PrivateSkeletons';
import { toast } from 'react-hot-toast';
import API from '../../../lib/api';
import Loading from '../../common/Loading';
import DiscussionThread from '../../common/discussions/DiscussionThread';
import { useAuthStatus } from '../../../hooks/useClientSide';
import useTranslate from '../../../hooks/useTranslate';

// Format seconds → "1m 23s" or "45s"
const formatTime = (sec) => {
  if (!sec || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

// Score-based feedback shown above the result card
const getScoreMessage = (pct) => {
  if (pct >= 90) return { text: 'Outstanding! 🏆', cls: 'text-primary-600 dark:text-primary-300' };
  if (pct >= 75) return { text: 'Great Job! 🎉', cls: 'text-primary-600 dark:text-primary-300' };
  if (pct >= 50) return { text: 'Good Effort! 👍', cls: 'text-blue-600 dark:text-blue-400' };
  if (pct >= 35) return { text: 'Keep Practicing! 💪', cls: 'text-amber-600 dark:text-amber-400' };
  return { text: 'Needs Improvement 📚', cls: 'text-red-600 dark:text-red-400' };
};

// Speed badge config
const getSpeedBadge = (sec, totalQ) => {
  if (!sec || !totalQ) return null;
  const avg = sec; // per-question seconds
  if (avg <= 20) return { label: 'Fast', cls: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' };
  if (avg <= 60) return { label: 'Good', cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white ' };
  return { label: 'Slow', cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white ' };
};

const QuizResultDetail = () => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const { user } = useAuthStatus();
  const { id: attemptId } = router.query;

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);

  useEffect(() => {
    if (!attemptId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await API.getQuizAttemptDetail(attemptId);
        if (res.success) {
          setAttempt(res.data);
          // Fetch leaderboard
          const quizId = res.data.quiz?._id || res.data.quiz;
          if (quizId) {
            const lbRes = await API.getQuizLeaderboard(quizId, 20);
            if (lbRes.success) setLeaderboard(lbRes.data || []);
          }
        } else toast.error(translate('Result not found'));
      } catch (err) {
        console.error(err);
        toast.error(translate('Error loading result'));
      } finally { setLoading(false); }
    };
    fetch();
  }, [attemptId]);

  if (loading) return (
    <div className="min-h-screen pb-8 xl:pb-16 font-outfit">
      <div className="container mx-auto py-6"><QuizResultSkeleton /></div>
    </div>
  );
  if (!attempt) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">{translate('Result not found')}</p></div>;

  const quiz = attempt.quiz;
  const totalTimeTakenSec = attempt.answers?.reduce((sum, a) => sum + (a.timeTaken || 0), 0) || 0;

  const handleChallenge = async () => {
    const isPro = user?.subscriptionStatus?.toUpperCase() === 'PRO' || user?.role === 'admin';
    if (!isPro) {
      toast.error(translate('Only PRO users can challenge friends!'));
      router.push('/student/subscription');
      return;
    }

    try {
      setIsGeneratingChallenge(true);
      const res = await API.request('/api/challenge/create', {
        method: 'POST',
        body: JSON.stringify({ quizId: quiz._id || quiz, attemptId })
      });
      
      if (res.success && res.challengeCode) {
        const link = `${window.location.origin}/challenge/${res.challengeCode}`;
        const shareData = {
          title: translate('Can you beat my score?'),
          text: translate('I scored {score}% on this quiz. I challenge you to beat me!', { score: Math.round(attempt.percentage) }),
          url: link
        };
        
        if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(link);
          toast.success(translate('Challenge link copied to clipboard!'));
        }
      } else {
        toast.error(res.message || translate('Failed to create challenge'));
      }
    } catch (err) {
      toast.error(translate('Something went wrong'));
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <div className="container mx-auto py-6">

        {/* Score Card */}
        <div className="text-center mb-6">
          <div className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 ring-1 ring-slate-200 dark:ring-white/10 shadow-xl p-5 xl:p-8" style={{ borderRadius: 16 }}>
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} /><div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} /><div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-primary-300/25 blur-3xl" style={{ borderRadius: '50%' }} />
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-lg rotate-[-4deg]" style={{ borderRadius: 18 }}>
                <Trophy className="w-8 h-8" />
              </div>
            </div>
            {/* Score-based feedback */}
            <p className={`text-xl xl:text-2xl font-black mb-1 ${getScoreMessage(attempt.percentage || 0).cls}`}>
              {translate(getScoreMessage(attempt.percentage || 0).text)}
            </p>
            {quiz && <h2 className="text-lg xl:text-xl font-bold text-slate-800 dark:text-white mb-1">{translateData(quiz.title) || translate('Quiz')}</h2>}
            {quiz?.subject && <p className="text-sm font-semibold text-slate-600 dark:text-white/75 mb-4">{quiz.applicableExams?.map(e => e.name).join(', ') || ''}{quiz.subject?.name ? ` · ${quiz.subject.name}` : ''}{quiz.topic?.name ? ` · ${quiz.topic.name}` : ''}</p>}

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 xl:gap-3 mb-4">
              <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{attempt.correctCount}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Correct')}</div>
              </div>
              <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{attempt.wrongCount}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Wrong')}</div>
              </div>
              <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{Math.round(attempt.percentage || 0)}%</div>
                <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Score')}</div>
              </div>
              <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{Math.round(attempt.accuracy || 0)}%</div>
                <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Accuracy')}</div>
              </div>
              <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{quiz?.duration ? `${quiz.duration}m` : '—'}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Quiz Total Time')}</div>
              </div>
              <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{formatTime(totalTimeTakenSec) || '0s'}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Total Time Taken')}</div>
              </div>
            </div>

            {attempt.rank && (
              <div className="bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow px-4 py-2 inline-flex items-center gap-2" style={{ borderRadius: 999 }}>
                <Crown className="w-4 h-4" />
                <span className="font-semibold text-sm">{translate('Rank #{rank} · Top {percentile}%', { rank: attempt.rank, percentile: Math.round(attempt.percentile || 0) })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Question Review */}
        <div className="relative overflow-hidden bg-background-surface shadow-md p-4 xl:p-8 border border-slate-200 dark:border-slate-800 mb-6" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 12 }}>
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white">{translate('Question Review')}</h2>
          </div>

          <div className="space-y-5">
            {attempt.answers?.map((ans, index) => {
              const question = ans.question;
              if (!question) return null;
              const correctIndex = question.options?.findIndex(o => o.isCorrect);
              const isSkipped = ans.selectedOptionIndex === -1;
              const isCorrect = ans.isCorrect;
              const timeSec = ans.timeTaken || 0;
              const timeLabel = formatTime(timeSec);
              const speedBadge = getSpeedBadge(timeSec);

              return (
                <div key={index} style={{ borderRadius: 14 }} className={`relative overflow-hidden p-4 xl:p-5 border border-l-4 shadow-sm ${isSkipped ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 border-l-slate-400' : isCorrect ? 'bg-primary-50/60 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 border-l-primary-500' : 'bg-red-50/70 dark:bg-red-900/20 border-red-200 dark:border-red-800 border-l-red-500'}`}>
                  {/* Question header: number + time badge + text */}
                  <div className="flex items-start gap-3 mb-3">
                    <div style={{ borderRadius: 10 }} className={`w-8 h-8 flex items-center justify-center text-sm font-black shrink-0 shadow ${isSkipped ? 'bg-slate-400 text-white' : isCorrect ? 'bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white' : 'bg-gradient-to-br from-red-500 to-red-700 text-white'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{question.questionText}</p>
                      {/* ⏱ Time-per-question badge */}
                      {timeLabel && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${speedBadge?.cls || 'bg-slate-100 text-slate-500'}`}>
                            <Clock className="w-3 h-3" />
                            {translate('Time Taken: {time}', { time: timeLabel })}
                          </span>
                          {speedBadge && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${speedBadge.cls}`}>
                              {speedBadge.label === 'Fast' && <Zap className="w-3 h-3" />}
                              {speedBadge.label === 'Slow' && <AlertCircle className="w-3 h-3" />}
                              {translate(speedBadge.label)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span style={{ borderRadius: 999 }} className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${isSkipped ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' : isCorrect ? 'bg-primary-500 text-white' : 'bg-red-500 text-white'}`}>
                      {isSkipped ? translate('Skipped') : isCorrect ? translate('Correct') : translate('Wrong')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {question.options?.map((opt, optIdx) => {
                      const isSelected = ans.selectedOptionIndex === optIdx;
                      const isCorrectOpt = optIdx === correctIndex;
                      let optClass = 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600';
                      if (isCorrectOpt) optClass = 'bg-primary-100 dark:bg-primary-900/30 border-primary-400 dark:border-primary-600';
                      if (isSelected && !isCorrect) optClass = 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600';

                      return (
                        <div key={optIdx} style={{ borderRadius: 10 }} className={`flex items-center gap-2.5 px-3 py-2.5 border text-sm ${optClass}`}>
                          <span style={{ borderRadius: 8 }} className={`w-6 h-6 shrink-0 flex items-center justify-center text-[11px] font-black ${isCorrectOpt ? 'bg-primary-500 text-white' : isSelected && !isCorrect ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200'}`}>{String.fromCharCode(65 + optIdx)}</span>
                          <span className="flex-1 min-w-0 break-words font-medium text-slate-700 dark:text-slate-200">{opt.text}</span>
                          {isCorrectOpt && <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-300 shrink-0" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="mt-3 p-2.5 bg-primary-50 dark:bg-white/5 border border-dashed border-primary-300 dark:border-white/20 rounded-lg">
                      <p className="text-xs text-black dark:text-white"><span className="font-semibold">{translate('Explanation:')}</span> {question.explanation}</p>
                    </div>
                  )}

                  <div>
                    <DiscussionThread
                      questionId={question._id}
                      sourceType="quiz"
                      sourceId={quiz?._id || quiz}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="relative overflow-hidden bg-background-surface shadow-md p-4 xl:p-6 border border-slate-200 dark:border-slate-800 mb-6" style={{ borderRadius: 16 }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}><Trophy className="w-4 h-4" /></span>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white">{translate('Leaderboard')}</h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
              {leaderboard.slice(0, 10).map((entry, i) => {
                const pct = Math.round(entry.percentage || 0);
                const isMe = !!user?.id && String(entry.user?._id) === String(user.id);
                return (
                  <div key={entry._id} style={{ borderRadius: 12 }} className={`flex items-center gap-3 p-3 border transition-colors ${isMe ? 'bg-primary-50 dark:bg-primary-400/10 border-primary-300 dark:border-primary-400/40' : 'bg-background-surface border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}>
                    <div style={{ borderRadius: 999 }} className={`w-9 h-9 shrink-0 flex items-center justify-center text-sm font-black shadow ${
                      i === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950' : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' : i === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {entry.user?.name || translate('Anonymous')}
                        {isMe && <span className="ml-1.5 text-xs font-black text-primary-700 dark:text-primary-300">{translate('(You)')}</span>}
                      </p>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 via-primary-300 to-primary-400 rounded-full" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                      </div>
                    </div>
                    <span style={{ borderRadius: 999 }} className="shrink-0 px-2.5 py-1 text-sm font-black bg-primary-100 dark:bg-primary-400/20 text-primary-800 dark:text-primary-200">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col xl:flex-row xl:items-stretch gap-3">
          <button
            onClick={handleChallenge}
            disabled={isGeneratingChallenge}
            style={{ borderRadius: 16 }}
            className="relative overflow-hidden w-full xl:w-auto xl:flex-[1.5] px-5 py-4 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] font-black text-sm sm:text-base xl:text-lg uppercase tracking-wide sm:tracking-wider shadow-xl transition-all hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGeneratingChallenge ? (
              <div className="w-6 h-6 border-2 border-primary-950/30 border-t-primary-950 rounded-full animate-spin" />
            ) : (
              <>
                <span style={{ borderRadius: 10 }} className="w-9 h-9 shrink-0 flex items-center justify-center bg-primary-950/90 text-primary-200 shadow rotate-[-4deg]"><Users className="w-5 h-5" /></span>
                {translate('CHALLENGE FRIENDS TO BEAT THIS SCORE')}
              </>
            )}
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:flex-1">
            <button onClick={() => router.push('/student/quiz-history')} style={{ borderRadius: 14 }} className="group px-6 py-3.5 bg-background-surface border border-slate-300 dark:border-slate-700 hover:border-primary-500 text-slate-800 dark:text-white font-black uppercase tracking-wide text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Quiz History
            </button>
            <button onClick={() => router.push('/quizzes')} style={{ borderRadius: 14 }} className="group px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-800 hover:brightness-110 text-white font-black uppercase tracking-wide text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              <BrainCircuit className="w-4 h-4" /> More Quizzes <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultDetail;
