'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Trophy, CheckCircle, XCircle, Brain, ArrowLeft, Crown, Home, Clock, Zap, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import { QuizResultSkeleton } from '../skeletons/PrivateSkeletons';
import DiscussionThread from '../discussions/DiscussionThread';

// Format seconds → "45s" or "1m 23s"
const fmtSec = (sec) => {
  if (!sec || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const getSpeedBadge = (sec) => {
  if (!sec || sec <= 0) return null;
  if (sec <= 20) return { label: 'Fast', icon: <Zap className="w-3 h-3" />, cls: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' };
  if (sec <= 60) return { label: 'Good', icon: null, cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white' };
  return { label: 'Slow', icon: <AlertCircle className="w-3 h-3" />, cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white' };
};

const QuizResultPage = () => {
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
        else toast.error('Result not found');
      } catch (err) {
        console.error('Error loading result:', err);
        toast.error('Error loading result');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 pb-20 font-outfit">
        <div className="container mx-auto px-4 py-8"><QuizResultSkeleton /></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Result Not Found</h1>
          <button onClick={() => router.push('/')} className="text-primary-600 hover:underline text-sm">Go Home</button>
        </div>
      </div>
    );
  }

  const quiz = attempt.quiz;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-24">
      <div className="container mx-auto px-3 lg:px-10 pt-6 pb-8 max-w-4xl">

        {/* Result Card */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-primary-50 via-slate-100 dark:via-slate-800 to-primary-50 dark:from-primary-900/30 dark:via-white/30 dark:to-primary-900/30 rounded-2xl p-5 lg:p-8 border border-primary-200 dark:border-primary-700 shadow-xl">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            {quiz && <h2 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-white mb-1">{quiz.title}</h2>}
            {quiz?.subject && <p className="text-sm text-slate-500 mb-4">{quiz.applicableExams?.map(e => e.name).join(', ') || ''} · {quiz.subject?.name}{quiz.topic?.name ? ` · ${quiz.topic.name}` : ''}</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-primary-600 dark:text-primary-400">{attempt.correctCount}</div>
                <div className="text-xs text-slate-500">Correct</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-black dark:text-white">{attempt.wrongCount}</div>
                <div className="text-xs text-slate-500">Wrong</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-black dark:text-white">{Math.round(attempt.percentage || 0)}%</div>
                <div className="text-xs text-slate-500">Score</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-black dark:text-white">{Math.round(attempt.accuracy || 0)}%</div>
                <div className="text-xs text-slate-500">Accuracy</div>
              </div>
            </div>

            {attempt.rank && (
              <div className="bg-gradient-to-r from-slate-100 dark:from-slate-800 to-slate-100 dark:to-slate-800 dark:from-white/30 dark:to-white/30 text-black dark:text-white dark:text-black px-4 py-2 rounded-lg lg:rounded-xl inline-flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="font-semibold text-sm">Rank #{attempt.rank} · Top {Math.round(attempt.percentile || 0)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Review */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 lg:p-8 border border-white/20 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-black dark:from-white to-black dark:to-white rounded-lg lg:rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Question Review</h2>
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
                <div key={index} className={`rounded-lg lg:rounded-xl p-4 border ${isSkipped ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' : isCorrect ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700' : 'bg-slate-100 dark:bg-slate-800 dark:bg-white/20 border-slate-200 dark:border-slate-800 dark:border-white'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isSkipped ? 'bg-slate-400 text-white' : isCorrect ? 'bg-primary-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{question.questionText}</p>
                      {timeLabel && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${badge?.cls || 'bg-slate-100 text-slate-500'}`}>
                            <Clock className="w-3 h-3" />{timeLabel}
                          </span>
                          {badge && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.cls}`}>
                              {badge.icon}{badge.label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 ml-11">
                    {question.options?.map((opt, optIdx) => {
                      const isSelected = ans.selectedOptionIndex === optIdx;
                      const isCorrectOpt = optIdx === correctIndex;
                      let optClass = 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600';
                      if (isCorrectOpt) optClass = 'bg-primary-100 dark:bg-primary-900/30 border-primary-400 dark:border-primary-600';
                      if (isSelected && !isCorrect) optClass = 'bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-black dark:border-white dark:border-white';

                      return (
                        <div key={optIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${optClass}`}>
                          {isCorrectOpt && <CheckCircle className="w-4 h-4 text-primary-600 shrink-0" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-black dark:text-white shrink-0" />}
                          {!isCorrectOpt && !isSelected && <div className="w-4 h-4 shrink-0" />}
                          <span className="text-slate-700 dark:text-slate-300">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="ml-11 mt-2 p-2 bg-slate-100 dark:bg-slate-800 dark:bg-white/20 rounded-lg">
                      <p className="text-xs text-black dark:text-white"><span className="font-semibold">Explanation:</span> {question.explanation}</p>
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
          <button onClick={() => router.back()} className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg lg:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button onClick={() => router.push('/')} className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-black dark:to-white hover:from-primary-700 hover:to-black text-white rounded-lg lg:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
