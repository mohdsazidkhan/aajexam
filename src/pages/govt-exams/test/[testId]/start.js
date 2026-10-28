/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Seo from "../../../../components/common/Seo";
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
  X,
  LayoutGrid
} from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import API from "../../../../lib/api";
import { getCurrentUser } from "../../../../lib/utils/authUtils";
import Button from "../../../../components/common/ui/Button";
import Card from "../../../../components/common/ui/Card";
import Skeleton from "../../../../components/common/Skeleton";
import TestStartModal from "../../../../components/student/TestStartModal";
import LanguageToggle from "../../../../components/common/LanguageToggle";
import useQuestionTranslation from "../../../../hooks/useQuestionTranslation";
import useTranslate from '../../../../hooks/useTranslate';

const TestStart = ({ resolvedId } = {}) => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const testId = resolvedId || router.query.testId;
  const user = getCurrentUser();

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
  const [showSidebar, setShowSidebar] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [started, setStarted] = useState(false);

  const { language, toggleLanguage, translating: translatingQ, translated } = useQuestionTranslation({
    questions,
    currentIndex: currentQIndex,
    sourceType: 'test',
    sourceId: test?._id,
  });

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
        // `_oi` = position in the server's question order (submit is positional). The list is then
        // grouped by section so each section is a contiguous range (1-25, 26-50, ...) in the UI.
        const loaded = (res.data.questions || []).map((q, idx) => ({ ...q, _id: q._id || q.id || `q_${idx}`, _oi: idx }));
        const sectionOrder = [];
        loaded.forEach(q => { const sec = q.section || 'General'; if (!sectionOrder.includes(sec)) sectionOrder.push(sec); });
        const grouped = sectionOrder.flatMap(sec => loaded.filter(q => (q.section || 'General') === sec));
        setQuestions(grouped);
        setAttemptId(res.data.attemptId);

        // If we have saved progress, we can auto-start
        if (saved) {
          setStarted(true);
        }
      } else {
        toast.error(res?.message || res?.error || translate('Failed to load test.'));
        router.back();
      }
    } catch (err) {
      toast.error(translate('Failed to load test.'));
      router.back();
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- translate/fetch helper only feed toasts; re-running on language change would refetch or repeat side effects
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Server expects answers in its own question order, not the section-grouped display order.
      const answersIndices = new Array(questions.length).fill(null);
      questions.forEach(q => { if (answers[q._id] !== undefined) answersIndices[q._oi] = answers[q._id]; });
      const res = await API.submitTest(testId, answersIndices);
      if (res?.success) {
        localStorage.removeItem(`test_${testId}`);
        router.push(`/govt-exams/test/${testId}/result?attempt=${res.data.attemptId}`);
      }
    } catch (err) { toast.error(translate('Submission failed.')); setSubmitting(false); }
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
    } catch (err) { /* console.log("Focus mode deferred"); */ }
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
    <div className="min-h-screen bg-background-page flex flex-col items-center justify-center space-y-2 xl:space-y-4">
      <Skeleton width="100px" height="100px" borderRadius="100%" />
      <p className="text-primary-400 font-bold animate-pulse uppercase tracking-[0.08em]">{translate('Preparing Your Test...')}</p>
    </div>
  );

  if (!test) return null;

  if (!started) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-3 sm:p-6" style={{ height: '100dvh' }}>
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

  const sectionGroups = questions.reduce((acc, q, idx) => {
    const sec = q.section || 'General';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push({ q, idx });
    return acc;
  }, {});
  const sectionNames = Object.keys(sectionGroups);

  const rawQ = questions[currentQIndex];
  const currentQ = rawQ ? {
    ...rawQ,
    questionText: translated?.questionText || rawQ.questionText,
    options: translated?.optionTexts || rawQ.options
  } : null;
  const progressPercent = ((currentQIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const toggleMark = () => {
    if (!currentQ) return;
    const nextMarked = new Set(marked);
    if (nextMarked.has(currentQ._id)) nextMarked.delete(currentQ._id);
    else nextMarked.add(currentQ._id);
    setMarked(nextMarked);
  };
  const clearAnswer = () => {
    if (!currentQ) return;
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ._id];
      return next;
    });
  };

  return (
    <div className="h-screen bg-background-surface text-content-primary overflow-hidden flex flex-col" style={{ height: '100dvh' }}>
      <Seo title={`${test?.title || 'Practice Test'} – In Progress | AajExam`} description="Test in progress on AajExam." noIndex={true} />

      {/* --- Immersive Floating Mission Controller --- */}
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative shrink-0 z-[60] flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3 xl:gap-6 px-3 py-2 sm:px-4 xl:px-6 xl:py-3 border-b border-border-primary bg-background-surface"
        >
          {/* Left: Spacer or Placeholder */}
          {/* Questions panel toggle (desktop: side panel; phones: question palette drawer) */}
          <button
            onClick={() => (window.matchMedia('(min-width: 1280px)').matches ? setShowSidebar(v => !v) : setShowPalette(true))}
            title={showSidebar ? translate('Hide questions') : translate('Show questions')}
            aria-label={translate('Toggle questions panel')}
            className={`hidden md:flex shrink-0 p-2 xl:p-3 rounded-xl border transition-all active:scale-95 ${showSidebar ? "text-primary-600 border-primary-500/30" : "bg-white/90 dark:bg-slate-900/90 text-content-muted hover:text-primary-600 border-border-primary"}`}
          >
            <LayoutGrid className="w-5 h-5 xl:w-6 xl:h-6" />
          </button>
          <p className="hidden xl:block shrink-0 text-xs 2xl:text-[13px] font-bold text-content-muted whitespace-nowrap">
            <span className="font-bold uppercase tracking-[0.08em]">{translate('Status:')}</span>{" "}
            {translate('Questions:')} <span className="text-content-primary">{questions.length}</span>,{" "}
            {translate('Answered:')} <span className="text-primary-600">{answeredCount}</span>,{" "}
            {translate('Not Answered:')} <span className="text-content-primary">{questions.length - answeredCount}</span>,{" "}
            {translate('Mark For Review:')} <span className="text-content-primary">{marked.size}</span>
          </p>
          {/* Phones: row 1 = full exam name; row 2 = questions icon | counter + timer |  language, fullscreen, close */}
          <div className="md:hidden">
            <p className="break-words text-[11px] font-bold text-content-muted uppercase tracking-wide leading-tight">{translateData(test?.title)}</p>
            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowPalette(true)}
                  aria-label={translate('Toggle questions panel')}
                  className="shrink-0 p-1.5 rounded-lg border border-primary-600 text-primary-600 active:scale-95 transition-all"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary-600 whitespace-nowrap">Q {currentQIndex + 1} / {questions.length}</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${timeLeft < 300 ?'bg-primary-600 text-on-primary border-primary-600 animate-pulse':'bg-background-surface text-primary-600 border-primary-600'} transition-all`}>
                  <Clock className="w-3.5 h-3.5 text-current opacity-80" />
                  <span className="font-mono text-xs font-bold">{formatTime(timeLeft)}</span>
                </div>
              </div>
              <div className="justify-self-end flex items-center gap-1.5">
                <LanguageToggle
                  language={language}
                  onToggle={toggleLanguage}
                  translating={translatingQ}
                  className="px-2 py-1 min-w-[36px] text-content-secondary rounded-lg border border-border-primary active:scale-95 font-bold text-xs tracking-[0.08em] uppercase flex items-center justify-center gap-1"
                />
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 text-content-muted rounded-lg border border-border-primary active:scale-95 transition-all"
                  title={translate('Toggle Focus Mode')}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="p-1.5 text-content-muted rounded-lg border border-border-primary active:scale-95 transition-all"
                  title={translate('Exit Test')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Center: Test Progress (Minimalist) */}
          <div className="flex-1 max-w-xl dark:bg-slate-900/90 rounded-2xl px-5 py-2.5 xl:px-6 xl:py-3 border border-border-primary pointer-events-auto hidden md:block">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] leading-none">
                <span className="pr-4">{translateData(test?.title)}</span>
                <span className="shrink-0">{currentQIndex + 1} / {questions.length}</span>
              </div>
              <div className="h-1.5 w-full bg-background-surface-secondary rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className="h-full bg-primary-600" />
              </div>
            </div>
          </div>

          {/* Right: Timer & Tools */}
          <div className="hidden md:flex items-center gap-2 xl:gap-3 pointer-events-auto shrink-0">
            <div className={`flex items-center gap-1.5 xl:gap-3 px-3 py-2 xl:px-5 xl:py-2.5 rounded-xl border ${timeLeft < 300 ?'bg-primary-600 text-on-primary border-primary-600 animate-pulse':'bg-background-surface text-primary-600 border-primary-600'} backdrop-blur-md transition-all`}>
              <Clock className="w-4 h-4 text-current opacity-80" />
              <span className="font-mono text-sm xl:text-xl font-bold">{formatTime(timeLeft)}</span>
            </div>

            <LanguageToggle
              language={language}
              onToggle={toggleLanguage}
              translating={translatingQ}
              className="px-2.5 py-2 xl:px-4 xl:py-2.5 min-w-[44px] xl:min-w-[56px] dark:bg-slate-900/90 text-content-secondary hover:text-primary-600 rounded-xl border border-border-primary transition-all active:scale-95 font-bold text-sm tracking-[0.08em] uppercase flex items-center justify-center gap-1.5"
            />

            <button
              onClick={toggleFullscreen}
              className="p-2.5 xl:p-3 dark:bg-slate-900/90 text-content-muted hover:text-primary-600 rounded-xl border border-border-primary transition-all active:scale-95 group"
              title={translate('Toggle Focus Mode')}
            >
              {isFullscreen ? <Minimize className="w-5 h-5 xl:w-6 xl:h-6" /> : <Maximize className="w-5 h-5 xl:w-6 xl:h-6" />}
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="p-2.5 xl:p-3 dark:bg-slate-900/90 text-content-muted hover:text-content-primary dark:hover:text-white rounded-xl border border-border-primary transition-all active:scale-95 group"
              title={translate('Exit Test')}
            >
              <X className="w-5 h-5 xl:w-6 xl:h-6 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* --- Main Quiz Body --- */}
      <div className="flex-1 relative flex flex-col xl:flex-row overflow-hidden">

        {/* Sidebar Palette (Desktop) */}
        <motion.aside
          initial={false}
          animate={{ width: showSidebar ? 320 : 0, opacity: showSidebar ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          aria-hidden={!showSidebar}
          className="hidden xl:flex shrink-0 border-r border-border-primary overflow-hidden"
        >
          <motion.div
            initial={false}
            animate={{ x: showSidebar ? 0 : -320 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-80 shrink-0 flex flex-col p-3 pb-0"
          >
          <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col gap-2 xl:gap-4 flex-1 min-h-0">
              <h3 className="shrink-0 text-xs font-bold text-content-muted uppercase tracking-[0.08em]">{translate('Questions')}</h3>
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2 xl:space-y-4 pr-1 pb-6">
              {sectionNames.map((secName) => {
                const group = sectionGroups[secName];
                const answeredInSec = group.filter(({ q }) => answers[q._id] !== undefined).length;
                return (
                  <div key={secName} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-content-secondary break-words">
                        {secName}
                      </span>
                      <span className="text-xs font-bold text-primary-600 shrink-0">
                        {answeredInSec}/{group.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {group.map(({ q, idx }) => {
                        const isAnswered = answers[q._id] !== undefined;
                        const isMarked = marked.has(q._id);
                        const isCurrent = currentQIndex === idx;
                        return (
                          <button
                            key={idx}
                            data-q-state={isMarked ? 'marked' : isAnswered ? 'answered' : undefined}
                            onClick={() => setCurrentQIndex(idx)}
                            className={`h-10 rounded-lg xl:rounded-xl font-bold text-xs transition-all ${isCurrent ? 'border-2 border-content-primary' : isMarked ? 'border border-orange-500' : isAnswered ? 'border border-primary-600' : 'border border-border-primary'} ${isMarked ? 'bg-orange-500 text-white' : isAnswered ? 'bg-primary-600 text-on-primary' : `bg-background-page ${isCurrent ? 'text-content-primary' : 'text-content-muted'}`}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
          </motion.div>
        </motion.aside>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative px-3 sm:px-6 xl:px-8 py-3 sm:py-4 xl:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQIndex}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mx-auto space-y-2 xl:space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-primary-600 uppercase shrink-0">
                  <Target className="w-3 h-3" />
                  Q {currentQIndex + 1}
                </div>
                <h2 className="text-[15px] xl:text-xl font-bold font-outfit leading-snug xl:leading-tight text-content-primary whitespace-pre-wrap break-words min-w-0">
                  {currentQ.questionText}
                </h2>
              </div>

              {translatingQ && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-background-surface-secondary rounded-full text-[11px] font-bold text-content-primary uppercase tracking-[0.08em]">
                  <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"/>
                  {translate('Translating to हिंदी…')}
                </div>
              )}

              {currentQ.questionImage && (
                <img src={currentQ.questionImage} alt="" className="max-h-56 sm:max-h-72 max-w-full rounded-lg xl:rounded-xl border border-border-primary object-contain bg-background-surface" />
              )}

              <div className="grid grid-cols-1 gap-2.5 sm:gap-4">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ._id] === idx;
                  const optImg = currentQ.optionImages?.[idx] || '';
                  return (
                    <button
                      key={idx}
                      disabled={translatingQ}
                      onClick={() => handleAnswer(idx)}
                      className={`
                          group relative py-2.5 px-3 sm:py-2 sm:px-5 rounded-2xl border transition-all text-left flex items-center gap-3 sm:gap-4                          ${translatingQ ? 'opacity-60 cursor-not-allowed border-b-2 translate-y-0' : 'active:border-b-0 active:translate-y-1'}
                          ${isSelected
                          ? 'bg-primary-600 text-on-primary border-primary-600'
                          : 'bg-background-surface border-border-primary hover:border-primary-300 dark:hover:border-primary-700'}
                        `}
                    >
                      <div className={`
                            w-8 h-8 sm:w-10 sm:h-10 rounded-lg xl:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shrink-0 transition-colors
                            ${isSelected ? 'text-white' : 'bg-background-surface-secondary text-content-muted'}
                         `}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-2 items-start">
                        {opt && <span className="text-sm sm:text-base font-bold leading-snug sm:leading-tight break-words max-w-full">{opt}</span>}
                        {optImg && <img src={optImg} alt="" className="max-h-28 sm:max-h-32 max-w-full rounded-lg object-contain bg-background-surface" />}
                      </div>
                      {isSelected && <CircleCheck className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 text-white animate-pop-in" />}
                    </button>
                  );
                })}
              </div>

              <div className="xl:hidden grid grid-cols-2 gap-2 sm:gap-4 pt-2">
                <Button
                  variant="primary"
                  className={`w-full !px-2 sm:!px-4 text-[11px] sm:text-sm${marked.has(currentQ._id) ? ' !bg-orange-500 !border-orange-500 !text-white hover:!bg-orange-500' : ''}`}
                  onClick={toggleMark}
                >
                  <Flag className={`w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 shrink-0 ${marked.has(currentQ._id) ? 'fill-white text-white' : 'text-content-muted'}`} />
                  {marked.has(currentQ._id) ? translate('MARKED') : <><span className="sm:hidden">{translate('MARK')}</span><span className="hidden sm:inline">{translate('MARK FOR REVIEW')}</span></>}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full !px-2 sm:!px-4 text-[11px] sm:text-sm"
                  disabled={answers[currentQ._id] === undefined}
                  onClick={clearAnswer}
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 shrink-0 text-content-muted" />
                  <span className="sm:hidden">{translate('CLEAR')}</span><span className="hidden sm:inline">{translate('CLEAR ANSWER')}</span>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      {/* --- Bottom Action Bar (Fixed) --- */}
      <p className="shrink-0 border-t border-border-primary bg-background-surface px-3 sm:px-6 py-1.5 text-[11px] font-bold text-content-muted">
        <span className="text-content-primary">{translate('Note')}:</span> {translate('Questions marked for review are shown in orange')}
      </p>
      <footer className="min-h-[4rem] sm:min-h-[5rem] xl:h-24 shrink-0 dark:bg-slate-900/90 border-t border-border-primary px-3 sm:px-6 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] gap-2 flex items-center justify-between z-50">
        <Button
          variant="secondary"
          size="lg"
          disabled={currentQIndex === 0}
          onClick={() => setCurrentQIndex(prev => prev - 1)}
          className="font-bold h-12 sm:h-14 !px-3 sm:!px-8 sm:min-w-[10rem]"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 sm:mr-2" /> <span className="hidden sm:inline">{translate('PREVIOUS')}</span><span className="sm:hidden text-xs">{translate('PREV')}</span>
        </Button>

        {/* Mark / Clear — web only, centred between Previous and Next */}
        <div className="hidden xl:flex flex-1 items-center justify-center gap-4">
          <Button
            variant="primary"
            className={`h-14 !px-6 min-w-[12rem] text-sm${marked.has(currentQ._id) ? ' !bg-orange-500 !border-orange-500 !text-white hover:!bg-orange-500' : ''}`}
            onClick={toggleMark}
          >
            <Flag className={`w-5 h-5 mr-2 shrink-0 ${marked.has(currentQ._id) ? 'fill-white text-white' : 'text-content-muted'}`} />
            {marked.has(currentQ._id) ? translate('MARKED') : <>{translate('MARK FOR REVIEW')}</>}
          </Button>
          <Button
            variant="secondary"
            className="h-14 !px-6 min-w-[12rem] text-sm"
            disabled={answers[currentQ._id] === undefined}
            onClick={clearAnswer}
          >
            <Trash2 className="w-5 h-5 mr-2 shrink-0 text-content-muted" />
            {translate('CLEAR ANSWER')}
          </Button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {currentQIndex === questions.length - 1 ? (
            <Button
              variant="primary"
              size="lg"
              className="bg-primary-600 hover:bg-primary-600 h-12 sm:h-14 !px-4 sm:!px-12 sm:min-w-[10rem] text-xs sm:text-base"
              onClick={() => setShowSubmitModal(true)}
            >
              {translate('Submit Test')} <Send className="w-5 h-5 sm:w-6 sm:h-6 ml-1.5 sm:ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="h-12 sm:h-14 !px-5 sm:!px-12 sm:min-w-[10rem]"
              onClick={() => setCurrentQIndex(prev => prev + 1)}
            >
              {translate('NEXT')} <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          )}
        </div>
      </footer>

      {/* --- Mobile Palette Drawer --- */}
      <AnimatePresence>
        {showPalette && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPalette(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-x-0 bottom-0 bg-background-surface border-t-2 border-primary-600 rounded-t-[8px] px-5 sm:px-8 pt-4 sm:pt-6 flex flex-col overflow-hidden z-50 max-h-[70vh]" style={{ maxHeight: '70dvh' }}>
              <h3 className="shrink-0 text-lg sm:text-xl xl:text-2xl font-bold font-outfit">{translate('Questions')}</h3>
              <p className="shrink-0 text-[10px] sm:text-xs font-bold text-content-muted pb-3 sm:pb-4 border-b border-border-primary whitespace-nowrap overflow-x-auto [scrollbar-width:none]">Questions: <span className="text-content-primary">{questions.length}</span>, Answered: <span className="text-primary-600">{answeredCount}</span>, Not Answered: <span className="text-content-primary">{questions.length - answeredCount}</span>, Mark For Review: <span className="text-content-primary">{marked.size}</span></p>
              <div className="space-y-5 flex-1 min-h-0 overflow-y-auto overscroll-contain pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                {sectionNames.map((secName) => {
                  const group = sectionGroups[secName];
                  const answeredInSec = group.filter(({ q }) => answers[q._id] !== undefined).length;
                  return (
                    <div key={secName} className="space-y-3">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <span className="text-xs font-bold text-content-secondary break-words">
                          {secName}
                        </span>
                        <span className="text-[11px] font-bold text-primary-600 shrink-0">
                          {answeredInSec}/{group.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                        {group.map(({ q, idx }) => {
                          const isAnswered = answers[q._id] !== undefined;
                          const isMarked = marked.has(q._id);
                          const isCurrent = currentQIndex === idx;
                          return (
                            <button
                              key={idx}
                              data-q-state={isMarked ? 'marked' : isAnswered ? 'answered' : undefined}
                              onClick={() => { setCurrentQIndex(idx); setShowPalette(false); }}
                              className={`h-11 sm:h-14 rounded-xl sm:rounded-2xl font-bold ${isCurrent ? 'border-2 border-content-primary' : isMarked ? 'border border-orange-500' : isAnswered ? 'border border-primary-600' : 'border border-border-primary'} ${isMarked ? 'bg-orange-500 text-white' : isAnswered ? 'bg-primary-600 text-on-primary' : `bg-background-page ${isCurrent ? 'text-content-primary' : 'text-content-muted'}`}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Submit Confirmation Modal --- */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80" onClick={() => setShowSubmitModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-background-surface rounded-3xl sm:rounded-3xl p-5 sm:p-10 max-w-md w-full max-h-[85vh] overflow-y-auto border border-primary-500/20">
              <div className="w-14 h-14 sm:w-20 sm:h-20 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-primary-600">
                <CircleAlert className="w-7 h-7 sm:w-10 sm:h-10" />
              </div>
              <h2 className="text-xl xl:text-2xl font-bold font-outfit text-center mb-2">{translate('Ready to finish?')}</h2>
              <p className="text-center text-content-muted mb-5 sm:mb-8 font-bold leading-relaxed text-sm sm:text-base px-1 sm:px-4">
                You&apos;ve answered <span className="text-primary-600">{answeredCount}</span> out of <span className="font-bold">{questions.length}</span> questions. Once you submit, you can&apos;t go back!
              </p>
              <div className="space-y-3">
                <Button variant="primary" fullWidth size="lg" className="py-4 sm:py-6 text-lg sm:text-xl" onClick={handleAutoSubmit} disabled={submitting}>
                  {submitting ? translate('SUBMITTING...') : translate("YES, I'M DONE!")}
                </Button>
                <Button variant="secondary" fullWidth size="lg" onClick={() => setShowSubmitModal(false)}>{translate('CONTINUE TEST')}</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestStart;

export async function getServerSideProps({ params }) {
  const dbConnect = (await import('../../../../lib/db')).default;
  const PracticeTest = (await import('../../../../models/PracticeTest')).default;
  const { isObjectId, slugRedirect } = await import('../../../../lib/web/slugRouting');
  const segment = params?.testId;
  if (!segment) return { notFound: true };

  try {
    await dbConnect();

    if (isObjectId(segment)) {
      const idDoc = await PracticeTest.findById(segment).select('slug').lean();
      if (idDoc?.slug) return slugRedirect(`/govt-exams/test/${idDoc.slug}/start`);
      if (!idDoc) return { notFound: true };
      return { props: { resolvedId: segment } };
    }

    const doc = await PracticeTest.findOne({ slug: segment }).select('_id').lean();
    if (!doc) return { notFound: true };

    return { props: { resolvedId: String(doc._id) } };
  } catch (e) {
    console.error('test start ssr error', e);
    return { notFound: true };
  }
}
