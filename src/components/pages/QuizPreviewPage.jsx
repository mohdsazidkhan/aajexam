'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  HelpCircle, Play, Clock, BarChart3, Trophy, Users, CheckCircle, Tag, ArrowLeft, BrainCircuit
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import { requireAuthForAction } from '../../lib/auth';
import { getCurrentUser } from '../../lib/utils/authUtils';
import { QuizPreviewPageSkeleton } from '../skeletons/PublicSkeletons';
import { ProBadge } from '../ui';
import { Lock } from 'lucide-react';

const QuizPreviewPage = ({ resolvedId, initialQuiz } = {}) => {
  const router = useRouter();
  const lookupId = resolvedId || router.query.id;

  const [quiz, setQuiz] = useState(initialQuiz || null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!lookupId) return;
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await API.getQuizById(lookupId);
        if (res.success) setQuiz(res.data);
        else toast.error('Quiz not found');

        const lbRes = await API.getQuizLeaderboard(lookupId, 10);
        if (lbRes.success) setLeaderboard(lbRes.data || []);
      } catch (err) {
        console.error('Error loading quiz:', err);
        toast.error('Error loading quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lookupId]);

  const currentUser = getCurrentUser();
  const isPro = (currentUser?.subscriptionStatus || '').toUpperCase() === 'PRO' || currentUser?.role === 'admin';

  // Determine if this quiz is locked for the user
  const isLocked = !isPro && (
    ((quiz?.accessLevel || '').toUpperCase() === 'PRO' && !(quiz.type === 'full_mock' && (currentUser?.fullMockAttemptCount || 0) === 0)) ||
    (quiz?.type === 'full_mock' && (currentUser?.fullMockAttemptCount || 0) >= 1) ||
    (quiz?.type === 'subject_test' && (currentUser?.dailySubjectTestCount || 0) >= 2 && new Date(currentUser?.lastTestResetDate || 0).toDateString() === new Date().toDateString())
  );

  const handleStartQuiz = () => {
    if (isLocked) {
      toast.error('This is a PRO feature. Upgrade to unlock!');
      router.push('/subscription');
      return;
    }

    if (requireAuthForAction(router, `/quiz/${quiz?.slug || lookupId}/attempt`)) {
      localStorage.setItem('quizNavigationData', JSON.stringify({
        quizData: quiz,
        fromPage: document.referrer?.includes('/search') ? 'search' : 'quiz-preview'
      }));
      router.push(`/quiz/${quiz?.slug || lookupId}/attempt`);
    }
  };

  if (loading) {
    return <QuizPreviewPageSkeleton />;
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-page">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Quiz Not Found</h1>
          <Link href="/search" className="text-primary-700 hover:text-primary-700">← Back to Search</Link>
        </div>
      </div>
    );
  }

  const difficultyColor = quiz.difficulty === 'easy' ? 'text-primary-700 bg-primary-50 dark:bg-primary-900/30' :
    quiz.difficulty === 'hard' ? 'text-black dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30' :
      'text-black dark:text-white bg-slate-100 dark:bg-slate-800 dark:bg-white/30';

  return (
    <div className="min-h-screen bg-background-page py-5 lg:py-12 pb-24">
      <div className="container mx-auto">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-primary-700 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {quiz.applicableExams?.length > 0 && (
            <>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 dark:text-slate-400">{quiz.applicableExams.map(e => e.name).join(', ')}</span>
            </>
          )}
          {quiz.subject && (
            <>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 dark:text-slate-400">{quiz.subject.name}</span>
            </>
          )}
          {quiz.topic && (
            <>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 dark:text-slate-400">{quiz.topic.name}</span>
            </>
          )}
        </div>

        {/* Quiz Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 lg:p-8 shadow-xl mb-6 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center mb-4">
            <div className="w-6 lg:w-12 h-6 lg:h-12 rounded-lg lg:rounded-xl text-white bg-primary-700 flex items-center justify-center mr-4 shrink-0">
              <BrainCircuit className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
            </div>
            <h1 className="text-xl lg:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              {quiz.title}
              {(quiz.accessLevel || '').toUpperCase() === 'PRO' && <ProBadge />}
            </h1>
          </div>
          {quiz.description && (
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-base">{quiz.description}</p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-100 dark:bg-slate-800 dark:bg-white/30 rounded-lg lg:rounded-xl p-3 text-center">
              <HelpCircle className="w-6 h-6 text-black dark:text-white mx-auto mb-1" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">{quiz.questions?.length || 0}</div>
              <div className="text-xs text-slate-500">Questions</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 dark:bg-white/30 rounded-lg lg:rounded-xl p-3 text-center">
              <Clock className="w-6 h-6 text-black dark:text-white mx-auto mb-1" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">{quiz.duration}</div>
              <div className="text-xs text-slate-500">Minutes</div>
            </div>
            <div className={`rounded-lg lg:rounded-xl p-3 text-center ${difficultyColor}`}>
              <BarChart3 className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xl font-bold text-slate-900 dark:text-white capitalize">{quiz.difficulty}</div>
              <div className="text-xs text-slate-500">Difficulty</div>
            </div>
            <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg lg:rounded-xl p-3 text-center">
              <Trophy className="w-6 h-6 text-primary-700 mx-auto mb-1" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">{quiz.totalMarks}</div>
              <div className="text-xs text-slate-500">Total Marks</div>
            </div>
          </div>

          {/* Marks Info */}
          {(quiz.marksPerQuestion > 0 || quiz.negativeMarking > 0) && (
            <div className="flex flex-wrap gap-3 mb-6 text-sm">
              <span className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg font-medium">
                +{quiz.marksPerQuestion} per correct
              </span>
              {quiz.negativeMarking > 0 && (
                <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 dark:bg-white/30 text-black dark:text-white rounded-lg font-medium">
                  -{quiz.negativeMarking} per wrong
                </span>
              )}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartQuiz}
            className={`w-full px-8 py-4 rounded-lg lg:rounded-xl transition-all font-bold text-lg flex items-center justify-center shadow-lg ${
              isLocked
                ?'bg-primary-700 text-white hover:bg-primary-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-5 h-5 mr-3" /> UNLOCK WITH PRO
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-3" /> Start Quiz Now
              </>
            )}
          </button>
        </div>

        {/* Quiz Stats */}
        {quiz.totalAttempts > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-lg mb-6 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-700" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quiz Statistics</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-700">{quiz.totalAttempts}</div>
                <div className="text-xs text-slate-500">Total Attempts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-700">{Math.round(quiz.avgScore)}%</div>
                <div className="text-xs text-slate-500">Average Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {quiz.tags?.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-lg mb-6 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tags</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {quiz.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl p-4 lg:p-6 shadow-lg border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-black dark:text-white" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Leaderboard</h2>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div key={entry._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    i === 0 ?'bg-primary-700': i === 1 ?'bg-slate-400': i === 2 ?'bg-primary-700':'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{entry.user?.name || 'Anonymous'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(entry.percentage || 0)}%</p>
                    <p className="text-[10px] text-slate-400">{entry.accuracy?.toFixed(0)}% accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPreviewPage;
