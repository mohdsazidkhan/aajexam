'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Trophy, CheckCircle, XCircle, Brain, ArrowLeft, Crown, Home, Clock, Zap, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../../lib/api';
import { QuizResultSkeleton } from '../../common/skeletons/PrivateSkeletons';
import DiscussionThread from '../../common/discussions/DiscussionThread';
import useTranslate from '../../../hooks/useTranslate';

// Format seconds → "45s" or "1m 23s"
const fmtSec = (sec) => {
  if (!sec || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const getSpeedBadge = (sec) => {
  if (!sec || sec <= 0) return null;
  if (sec <= 20) return { label: 'Fast', icon: <Zap className="w-3 h-3" />, cls: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' };
  if (sec <= 60) return { label: 'Good', icon: null, cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white ' };
  return { label: 'Slow', icon: <AlertCircle className="w-3 h-3" />, cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white ' };
};

const QuizResultPage = () => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await API.getQuizAttemptDetail(attemptId);
        if (res.success) setAttempt(res.data);
        else toast.error(translate('Result not found'));
      } catch (err) {
        console.error('Error loading result:', err);
        toast.error(translate('Error loading result'));
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-page pb-20 font-outfit">
        <div className="py-8"><QuizResultSkeleton /></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-page">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{translate('Result Not Found')}</h1>
          <button onClick={() => router.push('/')} className="text-primary-600 hover:underline text-sm">{translate('Go Home')}</button>
        </div>
      </div>
    );
  }

  const quiz = attempt.quiz;

  return (
    <div className="min-h-screen bg-background-page pb-24">
      <div className="container mx-auto pt-6 pb-8">

        {/* Result Card */}
        <div className="text-center mb-6">
          <div className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 ring-1 ring-slate-200 dark:ring-white/10 shadow-xl p-5 xl:p-8" style={{ borderRadius: 16 }}>
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} /><div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} /><div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-primary-300/25 blur-3xl" style={{ borderRadius: '50%' }} />
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-black shadow-lg rotate-[-4deg]" style={{ borderRadius: 18 }}>
                <Trophy className="w-8 h-8" />
              </div>
            </div>
            {quiz && <h2 className="text-lg xl:text-xl font-bold text-slate-800 dark:text-white mb-1">{translateData(quiz.title)}</h2>}
            {quiz?.subject && <p className="text-sm font-semibold text-slate-600 dark:text-white/75 mb-4">{quiz.applicableExams?.map(e => e.name).join(', ') || ''} · {quiz.subject?.name}{quiz.topic?.name ? ` · ${quiz.topic.name}` : ''}</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
            </div>

            {attempt.rank && (
              <div className="bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-black shadow px-4 py-2 inline-flex items-center gap-2" style={{ borderRadius: 999 }}>
                <Crown className="w-4 h-4" />
                <span className="font-semibold text-sm">{translate('Rank #{rank} · Top {percentile}%', { rank: attempt.rank, percentile: Math.round(attempt.percentile || 0) })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Review */}
        <div className="relative overflow-hidden bg-background-surface shadow-md p-4 xl:p-8 border border-slate-200 dark:border-slate-800 mb-6" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-black shadow rotate-[-4deg]" style={{ borderRadius: 12 }}>
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
              const timeLabel = fmtSec(ans.timeTaken);
              const badge = getSpeedBadge(ans.timeTaken);

              return (
                <div key={index} style={{ borderRadius: 14 }} className={`relative overflow-hidden p-4 xl:p-5 border border-l-4 shadow-sm ${isSkipped ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 border-l-slate-400' : isCorrect ? 'bg-primary-50/60 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 border-l-primary-500' : 'bg-red-50/70 dark:bg-red-900/20 border-red-200 dark:border-red-800 border-l-red-500'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div style={{ borderRadius: 10 }} className={`w-8 h-8 flex items-center justify-center text-sm font-black shrink-0 shadow ${isSkipped ? 'bg-slate-400 text-white' : isCorrect ? 'bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white' : 'bg-gradient-to-br from-red-500 to-red-700 text-white'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{question.questionText}</p>
                      {timeLabel && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${badge?.cls || 'bg-slate-100 text-slate-500'}`}>
                            <Clock className="w-3 h-3" />{timeLabel}
                          </span>
                          {badge && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.cls}`}>
                              {badge.icon}{translate(badge.label)}
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
                          {isCorrectOpt && <CheckCircle className="w-4 h-4 text-primary-600 shrink-0" />}
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

                  <div className="ml-11">
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.back()} style={{ borderRadius: 12 }} className="flex-1 px-6 py-3 bg-background-surface border border-slate-300 dark:border-slate-700 hover:border-primary-500 text-slate-800 dark:text-white font-black uppercase tracking-wide text-sm shadow-sm transition-all flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button onClick={() => router.push('/')} style={{ borderRadius: 12 }} className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-800 hover:brightness-110 text-white font-black uppercase tracking-wide text-sm shadow-md transition-all flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
