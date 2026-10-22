'use client';
import { RevisionPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import React, { useState, useEffect } from 'react';
import { RotateCcw, Brain, CheckCircle, XCircle, BarChart3, ArrowRight, Zap, BookOpen, FileText, Target, Film, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import Card from '../../components/common/ui/Card';
import Loading from '../../components/common/Loading';
import SubscriptionGuard from '../../components/student/SubscriptionGuard';
import Seo from '../../components/common/Seo';
import LanguageToggle from '../../components/common/LanguageToggle';
import useStoredTranslations from '../../hooks/useStoredTranslations';
import useTranslate from '../../hooks/useTranslate';

const SOURCE_TABS = [
  { key: 'all', label: 'All', icon: Layers },
  { key: 'quiz', label: 'Quizzes', icon: BookOpen },
  { key: 'practice_test', label: 'Tests', icon: FileText },
  { key: 'daily_challenge', label: 'Daily Challenges', icon: Target },
  { key: 'reel', label: 'Reels', icon: Film }
];

const RevisionPage = () => {
  const { translate } = useTranslate();
  const [dueItems, setDueItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  // EN <-> HI: stored Hindi from the DB first, the model only for questions that have none
  const { language, toggleLanguage, translating, get: getHindi } = useStoredTranslations({
    ids: dueItems.map((it) => it.questionRef),
    source: 'revision'
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const url = activeTab === 'all' ? '/api/revision?limit=20' : `/api/revision?limit=20&source=${activeTab}`;
        const [queueRes, statsRes] = await Promise.all([
          API.request(url).catch(() => null),
          API.request('/api/revision/stats').catch(() => null)
        ]);
        if (queueRes?.success) {
          setDueItems(queueRes.data.dueItems || []);
          setCurrentIdx(0);
          setShowAnswer(false);
        }
        if (statsRes?.success) setStats(statsRes.data);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchItems();
  }, [activeTab]);

  const submitReview = async (quality) => {
    if (reviewing || !dueItems[currentIdx]) return;
    setReviewing(true);
    try {
      const res = await API.request('/api/revision/review', {
        method: 'POST',
        body: JSON.stringify({ itemId: dueItems[currentIdx]._id, quality })
      });
      if (res?.success) {
        toast.success(quality >= 3 ? translate('Correct! Next review: {date}', { date: new Date(res.data.nextReviewDate).toLocaleDateString() }) : translate('Will review again tomorrow'));
        setShowAnswer(false);
        if (currentIdx < dueItems.length - 1) setCurrentIdx(currentIdx + 1);
        else { setDueItems([]); toast.success(translate('All reviews done for today!')); }
      }
    } catch (e) { toast.error(translate('Failed')); } finally { setReviewing(false); }
  };

  if (loading) return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <div className="py-2 xl:py-4"><RevisionPageSkeleton /></div>
    </div>
  );

  const currentItem = dueItems[currentIdx];

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <Seo title="Revision Queue – AajExam" description="Spaced-repetition revision queue for your AajExam practice." noIndex={true} />
      <div className="py-2 xl:py-4 space-y-3 xl:space-y-4">
        <SubscriptionGuard message="Revision Queue is a PRO feature. Upgrade to enable smart spaced-repetition and master your weak topics!">
          <div>
            <h1 className="text-xl xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><RotateCcw className="w-5 h-5 xl:w-6 xl:h-6 text-primary-600" /> {translate('Revision Queue')}</h1>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: stats.dueToday, label: 'Due Today', tone: 'text-black dark:text-white' },
                { value: stats.upcoming7Days, label: 'This Week', tone: 'text-black dark:text-white' },
                { value: `${stats.accuracy}%`, label: 'Accuracy', tone: 'text-primary-600' },
                { value: stats.totalItems, label: 'Total Items', tone: 'text-slate-600 dark:text-slate-300' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-background-surface border-2 border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className={`text-base xl:text-lg font-black leading-none ${stat.tone}`}>{stat.value}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{translate(stat.label)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Source tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {SOURCE_TABS.map(tab => {
              const Icon = tab.icon;
              const count = tab.key === 'all' ? (stats?.dueToday || 0) : (stats?.bySource?.[tab.key] ?? 0);
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg xl:rounded-xl text-[11px] font-black transition ${isActive ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{translate(tab.label)}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Review Card */}
          {currentItem ? (
            <Card radius="2xl" className="space-y-3 xl:space-y-4 xl:p-5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400">{translate('Card {current} of {total}', { current: currentIdx + 1, total: dueItems.length })}</span>
                <span className="text-[10px] font-bold text-slate-400">{translate('Reviews: {count}', { count: currentItem.totalReviews || 0 })}</span>
              </div>
              <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${Math.round(((currentIdx + 1) / Math.max(1, dueItems.length)) * 100)}%` }} />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">{(currentItem.source || '').replace('_', ' ')}</span>
                {currentItem.sourceTitle && <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[70%]">{currentItem.sourceTitle}</span>}
              <LanguageToggle
                language={language}
                onToggle={toggleLanguage}
                translating={translating}
                className="ml-auto flex shrink-0 items-center justify-center gap-1.5 min-w-[40px] px-2.5 py-1 rounded-lg font-bold text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              />
              </div>
              <h3 className="text-base xl:text-lg font-black text-slate-900 dark:text-white leading-relaxed">{getHindi(currentItem.questionRef)?.questionText || currentItem.questionSnapshot?.questionText}</h3>

              {!showAnswer ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 xl:gap-3">
                  {currentItem.questionSnapshot?.options?.map((opt, i) => (
                    <div key={i} className="px-4 py-3 rounded-lg xl:rounded-xl text-sm font-bold border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      <span className="font-black mr-2">{String.fromCharCode(65 + i)}.</span> {getHindi(currentItem.questionRef)?.optionTexts?.[i] || opt}
                    </div>
                  ))}
                  </div>
                  <button onClick={() => setShowAnswer(true)} className="w-full py-3 bg-primary-600 hover:bg-primary-600 transition text-white rounded-lg xl:rounded-xl text-sm font-bold mt-2">{translate('Show Answer')}</button>
                </div>
              ) : (
                <div className="space-y-2 xl:space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 xl:gap-3">
                    {currentItem.questionSnapshot?.options?.map((opt, i) => {
                      const isCorrect = i === currentItem.questionSnapshot?.correctAnswerIndex;
                      return (
                        <div key={i} className={`px-4 py-3 rounded-lg xl:rounded-xl text-sm font-bold border-2 ${isCorrect ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                          <span className="font-black mr-2">{String.fromCharCode(65 + i)}.</span> {getHindi(currentItem.questionRef)?.optionTexts?.[i] || opt} {isCorrect && <CheckCircle className="w-4 h-4 inline text-primary-600 ml-2" />}
                        </div>
                      );
                    })}
                  </div>
                  {currentItem.questionSnapshot?.explanation && (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg xl:rounded-xl text-xs leading-relaxed text-black dark:text-white">{currentItem.questionSnapshot.explanation}</div>
                  )}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">{translate('How well did you know this?')}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => submitReview(1)} disabled={reviewing} className="py-3 bg-slate-100 dark:bg-slate-800 text-black dark:text-white rounded-lg xl:rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed"><XCircle className="w-4 h-4 mx-auto mb-1" />{translate('Wrong')}</button>
                      <button onClick={() => submitReview(3)} disabled={reviewing} className="py-3 bg-slate-100 dark:bg-slate-800 text-black dark:text-white rounded-lg xl:rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed"><Brain className="w-4 h-4 mx-auto mb-1" />{translate('Hard')}</button>
                      <button onClick={() => submitReview(5)} disabled={reviewing} className="py-3 bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg xl:rounded-xl text-xs font-bold hover:bg-primary-100 dark:hover:bg-primary-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"><CheckCircle className="w-4 h-4 mx-auto mb-1" />{translate('Easy')}</button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card radius="2xl" className="text-center space-y-2 xl:space-y-3">
              <Zap className="w-12 h-12 text-primary-600 mx-auto" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{activeTab === 'all' ? translate('All Caught Up!') : translate('No items here')}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {activeTab === 'all'
                  ? translate('No reviews pending. Questions you get wrong in quizzes, tests, daily challenges, or reels will appear here automatically.')
                  : translate('No wrong answers in this category ({name}) yet.', { name: translate(SOURCE_TABS.find(s => s.key === activeTab)?.label || '') })}
              </p>
            </Card>
          )}
        </SubscriptionGuard>
      </div>
    </div>
  );
};

export default RevisionPage;
