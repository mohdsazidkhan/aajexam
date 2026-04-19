"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Trash2,
  Send,
  Settings,
  Maximize,
  Minimize,
  Target,
  CircleCheck,
  CircleAlert,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import API from "../../../../lib/api";
import { getCurrentUser } from "../../../../lib/utils/authUtils";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Skeleton from "../../../../components/Skeleton";
import TestStartModal from "../../../../components/TestStartModal";

const TestStart = () => {
  const router = useRouter();
  const { testId } = router.query;
  const user = getCurrentUser();
  // Language selection hidden as per request

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [translationMap, setTranslationMap] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [started, setStarted] = useState(false);

  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  // --- Core Data Loading ---
  const loadTest = useCallback(async () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem(`test_${testId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setAnswers(data.answers || {});
        setCurrentQIndex(data.currentQIndex || 0);
        setMarked(new Set(data.marked || []));
        setTimeLeft(data.timeLeft || 0);
        setStartedAt(data.startedAt ? new Date(data.startedAt) : null);
      }

      const res = await API.startPracticeTest(testId);
      if (res?.success) {
        setTest(res.data);
        setQuestions(res.data.questions || []);
        setAttemptId(res.data.attemptId);

        // If we have saved progress, we can auto-start
        if (saved) {
          setStarted(true);
        }
      }
    } catch (err) {
      toast.error("Failed to load test.");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [testId, router]);

  useEffect(() => { if (testId) loadTest(); }, [testId, loadTest]);

  // --- Logic Helpers ---
  const saveToLocal = useCallback(() => {
    if (!testId || !questions.length) return;
    const saveData = { testId, answers, currentQIndex, marked: Array.from(marked), timeLeft, startedAt };
    localStorage.setItem(`test_${testId}`, JSON.stringify(saveData));
  }, [testId, answers, currentQIndex, marked, timeLeft, startedAt, questions]);

  const saveToServer = useCallback(async () => {
    if (!attemptId || !user) return;
    try {
      const answersArray = questions.map(q => ({ questionId: q._id, selectedIndex: answers[q._id] })).filter(a => a.selectedIndex !== undefined);
      await API.saveTestAnswers(testId, attemptId, answersArray);
    } catch (err) { console.error("Auto-save failed", err); }
  }, [testId, attemptId, user, questions, answers]);

  // Timer & Auto-save
  useEffect(() => {
    if (timeLeft <= 0 || !startedAt || !started) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleAutoSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, startedAt]);

  useEffect(() => {
    if (!started) return;
    autoSaveRef.current = setInterval(() => { saveToLocal(); saveToServer(); }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [saveToLocal, saveToServer, started]);

  const handleAutoSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answersIndices = questions.map(q => answers[q._id] !== undefined ? answers[q._id] : null);
      const res = await API.submitTest(testId, answersIndices);
      if (res?.success) {
        localStorage.removeItem(`test_${testId}`);
        router.push(`/govt-exams/test/${testId}/result?attempt=${res.data.attemptId}`);
      }
    } catch (err) { toast.error("Submission failed."); setSubmitting(false); }
  };

  const handleAnswer = (idx) => {
    const qId = questions[currentQIndex]._id;
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const onStartQuest = () => {
    if (!startedAt) {
      const duration = test?.examPattern?.duration || test?.duration || 60;
      setTimeLeft(duration * 60);
      setStartedAt(new Date());
    }
    enterFullscreen();
    setStarted(true);
  };

  // --- Fullscreen Experience ---
  const enterFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) await element.requestFullscreen();
      else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
      setIsFullscreen(true);
    } catch (err) { console.log("Focus mode deferred"); }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      setIsFullscreen(false);
    } catch (err) { console.error("Exit failed"); }
  }, []);

  const toggleFullscreen = () => {
    if (!!(document.fullscreenElement || document.webkitFullscreenElement)) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  useEffect(() => {
    // No longer auto-trigger directly on mount, but wait for user engagement via modal
  }, [enterFullscreen, isFullscreen]);

  useEffect(() => {
    const handleSync = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleSync);
    document.addEventListener("webkitfullscreenchange", handleSync);
    return () => {
      document.removeEventListener("fullscreenchange", handleSync);
      document.removeEventListener("webkitfullscreenchange", handleSync);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
      <Skeleton width="100px" height="100px" borderRadius="100%" />
      <p className="text-primary-400 font-black animate-pulse uppercase tracking-widest">Prepping Mission Briefing...</p>
    </div>
  );

  if (!started) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-6">
        <TestStartModal
          isOpen={true}
          test={test}
          pattern={test?.examPattern}
          exam={test?.examPattern?.exam}
          category={test?.examPattern?.exam?.category}
          onClose={() => router.back()}
          onConfirm={onStartQuest}
        />
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  const progressPercent = ((currentQIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-primary-500/30 overflow-hidden flex flex-col">
      <Head>
        <title>{test?.title || "Quiz"} - In Progress</title>
      </Head>

      {/* --- Immersive Floating Mission Controller --- */}
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-6 left-6 right-6 z-[60] flex items-center justify-between gap-6 pointer-events-none"
        >
          {/* Left: Spacer or Placeholder */}
          <div className="flex-1 lg:flex-none" />

          {/* Center: Mission Progress (Minimalist) */}
          <div className="flex-1 max-w-xl bg-white/90 dark:bg-slate-900/90 rounded-[2rem] px-8 py-4 shadow-2xl border-2 border-slate-200 dark:border-slate-800 backdrop-blur-md pointer-events-auto hidden md:block">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                <span className="pr-4">{test?.title}</span>
                <span className="shrink-0">{currentQIndex + 1} / {questions.length}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className="h-full bg-primary-500 shadow-glow-primary" />
              </div>
            </div>
          </div>

          {/* Right: Timer & Tools */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-[1.5rem] shadow-2xl border-2 ${timeLeft < 300 ? 'bg-accent-red text-white border-white/20 animate-pulse' : 'bg-slate-900/90 dark:bg-slate-800/90 text-white border-slate-700/50'} backdrop-blur-md transition-all`}>
              <Clock className="w-5 h-5 text-current opacity-80" />
              <span className="font-mono text-xl lg:text-2xl font-black">{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-4 bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-primary-500 rounded-[1.5rem] shadow-2xl border-2 border-slate-200 dark:border-slate-800 backdrop-blur-md transition-all active:scale-95 group hidden lg:block"
              title="Toggle Focus Mode"
            >
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="p-4 bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-accent-red rounded-[1.5rem] shadow-2xl border-2 border-slate-200 dark:border-slate-800 backdrop-blur-md transition-all active:scale-95 group"
              title="Abort Quest"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* --- Main Quiz Body --- */}
      <main className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">

        {/* Sidebar Palette (Desktop) */}
        <aside className="hidden lg:flex w-80 border-r border-slate-200 dark:border-slate-800 flex-col p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Stats Overview</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-primary-500/10 p-3 rounded-2xl border border-primary-500/20">
                  <p className="text-[10px] font-black text-primary-500 uppercase">Answered</p>
                  <p className="text-2xl font-black">{answeredCount}</p>
                </div>
                <div className="bg-accent-orange/10 p-3 rounded-2xl border border-accent-orange/20">
                  <p className="text-[10px] font-black text-accent-orange uppercase">Marked</p>
                  <p className="text-2xl font-black">{marked.size}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Question Map</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q._id] !== undefined;
                  const isMarked = marked.has(q._id);
                  const isCurrent = currentQIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`
                            h-10 rounded-xl font-black text-xs transition-all border-b-4
                            ${isCurrent ? 'bg-primary-500 text-white border-primary-700 -translate-y-1' :
                          isMarked ? 'bg-accent-orange text-white border-[#d97706]' :
                            isAnswered ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 border-primary-200 dark:border-primary-800' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}
                          `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-4 lg:px-10 lg:py-28 lg:pb-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQIndex}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-xs font-black text-primary-600 dark:text-primary-400 uppercase shrink-0">
                  <Target className="w-3 h-3" />
                  Q {currentQIndex + 1}
                </div>
                <h2 className="text-lg lg:text-xl font-black font-outfit leading-tight text-slate-800 dark:text-white whitespace-pre-wrap">
                  {currentQ.questionText}
                </h2>
              </div>

              {currentQ.questionImage && (
                <img src={currentQ.questionImage} alt="" className="max-h-72 rounded-xl border border-slate-200 dark:border-slate-700 object-contain bg-white" />
              )}

              <div className="grid grid-cols-1 gap-4">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ._id] === idx;
                  const optImg = currentQ.optionImages?.[idx] || '';
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`
                          group relative py-2 px-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 border-b-4 active:border-b-0 active:translate-y-1
                          ${isSelected
                          ? 'bg-primary-500 text-white border-primary-600 shadow-duo-primary'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'}
                        `}
                    >
                      <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 transition-colors
                            ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}
                         `}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1 flex flex-col gap-2 items-start">
                        {opt && <span className="text-base font-bold leading-tight">{opt}</span>}
                        {optImg && <img src={optImg} alt="" className="max-h-32 rounded-lg object-contain bg-white" />}
                      </div>
                      {isSelected && <CircleCheck className="w-8 h-8 text-white animate-pop-in" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  variant="ghost"
                  className="flex-1 border-2 border-slate-200 dark:border-slate-700"
                  onClick={() => {
                    const nextMarked = new Set(marked);
                    if (nextMarked.has(currentQ._id)) nextMarked.delete(currentQ._id);
                    else nextMarked.add(currentQ._id);
                    setMarked(nextMarked);
                  }}
                >
                  <Flag className={`w-5 h-5 mr-2 ${marked.has(currentQ._id) ? 'fill-accent-orange text-accent-orange' : 'text-slate-400'}`} />
                  {marked.has(currentQ._id) ? 'MARKED' : 'MARK FOR REVIEW'}
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 border-2 border-slate-200 dark:border-slate-700"
                  disabled={answers[currentQ._id] === undefined}
                  onClick={() => setAnswers(prev => {
                    const next = { ...prev };
                    delete next[currentQ._id];
                    return next;
                  })}
                >
                  <Trash2 className="w-5 h-5 mr-2 text-slate-400" />
                  CLEAR ANSWER
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* --- Bottom Action Bar (Fixed) --- */}
      <footer className="h-24 shrink-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <Button
          variant="ghost"
          size="lg"
          disabled={currentQIndex === 0}
          onClick={() => setCurrentQIndex(prev => prev - 1)}
          className="font-black border-2 border-slate-200 dark:border-slate-800"
        >
          <ChevronLeft className="w-6 h-6 mr-2" /> PREVIOUS
        </Button>

        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl"
            onClick={() => setShowPalette(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {currentQIndex === questions.length - 1 ? (
            <Button
              variant="primary"
              size="lg"
              className="bg-primary-500 hover:bg-primary-600 px-12"
              onClick={() => setShowSubmitModal(true)}
            >
              FINISH TEST <Send className="w-6 h-6 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="px-12"
              onClick={() => setCurrentQIndex(prev => prev + 1)}
            >
              NEXT <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          )}
        </div>
      </footer>

      {/* --- Mobile Palette Drawer --- */}
      <AnimatePresence>
        {showPalette && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPalette(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-x-0 bottom-0 bg-white dark:bg-slate-900 rounded-t-[3rem] p-8 z-50 max-h-[75vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
              <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase mb-6">Question Map</h3>
              <div className="grid grid-cols-5 gap-3">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentQIndex(idx); setShowPalette(false); }}
                    className={`h-14 rounded-2xl font-black border-b-4 ${currentQIndex === idx ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Submit Confirmation Modal --- */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowSubmitModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 max-w-md w-full max-h-[75vh] overflow-y-auto shadow-2xl border-2 border-primary-500/20">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CircleAlert className="w-10 h-10" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black font-outfit text-center uppercase mb-2">Ready to finish?</h2>
              <p className="text-center text-slate-500 mb-8 font-bold leading-relaxed px-4">
                You&apos;ve answered <span className="text-primary-600">{answeredCount}</span> out of <span className="font-black">{questions.length}</span> questions. Once you submit, you can&apos;t go back!
              </p>
              <div className="space-y-3">
                <Button variant="primary" fullWidth size="lg" className="py-6 text-xl" onClick={handleAutoSubmit}>YES, I&apos;M DONE!</Button>
                <Button variant="ghost" fullWidth size="lg" className="border-2 border-slate-200 dark:border-slate-700" onClick={() => setShowSubmitModal(false)}>CONTINUE TEST</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestStart;
