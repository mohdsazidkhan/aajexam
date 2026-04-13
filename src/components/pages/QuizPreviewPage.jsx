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
import Loading from '../Loading';

const QuizPreviewPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!id) return;
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await API.getQuizById(id);
        if (res.success) setQuiz(res.data);
        else toast.error('Quiz not found');

        const lbRes = await API.getQuizLeaderboard(id, 10);
        if (lbRes.success) setLeaderboard(lbRes.data || []);
      } catch (err) {
        console.error('Error loading quiz:', err);
        toast.error('Error loading quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleStartQuiz = () => {
    if (requireAuthForAction(router, `/quiz/${id}/attempt`)) {
      localStorage.setItem('quizNavigationData', JSON.stringify({
        quizData: quiz,
        fromPage: document.referrer?.includes('/search') ? 'search' : 'quiz-preview'
      }));
      router.push(`/quiz/${id}/attempt`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loading size="lg" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Quiz Not Found</h1>
          <Link href="/search" className="text-primary-600 hover:text-primary-700">← Back to Search</Link>
        </div>
      </div>
    );
  }

  const difficultyColor = quiz.difficulty === 'easy' ? 'text-green-600 bg-green-50 dark:bg-green-900/30' :
    quiz.difficulty === 'hard' ? 'text-red-600 bg-red-50 dark:bg-red-900/30' :
      'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-5 lg:py-12 px-4 pb-24">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {quiz.exam && (
            <>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 dark:text-slate-400">{quiz.exam.name}</span>
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mr-4 shrink-0">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl lg:text-3xl font-bold text-slate-900 dark:text-white">{quiz.title}</h1>
          </div>
          {quiz.description && (
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-base">{quiz.description}</p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-3 text-center">
              <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">{quiz.questions?.length || 0}</div>
              <div className="text-xs text-slate-500">Questions</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 text-center">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">{quiz.duration}</div>
              <div className="text-xs text-slate-500">Minutes</div>
            </div>
            <div className={`rounded-xl p-3 text-center ${difficultyColor}`}>
              <BarChart3 className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xl font-bold text-slate-900 dark:text-white capitalize">{quiz.difficulty}</div>
              <div className="text-xs text-slate-500">Difficulty</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 text-center">
              <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">{quiz.totalMarks}</div>
              <div className="text-xs text-slate-500">Total Marks</div>
            </div>
          </div>

          {/* Marks Info */}
          {(quiz.marksPerQuestion > 0 || quiz.negativeMarking > 0) && (
            <div className="flex flex-wrap gap-3 mb-6 text-sm">
              <span className="px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium">
                +{quiz.marksPerQuestion} per correct
              </span>
              {quiz.negativeMarking > 0 && (
                <span className="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-medium">
                  -{quiz.negativeMarking} per wrong
                </span>
              )}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartQuiz}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-bold text-lg flex items-center justify-center shadow-lg"
          >
            <Play className="w-5 h-5 mr-3" /> Start Quiz Now
          </button>
        </div>

        {/* Quiz Stats */}
        {quiz.totalAttempts > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 lg:p-6 shadow-lg mb-6 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quiz Statistics</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{quiz.totalAttempts}</div>
                <div className="text-xs text-slate-500">Total Attempts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round(quiz.avgScore)}%</div>
                <div className="text-xs text-slate-500">Average Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {quiz.tags?.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 lg:p-6 shadow-lg mb-6 border border-slate-100 dark:border-slate-700">
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
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 lg:p-6 shadow-lg border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Leaderboard</h2>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div key={entry._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
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
