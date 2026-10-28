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
  if (sec <= 20) return { label: 'Fast', icon: <Zap className="w-3 h-3" />, cls: 'text-primary-600' };
  if (sec <= 60) return { label: 'Good', icon: null, cls: 'bg-background-surface-secondary text-content-primary' };
  return { label: 'Slow', icon: <AlertCircle className="w-3 h-3" />, cls: 'bg-background-surface-secondary text-content-primary' };
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
          <h1 className="text-xl font-bold text-content-primary mb-3">{translate('Result Not Found')}</h1>
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
          <section className="relative isolate overflow-hidden border border-border-primary p-5 xl:p-8 bg-background-surface" style={{ borderRadius: 16 }}>
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 18 }}>
                <Trophy className="w-8 h-8" />
              </div>
            </div>
            {quiz && <h2 className="text-lg xl:text-xl font-bold text-content-primary mb-1">{translateData(quiz.title)}</h2>}
            {quiz?.subject && <p className="text-sm font-semibold text-content-secondary dark:text-white/75 mb-4">{quiz.applicableExams?.map(e => e.name).join(', ') || ''} · {quiz.subject?.name}{quiz.topic?.name ? ` · ${quiz.topic.name}` : ''}</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="relative overflow-hidden hover:bg-background-surface border border-border-primary p-3 transition-colors" style={{ borderRadius: 10 }}>
                <div className="text-2xl font-bold font-outfit text-primary-600">{attempt.correctCount}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75">{translate('Correct')}</div>
              </div>
              <div className="relative overflow-hidden hover:bg-background-surface border border-border-primary p-3 transition-colors" style={{ borderRadius: 10 }}>
                <div className="text-2xl font-bold font-outfit text-primary-600">{attempt.wrongCount}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75">{translate('Wrong')}</div>
              </div>
              <div className="relative overflow-hidden hover:bg-background-surface border border-border-primary p-3 transition-colors" style={{ borderRadius: 10 }}>
                <div className="text-2xl font-bold font-outfit text-primary-600">{Math.round(attempt.percentage || 0)}%</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75">{translate('Score')}</div>
              </div>
              <div className="relative overflow-hidden hover:bg-background-surface border border-border-primary p-3 transition-colors" style={{ borderRadius: 10 }}>
                <div className="text-2xl font-bold font-outfit text-primary-600">{Math.round(attempt.accuracy || 0)}%</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75">{translate('Accuracy')}</div>
              </div>
            </div>

            {attempt.rank && (
              <div className="text-on-primary px-4 py-2 inline-flex items-center gap-2 bg-primary-600" style={{ borderRadius: 999 }}>
                <Crown className="w-4 h-4" />
                <span className="font-semibold text-sm">{translate('Rank #{rank} · Top {percentile}%', { rank: attempt.rank, percentile: Math.round(attempt.percentile || 0) })}</span>
              </div>
            )}
          </section>
        </div>

        {/* Review */}
        <section className="relative overflow-hidden bg-background-surface p-4 xl:p-8 border border-border-primary mb-6" style={{ borderRadius: 16 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 12 }}>
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-content-primary">{translate('Question Review')}</h2>
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
                <div key={index} style={{ borderRadius: 14 }} className={`relative overflow-hidden p-4 xl:p-5 border border-l-4 ${isSkipped ? 'bg-background-surface-secondary border-border-primary border-l-slate-400' : isCorrect ? 'border-primary-200 dark:border-primary-700 border-l-primary-500' : 'bg-red-50/70 dark:bg-red-900/20 border-red-200 dark:border-red-800 border-l-red-500'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div style={{ borderRadius: 10 }} className={`w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 ${isSkipped ? 'bg-border-secondary text-white' : isCorrect ? 'text-on-primary bg-primary-600' : 'text-white bg-red-600'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-content-primary">{question.questionText}</p>
                      {timeLabel && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${badge?.cls || 'bg-background-surface-secondary text-content-muted'}`}>
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
                    <span style={{ borderRadius: 999 }} className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${isSkipped ? 'bg-background-surface-secondary text-content-secondary dark:bg-slate-700' : isCorrect ? 'bg-primary-500 text-on-primary' : 'bg-red-500 text-white'}`}>
                      {isSkipped ? translate('Skipped') : isCorrect ? translate('Correct') : translate('Wrong')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {question.options?.map((opt, optIdx) => {
                      const isSelected = ans.selectedOptionIndex === optIdx;
                      const isCorrectOpt = optIdx === correctIndex;
                      let optClass = 'bg-background-surface border-border-primary dark:border-slate-600';
                      if (isCorrectOpt) optClass = 'border-primary-400 dark:border-primary-600';
                      if (isSelected && !isCorrect) optClass = 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600';

                      return (
                        <div key={optIdx} style={{ borderRadius: 10 }} className={`flex items-center gap-2.5 px-3 py-2.5 border text-sm ${optClass}`}>
                          <span style={{ borderRadius: 8 }} className={`w-6 h-6 shrink-0 flex items-center justify-center text-[11px] font-bold ${isCorrectOpt ? 'bg-primary-500 text-on-primary' : isSelected && !isCorrect ? 'bg-red-500 text-white' : 'bg-background-surface-secondary dark:bg-slate-600 text-content-secondary'}`}>{String.fromCharCode(65 + optIdx)}</span>
                          <span className="flex-1 min-w-0 break-words font-medium text-content-secondary">{opt.text}</span>
                          {isCorrectOpt && <CheckCircle className="w-4 h-4 text-primary-600 shrink-0" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="mt-3 p-2.5 border border-dashed border-primary-300 dark:border-white/20 rounded-lg">
                      <p className="text-xs text-content-primary"><span className="font-semibold">{translate('Explanation:')}</span> {question.explanation}</p>
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
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.back()} style={{ borderRadius: 12 }} className="flex-1 px-6 py-3 bg-background-surface border border-border-primary hover:border-primary-500 text-content-primary font-bold uppercase tracking-wide text-sm transition-all flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button onClick={() => router.push('/')} style={{ borderRadius: 12 }} className="flex-1 px-6 py-3 hover:brightness-110 text-on-primary font-bold uppercase tracking-wide text-sm transition-all flex items-center justify-center gap-2 bg-primary-600">
            <Home className="w-4 h-4" /> Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
