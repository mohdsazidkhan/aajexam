'use client';
import React, { useState, useEffect } from 'react';
import { Target, Clock, Trophy, CheckCircle, XCircle, SkipForward, Flame, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';
import DiscussionThread from '../components/discussions/DiscussionThread';

const DailyChallengePage = () => {
  const [challenge, setChallenge] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await API.request('/api/daily-challenge/today');
        if (res?.success && res.data?.challenge) {
          setChallenge(res.data.challenge);
          setAttempted(res.data.attempted);
          setAttemptData(res.data.attemptData);
          setTimeLeft((res.data.challenge.duration || 10) * 60);
          setAnswers(res.data.challenge.questions.map(() => ({ selectedOptionIndex: -1, timeTaken: 0 })));
        }
        const lb = await API.request('/api/daily-challenge/leaderboard');
        if (lb?.success) setLeaderboard(lb.data || []);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchToday();
  }, []);

  useEffect(() => {
    if (!started || attempted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, attempted]);

  const selectOption = (idx) => {
    if (attempted) return;
    const updated = [...answers];
    updated[currentQ] = { ...updated[currentQ], selectedOptionIndex: idx };
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await API.request('/api/daily-challenge/submit', {
        method: 'POST',
        body: JSON.stringify({ challengeId: challenge._id, answers, totalTime: (challenge.duration || 10) * 60 - timeLeft })
      });
      if (res?.success) {
        setAttempted(true);
        setAttemptData(res.data.attempt);
        toast.success(`Score: ${res.data.attempt.score}/${challenge.questions.length} | Streak: ${res.data.streak.currentStreak} days`);
      }
    } catch (e) { toast.error('Submit failed'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  if (!challenge) return (
    <div className="min-h-screen flex items-center justify-center">
      <Head><title>Daily Challenge - AajExam</title></Head>
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto"><Target className="w-10 h-10 text-slate-300" /></div>
        <h2 className="text-2xl font-black text-slate-400">No Challenge Today</h2>
        <p className="text-sm text-slate-400">Come back tomorrow for a new challenge!</p>
      </div>
    </div>
  );

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen pb-24">
      <Head><title>Daily Challenge - AajExam</title></Head>
      <div className="container mx-auto px-4 py-4 lg:px-4 lg:py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Target className="w-6 h-6 text-primary-500" />
            <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{challenge.title}</h1>
          </div>
          <p className="text-sm text-slate-400 font-bold">{challenge.questions.length} Questions | {challenge.duration} Minutes</p>
        </div>

        {/* Not started yet */}
        {!started && !attempted && (
          <Card className="p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mx-auto">
              <Zap className="w-12 h-12 text-primary-500" />
            </div>
            <h2 className="text-xl font-black">Ready for Today&apos;s Challenge?</h2>
            <p className="text-sm text-slate-500">Complete it to maintain your streak!</p>
            <button onClick={() => setStarted(true)} className="px-8 py-3 bg-primary-500 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors">
              Start Challenge <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </Card>
        )}

        {/* Quiz in progress */}
        {started && !attempted && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">Q {currentQ + 1}/{challenge.questions.length}</span>
              <span className={`text-sm font-black flex items-center gap-1 ${timeLeft < 60 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
              </span>
            </div>
            <Card className="p-5 lg:p-6 space-y-4">
              <h3 className="text-base lg:text-lg font-black text-slate-900 dark:text-white leading-relaxed">{challenge.questions[currentQ].questionText}</h3>
              <div className="space-y-3">
                {challenge.questions[currentQ].options.map((opt, i) => (
                  <button key={i} onClick={() => selectOption(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${answers[currentQ]?.selectedOptionIndex === i
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'}`}>
                    <span className="font-black mr-2">{String.fromCharCode(65 + i)}.</span> {opt.text || opt}
                  </button>
                ))}
              </div>
            </Card>
            <div className="flex justify-between">
              <button disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)} className="px-4 py-2.5 text-sm font-bold text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed">Previous</button>
              {currentQ < challenge.questions.length - 1
                ? <button onClick={() => setCurrentQ(currentQ + 1)} className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition">Next</button>
                : <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? 'Submitting...' : 'Submit'}</button>
              }
            </div>
          </div>
        )}

        {/* Results */}
        {attempted && attemptData && (
          <div className="space-y-6">
            <Card className="p-6 text-center space-y-4 bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Challenge Complete!</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-3xl font-black text-primary-500">{attemptData.score}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-emerald-500">{attemptData.accuracy}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-orange-500">{attemptData.correctCount}/{attemptData.correctCount + attemptData.wrongCount + attemptData.skippedCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Correct</p>
                </div>
              </div>
            </Card>

            {/* Per-question review + discussion */}
            {challenge?.questions?.length > 0 && (
              <Card className="p-4 lg:p-5 space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary-500" /> Question Review & Discussion
                </h3>
                <div className="space-y-4">
                  {challenge.questions.map((q, idx) => {
                    const ans = attemptData?.answers?.[idx];
                    const correctIdx = q.options?.findIndex(o => o.isCorrect);
                    const isSkipped = !ans || ans.selectedOptionIndex === -1;
                    const isCorrect = ans?.isCorrect;
                    return (
                      <div key={q._id || idx} className={`rounded-xl p-3 border ${isSkipped ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
                        <div className="flex items-start gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${isSkipped ? 'bg-slate-400' : isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>{idx + 1}</div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">{q.questionText}</p>
                        </div>
                        <div className="space-y-1 ml-8">
                          {q.options?.map((opt, oi) => {
                            const isSel = ans?.selectedOptionIndex === oi;
                            const isRight = oi === correctIdx;
                            let cls = 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600';
                            if (isRight) cls = 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400';
                            if (isSel && !isCorrect) cls = 'bg-red-100 dark:bg-red-900/30 border-red-400';
                            return (
                              <div key={oi} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${cls}`}>
                                {isRight && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                {isSel && !isCorrect && <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                                {!isRight && !isSel && <div className="w-3.5 h-3.5 shrink-0" />}
                                <span className="text-slate-700 dark:text-slate-300">{opt.text || opt}</span>
                              </div>
                            );
                          })}
                        </div>
                        {q.explanation && (
                          <div className="ml-8 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-[11px] text-blue-700 dark:text-blue-300"><span className="font-semibold">Explanation:</span> {q.explanation}</p>
                          </div>
                        )}
                        <div className="ml-8">
                          <DiscussionThread
                            questionId={q._id}
                            sourceType="daily_challenge"
                            sourceId={challenge._id}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <Card className="p-4 space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Today&apos;s Leaderboard</h3>
                <div className="space-y-2">
                  {leaderboard.slice(0, 10).map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className={`text-sm font-black w-6 ${i < 3 ? 'text-yellow-500' : 'text-slate-400'}`}>#{i + 1}</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex-1">{entry.user?.name || 'Student'}</span>
                      <span className="text-sm font-black text-primary-500">{entry.score}</span>
                      <span className="text-[10px] font-bold text-slate-400">{entry.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallengePage;
