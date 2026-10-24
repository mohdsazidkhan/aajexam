'use client';
import React, { useState, useEffect } from 'react';
import { Target, Clock, Trophy, CheckCircle, XCircle, SkipForward, Flame, ArrowRight, Zap } from 'lucide-react';
import { m as motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../lib/api';
import Card from '../components/common/ui/Card';
import Loading from '../components/common/Loading';
import DiscussionThread from '../components/common/discussions/DiscussionThread';
import Seo from '../components/common/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';
import { ChallengeSkeleton } from '../components/common/skeletons/PrivateSkeletons';
import LanguageToggle from '../components/common/LanguageToggle';
import useStoredTranslations from '../hooks/useStoredTranslations';
import useTranslate from '../hooks/useTranslate';

const DailyChallengePage = () => {
  const { translate } = useTranslate();
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
  // EN <-> HI: stored Hindi from the DB first, the model only for questions that have none
  const { language, toggleLanguage, translating, get: getHindi } = useStoredTranslations({
    ids: (challenge?.questions || []).map((q) => q.question),
    source: 'daily_challenge'
  });

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Refetch the challenge so option.isCorrect is now populated for the
        // review section. The /today endpoint strips isCorrect when attempted
        // is false, so the initial challenge state has options without it.
        try {
          const todayRes = await API.request('/api/daily-challenge/today');
          if (todayRes?.success && todayRes.data?.challenge) {
            setChallenge(todayRes.data.challenge);
          }
        } catch (_) { /* keep existing challenge state if refetch fails */ }
      }
    } catch (e) { toast.error(translate('Submit failed')); } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <div className="py-4 xl:py-6"><ChallengeSkeleton /></div>
    </div>
  );

  if (!challenge) return (
    <div className="min-h-screen flex items-center justify-center">
      <Seo
        title="Daily Challenge – Free Daily Quiz for Government Exams | AajExam"
        description="Attempt a fresh daily challenge quiz on AajExam every day. Climb the leaderboard, build your streak and revise high-yield MCQs for SSC, UPSC, Banking and Railway exam preparation."
        canonical="/daily-challenge"
        noIndex
        keywords={[
          'daily quiz',
          'daily challenge',
          'government exam daily quiz',
          'SSC daily quiz',
          'banking daily quiz',
          'aajexam daily challenge'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Daily Challenge', url: '/daily-challenge' }
        ])}
      />
      <div className="text-center space-y-2 xl:space-y-4">
        <div className="w-20 h-20 flex items-center justify-center mx-auto bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 20 }}><Target className="w-10 h-10" /></div>
        <h2 className="text-2xl font-black text-slate-400">{translate('No Challenge Today')}</h2>
        <p className="text-sm text-slate-400">{translate('Come back tomorrow for a new challenge!')}</p>
      </div>
    </div>
  );

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <Seo
        title="Daily Challenge – Free Daily Quiz for Government Exams | AajExam"
        description="Attempt a fresh daily challenge quiz on AajExam every day. Climb the leaderboard, build your streak and revise high-yield MCQs for SSC, UPSC, Banking and Railway exam preparation."
        canonical="/daily-challenge"
        noIndex
        keywords={[
          'daily quiz',
          'daily challenge',
          'government exam daily quiz',
          'SSC daily quiz',
          'banking daily quiz',
          'aajexam daily challenge'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Daily Challenge', url: '/daily-challenge' }
        ])}
      />
      <div className="py-4 xl:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 shadow-xl ring-1 ring-slate-200 dark:ring-white/10 text-center space-y-2 p-4 xl:p-6" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
          <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
          <div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-primary-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
          {attempted && (
            <LanguageToggle
              language={language}
              onToggle={toggleLanguage}
              translating={translating}
              className="absolute top-0 right-0 flex shrink-0 items-center justify-center gap-1.5 min-w-[44px] sm:min-w-[52px] px-2 sm:px-3 py-1.5 rounded-lg xl:rounded-xl font-bold text-xs sm:text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            />
          )}
          <div className="flex items-center justify-center gap-2 px-14">
            <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 12 }}><Target className="w-5 h-5" /></span>
            <h1 className="text-xl sm:text-2xl xl:text-4xl font-black tracking-tight text-slate-900 dark:text-white break-words min-w-0">{challenge.title}</h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-white/75 font-bold">{translate('{questions} Questions | {minutes} Minutes', { questions: challenge.questions.length, minutes: challenge.duration })}</p>
        </div>

        {/* Not started yet */}
        {!started && !attempted && (
          <Card className="text-center space-y-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 24 }}>
              <Zap className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl font-black">{translate('Ready for Today\'s Challenge?')}</h2>
            <p className="text-sm text-slate-500">{translate('Complete it to maintain your streak!')}</p>
            <button onClick={() => setStarted(true)} style={{ borderRadius: 12 }} className="w-full sm:w-auto px-8 py-3.5 sm:py-3 font-black uppercase tracking-wide text-sm bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow-lg hover:brightness-105 hover:-translate-y-0.5 transition-all">
              {translate('Start Challenge')} <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </Card>
        )}

        {/* Quiz in progress */}
        {started && !attempted && (
          <div className="space-y-2 xl:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black px-3 py-1 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow-lg" style={{ borderRadius: 999 }}>Q {currentQ + 1}/{challenge.questions.length}</span>
              <div className="flex items-center gap-2">
                <LanguageToggle
                  language={language}
                  onToggle={toggleLanguage}
                  translating={translating}
                  className="flex shrink-0 items-center justify-center gap-1.5 min-w-[44px] px-3 py-1 rounded-lg font-black text-xs sm:text-sm bg-background-surface border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary-500 transition-colors"
                />
                <span style={{ borderRadius: 999 }} className={`text-sm font-black flex items-center gap-1 px-3 py-1 bg-background-surface border ${timeLeft < 60 ? 'border-red-400 text-red-600 dark:text-red-400 animate-pulse' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>
                <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
              </span>
              </div>
            </div>
            <Card className="space-y-2 xl:space-y-4">
              <h3 className="text-[15px] sm:text-base xl:text-lg font-black text-slate-900 dark:text-white leading-relaxed break-words">{getHindi(challenge.questions[currentQ].question)?.questionText || challenge.questions[currentQ].questionText}</h3>
              <div className="space-y-3">
                {challenge.questions[currentQ].options.map((opt, i) => (
                  <button key={i} onClick={() => selectOption(i)}
                    style={{ borderRadius: 12 }} className={`w-full text-left px-3 sm:px-4 py-3 text-sm font-bold break-words transition-all border-2 ${answers[currentQ]?.selectedOptionIndex === i
                      ? 'border-primary-400 bg-primary-50 dark:bg-primary-400/10 text-primary-800 dark:text-primary-200 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-primary-400 hover:-translate-y-0.5 text-slate-700 dark:text-slate-300'}`}>
                    <span className="font-black mr-2">{String.fromCharCode(65 + i)}.</span> {getHindi(challenge.questions[currentQ].question)?.optionTexts?.[i] || opt.text || opt}
                  </button>
                ))}
              </div>
            </Card>
            <div className="flex justify-between items-center gap-3 sticky bottom-0 -mx-1 px-1 py-2 bg-background-page/95 backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
              <button disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)} className="px-4 py-3 sm:py-2.5 text-sm font-bold text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed">{translate('Previous')}</button>
              {currentQ < challenge.questions.length - 1
                ? <button onClick={() => setCurrentQ(currentQ + 1)} style={{ borderRadius: 12 }} className="px-8 sm:px-6 py-3 sm:py-2.5 text-sm font-black uppercase bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow-lg hover:brightness-105 hover:-translate-y-0.5 transition-all">{translate('Next')}</button>
                : <button onClick={handleSubmit} disabled={submitting} style={{ borderRadius: 12 }} className="px-8 sm:px-6 py-3 sm:py-2.5 text-sm font-black uppercase bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow-lg hover:brightness-105 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? translate('Submitting...') : translate('Submit')}</button>
              }
            </div>
          </div>
        )}

        {/* Results */}
        {attempted && attemptData && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="text-center space-y-2 xl:space-y-4 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 ring-1 ring-slate-200 dark:ring-white/10 shadow-xl">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{translate('Challenge Complete!')}</h2>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-black font-outfit text-primary-700 dark:text-primary-200">{attemptData.score}</p>
                    <p className="text-[10px] font-black text-slate-600 dark:text-white/75 uppercase tracking-widest">{translate('Score')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-black font-outfit text-primary-700 dark:text-primary-200">{attemptData.accuracy}%</p>
                    <p className="text-[10px] font-black text-slate-600 dark:text-white/75 uppercase tracking-widest">{translate('Accuracy')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-black font-outfit text-primary-700 dark:text-primary-200">{attemptData.correctCount}/{attemptData.correctCount + attemptData.wrongCount + attemptData.skippedCount}</p>
                    <p className="text-[10px] font-black text-slate-600 dark:text-white/75 uppercase tracking-widest">{translate('Correct')}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Per-question review + discussion */}
            {challenge?.questions?.length > 0 && (
              <Card className="space-y-2 xl:space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}><Target className="w-4 h-4" /></span> Question Review & Discussion
                </h3>
                <div className="space-y-2 xl:space-y-4">
                  {challenge.questions.map((q, idx) => {
                    const ans = attemptData?.answers?.[idx];
                    const correctIdx = q.options?.findIndex(o => o.isCorrect);
                    const isSkipped = !ans || ans.selectedOptionIndex === -1;
                    const isCorrect = ans?.isCorrect;
                    return (
                      <div key={q._id || idx} className={`rounded-lg xl:rounded-xl p-3 border ${isSkipped ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : isCorrect ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-600' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
                        <div className="flex items-start gap-2 mb-2">
                          <div style={{ borderRadius: 8 }} className={`w-6 h-6 flex items-center justify-center text-xs font-black shrink-0 shadow ${isSkipped ? 'bg-slate-400 text-white' : isCorrect ? 'bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white' : 'bg-gradient-to-br from-red-500 to-red-700 text-white'}`}>{idx + 1}</div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white break-words min-w-0">{getHindi(q.question)?.questionText || q.questionText}</p>
                        </div>
                        <div className="space-y-1 ml-0 sm:ml-8">
                          {q.options?.map((opt, oi) => {
                            const isSel = ans?.selectedOptionIndex === oi;
                            const isRight = oi === correctIdx;
                            let cls = 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600';
                            if (isRight) cls = 'bg-primary-100 dark:bg-primary-900/30 border-primary-400';
                            if (isSel && !isCorrect) cls = 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600';
                            return (
                              <div key={oi} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${cls}`}>
                                {isRight && <CheckCircle className="w-3.5 h-3.5 text-primary-600 dark:text-primary-300 shrink-0" />}
                                {isSel && !isCorrect && <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />}
                                {!isRight && !isSel && <div className="w-3.5 h-3.5 shrink-0" />}
                                <span className="text-slate-700 dark:text-slate-300 break-words min-w-0">{getHindi(q.question)?.optionTexts?.[oi] || opt.text || opt}</span>
                              </div>
                            );
                          })}
                        </div>
                        {q.explanation && (
                          <div className="ml-0 sm:ml-8 mt-2 p-2.5 bg-primary-50 dark:bg-white/5 border border-dashed border-primary-300 dark:border-white/20 rounded-lg">
                            <p className="text-[11px] text-black dark:text-white"><span className="font-semibold">{translate('Explanation:')}</span> {q.explanation}</p>
                          </div>
                        )}
                        <div className="ml-0 sm:ml-8">
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Card className="space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 relative z-10"><span className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}><Trophy className="w-4 h-4" /></span> {translate('Today\'s Leaderboard')}</h3>
                  <motion.div className="space-y-2 relative z-10" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
                    {leaderboard.slice(0, 10).map((entry, i) => (
                      <motion.div key={i} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} style={{ borderRadius: 10 }} className="flex items-center gap-3 px-3 py-2 bg-primary-50/60 dark:bg-white/5 border border-transparent hover:border-primary-200 dark:hover:border-white/15 transition-colors">
                        <span className={`text-sm font-black w-6 ${i < 3 ? 'text-primary-600 dark:text-primary-300' : 'text-slate-400'}`}>#{i + 1}</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex-1 min-w-0 truncate">{entry.user?.name || translate('Student')}</span>
                        <span className="text-sm font-black text-primary-700 dark:text-primary-200">{entry.score}</span>
                        <span className="text-[10px] font-bold text-slate-400">{entry.accuracy}%</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallengePage;
