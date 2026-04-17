'use client';
import React, { useState, useEffect } from 'react';
import { RotateCcw, Brain, CheckCircle, XCircle, BarChart3, ArrowRight, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';

const RevisionPage = () => {
  const [dueItems, setDueItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [queueRes, statsRes] = await Promise.all([
          API.request('/api/revision?limit=50'),
          API.request('/api/revision/stats')
        ]);
        if (queueRes?.success) setDueItems(queueRes.data.dueItems || []);
        if (statsRes?.success) setStats(statsRes.data);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, []);

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
      <div className="max-w-3xl container mx-auto py-4 lg:py-8 px-4 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><RotateCcw className="w-6 h-6 text-primary-500" /> Revision Queue</h1>
          <p className="text-sm font-bold text-slate-400">Spaced repetition - review your weak questions</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-3 text-center"><p className="text-2xl font-black text-red-500">{stats.dueToday}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Due Today</p></Card>
            <Card className="p-3 text-center"><p className="text-2xl font-black text-blue-500">{stats.upcoming7Days}</p><p className="text-[9px] font-bold text-slate-400 uppercase">This Week</p></Card>
            <Card className="p-3 text-center"><p className="text-2xl font-black text-emerald-500">{stats.accuracy}%</p><p className="text-[9px] font-bold text-slate-400 uppercase">Accuracy</p></Card>
            <Card className="p-3 text-center"><p className="text-2xl font-black text-slate-600 dark:text-slate-300">{stats.totalItems}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Total Items</p></Card>
          </div>
        )}

        {/* Review Card */}
        {currentItem ? (
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400">Card {currentIdx + 1} of {dueItems.length}</span>
              <span className="text-[10px] font-bold text-slate-400">Reviews: {currentItem.totalReviews || 0}</span>
            </div>

            <h3 className="text-base font-black text-slate-900 dark:text-white">{currentItem.question?.questionText}</h3>

            {!showAnswer ? (
              <div className="space-y-2">
                {currentItem.question?.options?.map((opt, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl text-sm font-bold border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <span className="font-black mr-2">{String.fromCharCode(65 + i)}.</span> {opt.text}
                  </div>
                ))}
                <button onClick={() => setShowAnswer(true)} className="w-full py-3 bg-primary-500 text-white rounded-xl text-sm font-bold mt-4">Show Answer</button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentItem.question?.options?.map((opt, i) => (
                  <div key={i} className={`px-4 py-3 rounded-xl text-sm font-bold border-2 ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                    <span className="font-black mr-2">{String.fromCharCode(65 + i)}.</span> {opt.text} {opt.isCorrect && <CheckCircle className="w-4 h-4 inline text-emerald-500 ml-2" />}
                  </div>
                ))}
                {currentItem.question?.explanation && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">{currentItem.question.explanation}</div>
                )}
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase text-center">How well did you know this?</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => submitReview(1)} disabled={reviewing} className="py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100"><XCircle className="w-4 h-4 mx-auto mb-1" />Wrong</button>
                    <button onClick={() => submitReview(3)} disabled={reviewing} className="py-2 bg-yellow-50 text-yellow-600 rounded-xl text-xs font-bold hover:bg-yellow-100"><Brain className="w-4 h-4 mx-auto mb-1" />Hard</button>
                    <button onClick={() => submitReview(5)} disabled={reviewing} className="py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100"><CheckCircle className="w-4 h-4 mx-auto mb-1" />Easy</button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-8 text-center space-y-4">
            <Zap className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">All Caught Up!</h2>
            <p className="text-sm text-slate-400">No reviews due right now. Questions you get wrong in quizzes will appear here automatically.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RevisionPage;
