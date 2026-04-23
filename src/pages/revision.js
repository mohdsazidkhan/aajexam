'use client';
import React, { useState, useEffect } from 'react';
import { RotateCcw, Brain, CheckCircle, XCircle, BarChart3, ArrowRight, Zap, BookOpen, FileText, Target, Film, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';
import SubscriptionGuard from '../components/SubscriptionGuard';

const SOURCE_TABS = [
  { key: 'all', label: 'All', icon: Layers },
  { key: 'quiz', label: 'Quizzes', icon: BookOpen },
  { key: 'practice_test', label: 'Tests', icon: FileText },
  { key: 'daily_challenge', label: 'Daily Challenges', icon: Target },
  { key: 'reel', label: 'Reels', icon: Film }
];

const RevisionPage = () => {
  const [dueItems, setDueItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const url = activeTab === 'all' ? '/api/revision?limit=50' : `/api/revision?limit=50&source=${activeTab}`;
        const [queueRes, statsRes] = await Promise.all([
          API.request(url),
          API.request('/api/revision/stats')
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
        toast.success(quality >= 3 ? 'Correct! Next review: ' + new Date(res.data.nextReviewDate).toLocaleDateString() : 'Will review again tomorrow');
        setShowAnswer(false);
        if (currentIdx < dueItems.length - 1) setCurrentIdx(currentIdx + 1);
        else { setDueItems([]); toast.success('All reviews done for today!'); }
      }
    } catch (e) { toast.error('Failed'); } finally { setReviewing(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  const currentItem = dueItems[currentIdx];

  return (
    <div className="min-h-screen pb-24">
      <Head><title>Revision Queue - AajExam</title></Head>
      <div className="container mx-auto px-4 py-4 lg:px-4 lg:py-6 space-y-6">
        <SubscriptionGuard message="Revision Queue is a PRO feature. Upgrade to enable smart spaced-repetition and master your weak topics!">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><RotateCcw className="w-6 h-6 text-primary-500" /> Revision Queue</h1>
            <p className="text-sm font-bold text-slate-400">Spaced repetition - review your weak questions</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="p-4 text-center space-y-1"><p className="text-2xl font-black text-red-500">{stats.dueToday}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Due Today</p></Card>
              <Card className="p-4 text-center space-y-1"><p className="text-2xl font-black text-blue-500">{stats.upcoming7Days}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">This Week</p></Card>
              <Card className="p-4 text-center space-y-1"><p className="text-2xl font-black text-emerald-500">{stats.accuracy}%</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</p></Card>
              <Card className="p-4 text-center space-y-1"><p className="text-2xl font-black text-slate-600 dark:text-slate-300">{stats.totalItems}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Items</p></Card>
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
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black transition ${isActive ? 'bg-primary-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Review Card */}
          {currentItem ? (
            <Card className="p-5 lg:p-6 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400">Card {currentIdx + 1} of {dueItems.length}</span>
                <span className="text-[10px] font-bold text-slate-400">Reviews: {currentItem.totalReviews || 0}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{(currentItem.source || '').replace('_', ' ')}</span>
                {currentItem.sourceTitle && <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[70%]">{currentItem.sourceTitle}</span>}
              </div>
              <h3 className="text-base lg:text-lg font-black text-slate-900 dark:text-white leading-relaxed">{currentItem.questionSnapshot?.questionText}</h3>

              {!showAnswer ? (
                <div className="space-y-3">
                  {currentItem.questionSnapshot?.options?.map((opt, i) => (
                    <div key={i} className="px-4 py-3 rounded-xl text-sm font-bold border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      <span className="font-black mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                    </div>
                  ))}
                  <button onClick={() => setShowAnswer(true)} className="w-full py-3 bg-primary-500 hover:bg-primary-600 transition text-white rounded-xl text-sm font-bold mt-2">Show Answer</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {currentItem.questionSnapshot?.options?.map((opt, i) => {
                      const isCorrect = i === currentItem.questionSnapshot?.correctAnswerIndex;
                      return (
                        <div key={i} className={`px-4 py-3 rounded-xl text-sm font-bold border-2 ${isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                          <span className="font-black mr-2">{String.fromCharCode(65 + i)}.</span> {opt} {isCorrect && <CheckCircle className="w-4 h-4 inline text-emerald-500 ml-2" />}
                        </div>
                      );
                    })}
                  </div>
                  {currentItem.questionSnapshot?.explanation && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs leading-relaxed text-blue-700 dark:text-blue-300">{currentItem.questionSnapshot.explanation}</div>
                  )}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">How well did you know this?</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => submitReview(1)} disabled={reviewing} className="py-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"><XCircle className="w-4 h-4 mx-auto mb-1" />Wrong</button>
                      <button onClick={() => submitReview(3)} disabled={reviewing} className="py-3 bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-xl text-xs font-bold hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"><Brain className="w-4 h-4 mx-auto mb-1" />Hard</button>
                      <button onClick={() => submitReview(5)} disabled={reviewing} className="py-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"><CheckCircle className="w-4 h-4 mx-auto mb-1" />Easy</button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center space-y-4">
              <Zap className="w-12 h-12 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{activeTab === 'all' ? 'All Caught Up!' : 'Koi item nahi'}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {activeTab === 'all'
                  ? 'No reviews pending. Questions you get wrong in quizzes, tests, daily challenges, or reels will appear here automatically.'
                  : `Is category (${SOURCE_TABS.find(t => t.key === activeTab)?.label}) me abhi koi wrong answer nahi hai.`}
              </p>
            </Card>
          )}
        </SubscriptionGuard>
      </div>
    </div>
  );
};

export default RevisionPage;
