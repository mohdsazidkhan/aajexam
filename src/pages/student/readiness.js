'use client';
import Select from '../../components/common/ui/Select';
import PageHero from '@/components/common/ui/PageHero';
import { ListPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, BarChart3, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import API from '../../lib/api';
import useTargetExamsVersion from '../../hooks/useTargetExamsVersion';
import Card from '../../components/common/ui/Card';
import Loading from '../../components/common/Loading';
import SubscriptionGuard from '../../components/student/SubscriptionGuard';
import Seo from '../../components/common/Seo';
import useTranslate from '../../hooks/useTranslate';

// --- Readiness Skeleton (matches the loaded result view) ---
const Sh = ({ className = '' }) => (
  <div className={`container mx-auto animate-pulse bg-primary-500/15 dark:bg-primary-500/20 rounded-lg xl:rounded-xl ${className}`} />
);

const ReadinessSkeleton = () => (
  <div className="space-y-5">
    <Card className="p-8 text-center space-y-3">
      <Sh className="h-14 w-32 mx-auto" />
      <Sh className="h-3 w-40 mx-auto" />
      <Sh className="h-3 w-28 mx-auto" />
      <Sh className="h-3 w-full max-w-sm mx-auto" />
    </Card>

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="text-center space-y-2">
          <Sh className="h-6 w-12 mx-auto" />
          <Sh className="h-2.5 w-20 mx-auto" />
        </Card>
      ))}
    </div>

    {[1, 2].map(i => (
      <Card key={i} className="space-y-3">
        <Sh className="h-4 w-40" />
        {[1, 2, 3].map(j => (
          <div key={j} className="flex items-center justify-between px-3 py-3 bg-background-surface-secondary rounded-lg">
            <Sh className="h-3 w-28 dark:bg-slate-700 bg-background-surface-secondary" />
            <Sh className="h-3 w-8 dark:bg-slate-700 bg-background-surface-secondary" />
          </div>
        ))}
      </Card>
    ))}
  </div>
);

const ReadinessPage = () => {
  const { translate } = useTranslate();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const targetVersion = useTargetExamsVersion();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.getAllExams({ forUser: true });
        if (res?.success) setExams(res.data || []);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchExams();
  }, [targetVersion]);

  const analyzeReadiness = async () => {
    if (!selectedExam) return;
    setAnalyzing(true);
    setReadiness(null);
    try {
      const res = await API.request(`/api/readiness/${selectedExam}`);
      if (res?.success) setReadiness(res.data);
    } catch (e) { } finally { setAnalyzing(false); }
  };

  if (loading) return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <div className="py-2 xl:py-4"><ListPageSkeleton chips={4} rows={4} /></div>
    </div>
  );

  const readinessColor = (r) => r >= 70 ? 'emerald' : r >= 40 ? 'yellow' : 'red';

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <Seo title="Exam Readiness – AajExam" description="Track how exam-ready you are with AajExam." noIndex={true} />
      <div className="py-4 xl:py-6 space-y-6">
        <SubscriptionGuard message="Readiness Score is a PRO feature. Upgrade to unlock deep insights into your exam preparation!">
          <PageHero
            icon={Target}
            eyebrow={translate('Exam Readiness')}
            title={translate('Exam Readiness')}
            actions={
          <div className="flex flex-col xl:flex-row gap-3 xl:gap-5 w-full xl:w-auto">
            <Select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
              className="w-full xl:flex-1 px-3 py-2.5 border border-border-primary rounded-lg xl:rounded-xl text-sm outline-none">
              <option value="">{translate('Select Exam')}</option>
              {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </Select>
            <button onClick={analyzeReadiness} disabled={!selectedExam || analyzing}
              className="w-full xl:w-auto px-6 py-2.5 bg-primary-600 text-on-primary rounded-lg xl:rounded-xl text-sm font-bold hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {analyzing ? translate('Analyzing...') : translate('Analyze')}
            </button>
          </div>
            }
          />

          {readiness && (
            <div className="space-y-5">
              {/* Main Score */}
              <Card className={`p-8 text-center bg-${readinessColor(readiness.readiness)}-50 dark:bg-${readinessColor(readiness.readiness)}-900/20`}>
                <p className={`text-6xl font-bold text-${readinessColor(readiness.readiness)}-500`}>{readiness.readiness}%</p>
                <p className="text-sm font-bold text-content-muted">{translate('Exam Readiness Score')}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {readiness.trend > 0 ? <TrendingUp className="w-4 h-4 text-primary-600" /> : <TrendingDown className="w-4 h-4 text-content-primary" />}
                  <span className={`text-xs font-bold ${readiness.trend > 0 ? 'text-primary-600' : 'text-content-primary'}`}>{translate('{value}% trend', { value: `${readiness.trend > 0 ? '+' : ''}${readiness.trend}` })}</span>
                </div>
                <p className="text-xs text-content-muted mt-3">{readiness.recommendation}</p>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <Card className="text-center space-y-1"><p className="text-xl font-bold text-content-secondary">{readiness.totalAttempts}</p><p className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em]">{translate('Total Attempts')}</p></Card>
                <Card className="text-center space-y-1"><p className="text-xl font-bold text-content-primary">{readiness.avgQuizScore}%</p><p className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em]">{translate('Avg Quiz')}</p></Card>
                <Card className="text-center space-y-1"><p className="text-xl font-bold text-content-primary">{readiness.avgTestScore}%</p><p className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em]">{translate('Avg Test')}</p></Card>
                <Card className="text-center space-y-1"><p className="text-xl font-bold text-content-secondary">{readiness.totalQuizAttempts + readiness.totalTestAttempts}</p><p className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em]">{translate('Tests Done')}</p></Card>
              </div>

              {/* Weak Subjects */}
              {readiness.weakSubjects?.length > 0 && (
                <Card as="section" className="space-y-3">
                  <h3 className="text-sm font-bold text-content-primary flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {translate('Weak Subjects (Below 50%)')}</h3>
                  {readiness.weakSubjects.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-3 bg-background-surface-secondary rounded-lg">
                      <span className="text-xs font-bold text-content-secondary">{s.subject}</span>
                      <span className="text-xs font-bold text-content-primary">{s.accuracy}%</span>
                    </div>
                  ))}
                </Card>
              )}

              {/* Strong Subjects */}
              {readiness.strongSubjects?.length > 0 && (
                <Card as="section" className="space-y-3">
                  <h3 className="text-sm font-bold text-primary-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {translate('Strong Subjects (Above 70%)')}</h3>
                  {readiness.strongSubjects.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-3 rounded-lg">
                      <span className="text-xs font-bold text-content-secondary">{s.subject}</span>
                      <span className="text-xs font-bold text-primary-600">{s.accuracy}%</span>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}

          {analyzing && !readiness && <ReadinessSkeleton />}

          {!readiness && !analyzing && (
            <Card as="section" className="text-center space-y-2 xl:space-y-4">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto" />
              <h2 className="text-xl font-bold text-content-muted">{translate('Select an Exam')}</h2>
              <p className="text-sm text-content-muted">{translate('Choose your target exam to see your readiness score based on your quiz and test history.')}</p>
            </Card>
          )}
        </SubscriptionGuard>
      </div>
    </div>
  );
};

export default ReadinessPage;
