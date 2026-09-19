'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Trophy, CheckCircle, XCircle, Brain, ArrowLeft, Crown, Home, BrainCircuit, Share2, Users, Clock, Zap, AlertCircle
} from 'lucide-react';
import { QuizResultSkeleton } from '../skeletons/PrivateSkeletons';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import Loading from '../Loading';
import DiscussionThread from '../discussions/DiscussionThread';
import { useAuthStatus } from '../../hooks/useClientSide';

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
  if (pct >= 90) return { text: 'Outstanding! 🏆', cls: 'text-primary-700' };
  if (pct >= 75) return { text: 'Great Job! 🎉', cls: 'text-primary-700' };
  if (pct >= 50) return { text: 'Good Effort! 👍', cls: 'text-blue-600 dark:text-blue-400' };
  if (pct >= 35) return { text: 'Keep Practicing! 💪', cls: 'text-amber-600 dark:text-amber-400' };
  return { text: 'Needs Improvement 📚', cls: 'text-red-600 dark:text-red-400' };
};

// Speed badge config
const getSpeedBadge = (sec, totalQ) => {
  if (!sec || !totalQ) return null;
  const avg = sec; // per-question seconds
  if (avg <= 20) return { label: 'Fast', cls: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' };
  if (avg <= 60) return { label: 'Good', cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white' };
  return { label: 'Slow', cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white' };
};

const QuizResultDetail = () => {
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
        } else toast.error('Result not found');
      } catch (err) {
        console.error(err);
        toast.error('Error loading result');
      } finally { setLoading(false); }
    };
    fetch();
  }, [attemptId]);

  if (loading) return (
    <div className="min-h-screen pb-24 font-outfit">
      <div className="container mx-auto py-6"><QuizResultSkeleton /></div>
    </div>
  );
  if (!attempt) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Result not found</p></div>;

  const quiz = attempt.quiz;
  const totalTimeTakenSec = attempt.answers?.reduce((sum, a) => sum + (a.timeTaken || 0), 0) || 0;

  const handleChallenge = async () => {
    const isPro = user?.subscriptionStatus?.toUpperCase() === 'PRO' || user?.role === 'admin';
    if (!isPro) {
      toast.error('Only PRO users can challenge friends!');
      router.push('/subscription');
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
          title: 'Can you beat my score?',
          text: `I scored ${Math.round(attempt.percentage)}% on this quiz. I challenge you to beat me!`,
          url: link
        };
        
        if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(link);
          toast.success('Challenge link copied to clipboard!');
        }
      } else {
        toast.error(res.message || 'Failed to create challenge');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto py-6">

        {/* Score Card */}
        <div className="text-center mb-6">
          <div className="bg-primary-50 dark:bg-primary-900/30 rounded-2xl p-5 lg:p-8 border border-primary-200 dark:border-primary-700 shadow-sm">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-primary-400 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            {/* Score-based feedback */}
            <p className={`text-xl lg:text-2xl font-black mb-1 ${getScoreMessage(attempt.percentage || 0).cls}`}>
              {getScoreMessage(attempt.percentage || 0).text}
            </p>
            {quiz && <h2 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-white mb-1">{quiz.title || 'Quiz'}</h2>}
            {quiz?.subject && <p className="text-sm text-slate-500 mb-4">{quiz.applicableExams?.map(e => e.name).join(', ') || ''}{quiz.subject?.name ? ` · ${quiz.subject.name}` : ''}{quiz.topic?.name ? ` · ${quiz.topic.name}` : ''}</p>}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-primary-700">{attempt.correctCount}</div>
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
              <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-black dark:text-white">{quiz?.duration ? `${quiz.duration}m` : '—'}</div>
                <div className="text-xs text-slate-500">Quiz Total Time</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-black dark:text-white">{formatTime(totalTimeTakenSec) || '0s'}</div>
                <div className="text-xs text-slate-500">Total Time Taken</div>
              </div>
            </div>

            {attempt.rank && (
              <div className="bg-slate-100 dark:bg-slate-800 dark:bg-white/30 text-black dark:text-white dark:text-black px-4 py-2 rounded-lg lg:rounded-xl inline-flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="font-semibold text-sm">Rank #{attempt.rank} · Top {Math.round(attempt.percentile || 0)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 lg:p-8 border border-white/20 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-700 rounded-lg lg:rounded-xl flex items-center justify-center">
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
              const timeSec = ans.timeTaken || 0;
              const timeLabel = formatTime(timeSec);
              const speedBadge = getSpeedBadge(timeSec);

              return (
                <div key={index} className={`rounded-lg lg:rounded-xl p-4 border ${isSkipped ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' : isCorrect ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700' : 'bg-slate-100 dark:bg-slate-800 dark:bg-white/20 border-slate-200 dark:border-slate-800 dark:border-white'}`}>
                  {/* Question header: number + time badge + text */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isSkipped ?'bg-slate-400 text-white': isCorrect ?'bg-primary-700 text-white':'bg-primary-700 text-white'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{question.questionText}</p>
                      {/* ⏱ Time-per-question badge */}
                      {timeLabel && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${speedBadge?.cls || 'bg-slate-100 text-slate-500'}`}>
                            <Clock className="w-3 h-3" />
                            Time Taken: {timeLabel}
                          </span>
                          {speedBadge && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${speedBadge.cls}`}>
                              {speedBadge.label === 'Fast' && <Zap className="w-3 h-3" />}
                              {speedBadge.label === 'Slow' && <AlertCircle className="w-3 h-3" />}
                              {speedBadge.label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 ml-0 lg:ml-11">
                    {question.options?.map((opt, optIdx) => {
                      const isSelected = ans.selectedOptionIndex === optIdx;
                      const isCorrectOpt = optIdx === correctIndex;
                      let optClass = 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600';
                      if (isCorrectOpt) optClass = 'bg-primary-100 dark:bg-primary-900/30 border-primary-400 dark:border-primary-600';
                      if (isSelected && !isCorrect) optClass = 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600';

                      return (
                        <div key={optIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${optClass}`}>
                          {isCorrectOpt && <CheckCircle className="w-4 h-4 text-primary-700 shrink-0" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
                          {!isCorrectOpt && !isSelected && <div className="w-4 h-4 shrink-0" />}
                          <span className="text-slate-700 dark:text-slate-300">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="ml-0 lg:ml-11 mt-2 p-2 bg-slate-100 dark:bg-slate-800 dark:bg-white/20 rounded-lg">
                      <p className="text-xs text-black dark:text-white"><span className="font-semibold">Explanation:</span> {question.explanation}</p>
                    </div>
                  )}

                  <div className="ml-0 lg:ml-11">
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
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-sm p-4 lg:p-6 border border-white/20 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-black dark:text-white" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Leaderboard</h2>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div key={entry._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    i === 0 ?'bg-primary-700': i === 1 ?'bg-slate-400': i === 2 ?'bg-primary-700':'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{entry.user?.name || 'Anonymous'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(entry.percentage || 0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleChallenge} 
            disabled={isGeneratingChallenge}
            className="w-full px-6 py-4 bg-primary-700 hover:bg-black text-white rounded-2xl font-black text-lg uppercase tracking-wider shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGeneratingChallenge ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Users className="w-6 h-6" /> CHALLENGE FRIENDS TO BEAT THIS SCORE</>
            )}
          </button>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button onClick={() => router.push('/quiz-history')} className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg lg:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Quiz History
            </button>
            <button onClick={() => router.push('/quizzes')} className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg lg:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              <BrainCircuit className="w-4 h-4" /> More Quizzes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultDetail;
