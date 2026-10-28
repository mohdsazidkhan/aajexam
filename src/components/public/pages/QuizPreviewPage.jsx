'use client';

import { useEffect, useState } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Link from '@/components/common/AppLink';
import {
  HelpCircle, Play, Clock, BarChart3, Trophy, Users, CheckCircle, Tag, ArrowLeft, BrainCircuit
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../../lib/api';
import { requireAuthForAction } from '../../../lib/auth';
import { getCurrentUser } from '../../../lib/utils/authUtils';
import { QuizPreviewPageSkeleton } from '../../common/skeletons/PublicSkeletons';
import { ProBadge } from '../../common/ui';
import { Lock } from 'lucide-react';
import useTranslate from '../../../hooks/useTranslate';

const QuizPreviewPage = ({ resolvedId, initialQuiz } = {}) => {
  const { translate, translateData } = useTranslate();
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
        else toast.error(translate('Quiz not found'));

        const lbRes = await API.getQuizLeaderboard(lookupId, 10);
        if (lbRes.success) setLeaderboard(lbRes.data || []);
      } catch (err) {
        console.error('Error loading quiz:', err);
        toast.error(translate('Error loading quiz'));
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
      toast.error(translate('This is a PRO feature. Upgrade to unlock!'));
      router.push('/student/subscription');
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
          <h1 className="text-2xl font-bold text-content-primary mb-4">{translate('Quiz Not Found')}</h1>
          <Link href="/search" className="text-primary-600 hover:text-primary-600">{translate('← Back to Search')}</Link>
        </div>
      </div>
    );
  }

  const difficultyColor = quiz.difficulty === 'easy' ? 'text-primary-600' :
    'text-content-primary';

  return (
    <div className="bg-background-page">
      <div className="container mx-auto">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-primary-600 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {quiz.applicableExams?.length > 0 && (
            <>
              <span className="text-content-muted">·</span>
              <span className="text-content-muted">{quiz.applicableExams.map(e => e.name).join(', ')}</span>
            </>
          )}
          {quiz.subject && (
            <>
              <span className="text-content-muted">·</span>
              <span className="text-content-muted">{translateData(quiz.subject.name)}</span>
            </>
          )}
          {quiz.topic && (
            <>
              <span className="text-content-muted">·</span>
              <span className="text-content-muted">{translateData(quiz.topic.name)}</span>
            </>
          )}
        </div>

        {/* Quiz Header Card */}
        <header className="z-auto relative isolate overflow-hidden border border-border-primary p-5 xl:p-8 mb-6 bg-background-surface" style={{ borderRadius: 'var(--radius)' }}>
          <div className="flex items-center mb-4">
            <div className="w-8 xl:w-12 h-8 xl:h-12 text-primary-600 flex items-center justify-center mr-4 shrink-0 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
              <BrainCircuit className="w-5 xl:w-6 h-5 xl:h-6" />
            </div>
            <h1 className="text-xl xl:text-3xl font-bold text-content-primary flex items-center gap-3">
              {translateData(quiz.title)}
              {(quiz.accessLevel || '').toUpperCase() === 'PRO' && <ProBadge />}
            </h1>
          </div>
          {quiz.description && (
            <p className="text-content-secondary mb-6 text-base">{quiz.description}</p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="border border-border-primary rounded-xl p-3 text-center">
              <HelpCircle className="w-6 h-6 text-content-primary mx-auto mb-1" />
              <div className="text-xl font-bold text-content-primary">{quiz.questions?.length || 0}</div>
              <div className="text-xs text-content-muted">{translate('Questions')}</div>
            </div>
            <div className="border border-border-primary rounded-xl p-3 text-center">
              <Clock className="w-6 h-6 text-content-primary mx-auto mb-1" />
              <div className="text-xl font-bold text-content-primary">{quiz.duration}</div>
              <div className="text-xs text-content-muted">{translate('Minutes')}</div>
            </div>
            <div className={`border border-border-primary rounded-xl p-3 text-center ${difficultyColor}`}>
              <BarChart3 className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xl font-bold text-content-primary capitalize">{quiz.difficulty}</div>
              <div className="text-xs text-content-muted">{translate('Difficulty')}</div>
            </div>
            <div className="border border-border-primary rounded-xl p-3 text-center">
              <Trophy className="w-6 h-6 text-primary-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-content-primary">{quiz.totalMarks}</div>
              <div className="text-xs text-content-muted">{translate('Total Marks')}</div>
            </div>
          </div>

          {/* Marks Info */}
          {(quiz.marksPerQuestion > 0 || quiz.negativeMarking > 0) && (
            <div className="flex flex-wrap gap-3 mb-6 text-sm">
              <span className="px-3 py-1.5 text-primary-600 rounded-lg font-medium">
                {translate('+{marks} per correct', { marks: quiz.marksPerQuestion })}
              </span>
              {quiz.negativeMarking > 0 && (
                <span className="px-3 py-1.5 border border-border-primary text-content-primary rounded-lg font-medium">
                  {translate('-{marks} per wrong', { marks: quiz.negativeMarking })}
                </span>
              )}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartQuiz}
            className={`w-full px-8 py-4 rounded-lg xl:rounded-xl transition-all font-bold text-lg flex items-center justify-center ${
              isLocked
                ?'bg-primary-600 text-on-primary hover:bg-primary-700'
                : 'bg-primary-600 text-on-primary hover:bg-primary-700'
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
        </header>

        {/* Quiz Stats */}
        {quiz.totalAttempts > 0 && (
          <section className="bg-background-surface rounded-lg xl:rounded-xl p-4 xl:p-6 mb-6 border border-border-primary">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-content-primary">{translate('Quiz Statistics')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{quiz.totalAttempts}</div>
                <div className="text-xs text-content-muted">{translate('Total Attempts')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{Math.round(quiz.avgScore)}%</div>
                <div className="text-xs text-content-muted">{translate('Average Score')}</div>
              </div>
            </div>
          </section>
        )}

        {/* Tags */}
        {quiz.tags?.length > 0 && (
          <section className="bg-background-surface rounded-lg xl:rounded-xl p-4 xl:p-6 mb-6 border border-border-primary">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-content-muted" />
              <h2 className="text-lg font-bold text-content-primary">{translate('Tags')}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {quiz.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-background-surface-secondary text-content-secondary rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <section className="bg-background-surface rounded-lg xl:rounded-xl p-4 xl:p-6 border border-border-primary">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-content-primary" />
              <h2 className="text-lg font-bold text-content-primary">{translate('Leaderboard')}</h2>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div key={entry._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-surface-secondary">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ?'bg-primary-600 text-on-primary': i === 1 ?'bg-border-secondary text-content-primary': i === 2 ?'bg-primary-600 text-on-primary':'bg-border-primary text-content-secondary'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-content-primary truncate">{entry.user?.name || translate('Anonymous')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-content-primary">{Math.round(entry.percentage || 0)}%</p>
                    <p className="text-[10px] text-content-muted">{translate('{value}% accuracy', { value: entry.accuracy?.toFixed(0) })}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default QuizPreviewPage;
