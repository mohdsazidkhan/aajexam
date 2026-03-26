"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import API from "../../../../lib/api";
import {
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaBookmark,
  FaTrash,
  FaSubmit,
  FaFlag,
  FaEye,
  FaChevronRight,
  FaChevronLeft,
  FaTimes,
} from "react-icons/fa";
import { getCurrentUser } from "../../../../lib/utils/authUtils";
import Loading from "../../../../components/Loading";
import { toast } from "react-hot-toast";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { FiGlobe, FiLoader } from "react-icons/fi";

const TestStart = () => {
  const router = useRouter();
  const { testId } = router.query;
  const user = getCurrentUser();
  const { translateTexts, currentLanguage, changeLanguage, languages, isTranslating } = useLanguage();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [translationMap, setTranslationMap] = useState({});
  const [lastTranslatedLanguage, setLastTranslatedLanguage] = useState("en");
  const translatingRef = useRef(false);
  const translationMapRef = useRef({});
  const lastTranslatedLanguageRef = useRef("en");

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("quiz-fullscreen-mode");
    return () => {
      document.body.classList.remove("quiz-fullscreen-mode");
    };
  }, []);

  const attemptFullscreen = useCallback(async () => {
    if (typeof window === "undefined") return;
    const docEl = document.documentElement;
    const isAlreadyFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;

    if (isAlreadyFullscreen) {
      setIsFullscreenActive(true);
      setShowFullscreenPrompt(false);
      return;
    }

    try {
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      } else {
        throw new Error("Fullscreen API not supported");
      }
      setIsFullscreenActive(true);
      setShowFullscreenPrompt(false);
    } catch (err) {
      console.warn("Fullscreen request failed:", err);
      setShowFullscreenPrompt(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFullscreenChange = () => {
      const isActive = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreenActive(isActive);
      if (!isActive) {
        setShowFullscreenPrompt(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    const timer = setTimeout(() => {
      attemptFullscreen();
    }, 200);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
      const activeEl =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      if (activeEl && document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      } else if (activeEl && document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (activeEl && document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    };
  }, [attemptFullscreen]);

  // Auto-save to localStorage
  const saveToLocal = useCallback(() => {
    if (!testId || !questions.length) return;
    const saveData = {
      testId,
      answers,
      currentQIndex,
      marked: Array.from(marked),
      timeLeft,
      startedAt,
    };
    localStorage.setItem(`test_${testId}`, JSON.stringify(saveData));
  }, [testId, answers, currentQIndex, marked, timeLeft, startedAt, questions]);

  const buildAnswerObjects = useCallback(() => {
    if (!questions.length) return [];
    return questions
      .map((q) => {
        const selected = answers[q._id];
        if (selected === undefined) return null;
        return {
          questionId: q._id,
          selectedIndex: selected,
        };
      })
      .filter(Boolean);
  }, [questions, answers]);

  const buildAnswerIndices = useCallback(() => {
    if (!questions.length) return [];
    return questions.map((q) =>
      answers[q._id] !== undefined ? answers[q._id] : null
    );
  }, [questions, answers]);

  // Auto-save to server
  const saveToServer = useCallback(async () => {
    if (!attemptId || !user) return;
    try {
      const answersArray = buildAnswerObjects();
      await API.saveTestAnswers(testId, attemptId, answersArray);
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }, [testId, attemptId, user, buildAnswerObjects]);

  // Load test
  useEffect(() => {
    if (testId) loadTest();
  }, [testId]);

  useEffect(() => {
    if (questions.length === 0) return;
    setTranslationMap({});
    setLastTranslatedLanguage("");
    translationMapRef.current = {};
    lastTranslatedLanguageRef.current = "";
    translatingRef.current = false;
  }, [questions]);

  const loadTest = async () => {
    try {
      setLoading(true);

      // Try load from localStorage first
      const saved = localStorage.getItem(`test_${testId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setAnswers(data.answers || {});
        setCurrentQIndex(data.currentQIndex || 0);
        setMarked(new Set(data.marked || []));
        setTimeLeft(data.timeLeft || 0);
        setStartedAt(data.startedAt ? new Date(data.startedAt) : null);
      }

      // Load from server
      const res = await API.startPracticeTest(testId);
      if (res?.success) {
        setTest(res.data);
        setQuestions(res.data.questions || []);
        setAttemptId(res.data.attemptId);

        if (!saved) {
          // First time - initialize
          const duration = res.data.examPattern?.duration || res.data.duration;
          setTimeLeft(duration * 60); // Convert to seconds
          setStartedAt(
            res.data.startedAt ? new Date(res.data.startedAt) : new Date()
          );
        }
      }
    } catch (err) {
      console.error("Error loading test:", err);
      toast.error("Failed to load test. Please try again.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for translation caching
  const getTranslationCacheKey = useCallback((testId) => {
    return `test_translations_${testId}`;
  }, []);

  const loadTranslationFromCache = useCallback((testId, questionId, language) => {
    if (!testId || !questionId || !language || language === "en") return null;

    try {
      const cacheKey = getTranslationCacheKey(testId);
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const translations = JSON.parse(cached);
      if (translations[language] && translations[language][questionId]) {
        return translations[language][questionId];
      }
    } catch (err) {
      console.error("Error loading translation from cache:", err);
    }
    return null;
  }, [getTranslationCacheKey]);

  const saveTranslationToCache = useCallback((testId, questionId, language, translationData) => {
    if (!testId || !questionId || !language || language === "en") return;

    try {
      const cacheKey = getTranslationCacheKey(testId);
      const existing = localStorage.getItem(cacheKey);
      let translations = existing ? JSON.parse(existing) : {};

      if (!translations[language]) {
        translations[language] = {};
      }

      translations[language][questionId] = translationData;
      localStorage.setItem(cacheKey, JSON.stringify(translations));
    } catch (err) {
      console.error("Error saving translation to cache:", err);
    }
  }, [getTranslationCacheKey]);

  const translateCurrentQuestion = useCallback(
    async (lang) => {
      if (!questions.length || !testId) return;

      const q = questions[currentQIndex];
      if (!q) return;

      // Reset to English
      if (lang === "en") {
        setTranslationMap({});
        setLastTranslatedLanguage("en");
        translationMapRef.current = {};
        lastTranslatedLanguageRef.current = "en";
        return;
      }

      // Check if already translating this question
      if (translatingRef.current) return;

      // Check if translation already exists in map for current question (using refs to avoid dependency)
      const questionKey = `q-${q._id}`;
      if (translationMapRef.current[questionKey] && lastTranslatedLanguageRef.current === lang) {
        return; // Already translated and loaded
      }

      // Check cache first
      const cachedTranslation = loadTranslationFromCache(testId, q._id, lang);
      if (cachedTranslation) {
        // Use cached translation
        const newMap = {};
        newMap[`q-${q._id}`] = cachedTranslation.questionText || q.questionText;
        cachedTranslation.options.forEach((op, idx) => {
          newMap[`q-${q._id}-op-${idx}`] = op || q.options[idx];
        });
        setTranslationMap(newMap);
        setLastTranslatedLanguage(lang);
        translationMapRef.current = newMap;
        lastTranslatedLanguageRef.current = lang;
        return;
      }

      // Mark as translating
      translatingRef.current = true;

      try {
        // Build list: questionText + options
        const textList = [q.questionText, ...q.options];

        // Translate only current question
        const map = await translateTexts(textList, lang);
        if (!map) {
          translatingRef.current = false;
          return;
        }

        // Build translation map for only this question
        const newMap = {};

        const translatedQuestionText = map[q.questionText] || q.questionText;
        newMap[`q-${q._id}`] = translatedQuestionText;

        const translatedOptions = [];
        q.options.forEach((op, idx) => {
          const translatedOp = map[op] || op;
          newMap[`q-${q._id}-op-${idx}`] = translatedOp;
          translatedOptions.push(translatedOp);
        });

        setTranslationMap(newMap);
        setLastTranslatedLanguage(lang);
        translationMapRef.current = newMap;
        lastTranslatedLanguageRef.current = lang;

        // Save to cache
        saveTranslationToCache(testId, q._id, lang, {
          questionText: translatedQuestionText,
          options: translatedOptions,
        });
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        translatingRef.current = false;
      }
    },
    [questions, currentQIndex, translateTexts, testId, loadTranslationFromCache, saveTranslationToCache]
  );


  useEffect(() => {
    if (!questions.length) return;
    translateCurrentQuestion(currentLanguage);
    if (currentLanguage === "en") {
      setTranslationMap({});
      return;
    }
  }, [currentLanguage, currentQIndex, questions, translateCurrentQuestion]);


  const t = (key, fallback) => {
    return translationMap[key] || fallback;
  };

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || !startedAt) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, startedAt]);

  // Auto-save
  useEffect(() => {
    saveToLocal();
    autoSaveRef.current = setInterval(() => {
      saveToLocal();
      saveToServer();
    }, 30000); // Every 30 seconds

    return () => clearInterval(autoSaveRef.current);
  }, [saveToLocal, saveToServer]);

  const handleAutoSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const answersArray = buildAnswerIndices();

      const res = await API.submitTest(testId, answersArray);
      if (res?.success) {
        localStorage.removeItem(`test_${testId}`);
        // Remove translation cache for this test
        const translationCacheKey = getTranslationCacheKey(testId);
        localStorage.removeItem(translationCacheKey);
        const resultPayload = {
          attemptId: res.data?.attemptId,
          score: res.data?.score ?? 0,
          correctCount: res.data?.correctCount ?? 0,
          wrongCount: res.data?.wrongCount ?? 0,
          accuracy: res.data?.accuracy ?? 0,
          totalTime: res.data?.totalTime ?? 0,
          rank: res.data?.rank ?? null,
          percentile: res.data?.percentile ?? null,
          sectionWiseScore: res.data?.sectionWiseScore ?? {},
          testTitle: test?.title || "Practice Test",
          totalQuestions: questions.length,
          submittedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem(
            `test_result_${testId}`,
            JSON.stringify(resultPayload)
          );
        } catch (storageError) {
          console.warn("Failed to cache result payload:", storageError);
        }
        router.push(
          `/govt-exams/test/${testId}/result?attempt=${res.data.attemptId}`
        );
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0)
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
      )}`;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleClear = () => {
    const qId = questions[currentQIndex]?._id;
    if (qId) {
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }
  };

  const toggleMark = () => {
    const qId = questions[currentQIndex]?._id;
    if (qId) {
      setMarked((prev) => {
        const next = new Set(prev);
        if (next.has(qId)) next.delete(qId);
        else next.add(qId);
        return next;
      });
    }
  };

  const getStatus = (idx) => {
    const q = questions[idx];
    if (!q) return "";
    if (marked.has(q._id)) return "marked";
    if (answers[q._id] !== undefined) return "answered";
    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="lg" color="gray" message="Loading test..." />
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  if (!currentQ) return null;
  const questionCount = questions.length;
  const isLanguageBusy = isTranslating;
  const answeredCount = Object.keys(answers).length;
  const markedCount = marked.size;
  const unansweredCount = questionCount - answeredCount;
  const markedAnsweredCount = Array.from(marked).filter(
    (id) => answers[id] !== undefined
  ).length;
  const markedOnlyCount = Math.max(markedCount - markedAnsweredCount, 0);
  const testTitle = test?.title || "Practice Test";
  const duration = test?.examPattern?.duration || test?.duration || 0;
  const durationText = duration
    ? `${Math.floor(duration / 60)}h ${duration % 60}m`
    : "";

  return (
    <>
      <Head>
        <title>{testTitle} - Taking Test | AajExam</title>
        <meta
          name="description"
          content={`Taking ${testTitle}. ${questionCount} questions${durationText ? `, Duration: ${durationText}` : ""
            }. Answer questions and track your progress in real-time.`}
        />
        <meta
          name="keywords"
          content={`${testTitle}, practice test, mock test, government exam, online test, exam preparation`}
        />
        <meta
          property="og:title"
          content={`${testTitle} - Taking Test | AajExam`}
        />
        <meta
          property="og:description"
          content={`Taking ${testTitle} with ${questionCount} questions${durationText ? `, Duration: ${durationText}` : ""
            }.`}
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${testTitle} - AajExam`} />
        <meta
          name="twitter:description"
          content={`Taking ${testTitle} practice test.`}
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div
        className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-4"
        data-no-translate="true"
      >
        {/* Top Bar with Timer */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 sticky top-0 z-50 shadow-lg mb-4">
          <div className="container mx-auto px-0 lg:px-6 xl:px-8 px-2 lg:px-4 py-1 lg:py-2 flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-sm lg:text-xl text-white font-bold">
                {test?.title || "Practice Test"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Translate Button - Top Right */}
              <div className="relative">
                <select
                  value={currentLanguage || "en"}
                  onChange={(e) => changeLanguage(e.target.value)}
                  disabled={isLanguageBusy}
                  className="appearance-none bg-white/90 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Change Page Language"
                >
                  {languages && languages.length > 0 ? (
                    languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.code === "en"
                          ? "EN"
                          : lang.name.slice(0, 3).toUpperCase()}
                      </option>
                    ))
                  ) : (
                    <option value="en">EN</option>
                  )}
                </select>
                {isLanguageBusy ? (
                  <FiLoader
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400 animate-spin"
                    size={14}
                  />
                ) : (
                  <FiGlobe
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400"
                    size={14}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-2 lg:px-4 py-1 lg:py-2 rounded-lg">
                <FaClock className="text-white text-xl" />
                <span
                  className={`text-white font-bold text-md lg:text-xl ${timeLeft < 300 ? "animate-pulse" : ""
                    }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-100 lg:container mx-auto px-0 lg:px-6 xl:px-8 px-2 lg:px-4">
          {showFullscreenPrompt && !isFullscreenActive && (
            <div className="mb-3 bg-primary-50 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-700 text-primary-800 dark:text-primary-100 rounded-lg px-3 py-2 flex items-center justify-between gap-3">
              <span className="text-sm">
                For the best experience, enable fullscreen mode.
              </span>
              <button
                onClick={attemptFullscreen}
                className="px-3 py-1 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-all"
              >
                Go Fullscreen
              </button>
            </div>
          )}
          {/* Mobile Question Palette */}
          <div className="lg:hidden mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="flex items-center justify-between px-2 lg:px-4 py-1 lg:py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Questions
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {answeredCount} answered · {markedCount} marked
                </div>
              </div>
              <div className="flex gap-2 px-2 lg:px-3 py-2 lg:py-3 overflow-x-auto">
                {questions.map((q, idx) => {
                  const status = getStatus(idx);
                  const isCurrent = currentQIndex === idx;

                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-lg text-xs lg:text-sm font-semibold transition-all ${isCurrent
                        ? "bg-red-600 text-white ring-4 ring-red-200"
                        : status === "answered"
                          ? "bg-green-500 text-white"
                          : status === "marked"
                            ? "bg-primary-400 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gpa-2 lg:gap-4">
            {/* Main Question Area */}
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 lg:p-6">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-2 lg:mb-6">
                  <span className="text-sm font-semibold text-gray-700 dark:text-primary-400">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                  {marked.has(currentQ._id) && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold flex items-center gap-1">
                      <FaFlag /> Marked
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <div className="mb-2 lg:mb-6">
                  <p className="text-md lg:text-lg font-semibold text-gray-900 dark:text-white whitespace-pre-wrap">
                    {t(`q-${currentQ._id}`, currentQ.questionText)}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-2 lg:mb-6">
                  {currentQ.options?.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(currentQ._id, idx)}
                      className={`w-full text-left p-2 lg:p-4 rounded-lg border-2 transition-all ${answers[currentQ._id] === idx
                        ? "border-red-600 bg-red-50 dark:bg-red-900/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-red-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex-shrink-0 w-6 lg:w-8 h-6 lg:h-8 rounded-full flex items-center justify-center font-semibold ${answers[currentQ._id] === idx
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>

                        <span className="flex-1 text-gray-900 dark:text-white">
                          {t(`q-${currentQ._id}-op-${idx}`, option)}
                        </span>

                        {answers[currentQ._id] === idx && (
                          <FaCheckCircle className="text-primary-600 text-xl flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2 lg:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleClear}
                    disabled={!answers[currentQ._id]}
                    className="flex-1 px-2 lg:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <FaTrash /> Clear
                  </button>
                  <button
                    onClick={toggleMark}
                    className="flex-1 px-2 lg:px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all flex items-center justify-center gap-2"
                  >
                    <FaBookmark />{" "}
                    {marked.has(currentQ._id) ? "Unmark" : "Mark"}
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-2 lg:mt-6 pt-2 lg:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() =>
                      setCurrentQIndex(Math.max(0, currentQIndex - 1))
                    }
                    disabled={currentQIndex === 0}
                    className="px-2 lg:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <FaChevronLeft /> Previous
                  </button>

                  {currentQIndex < questions.length - 1 ? (
                    <button
                      onClick={() =>
                        setCurrentQIndex(
                          Math.min(questions.length - 1, currentQIndex + 1)
                        )
                      }
                      className="px-3 lg:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                    >
                      Next <FaChevronRight />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-3 lg:px-6 py-2 bg-gradient-to-r from-green-600 to-secondary-600 text-white rounded-lg hover:from-green-700 hover:to-secondary-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Test"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Question Palette Sidebar */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sticky top-20">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Question Palette
                </h3>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {answeredCount}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">
                      Answered
                    </div>
                  </div>
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                      {markedCount}
                    </div>
                    <div className="text-xs text-primary-700 dark:text-primary-300">
                      Marked
                    </div>
                  </div>
                </div>

                {/* Question Grid */}
                <div className="grid grid-cols-5 gap-2 max-h-96 pb-4 overflow-y-auto">
                  {questions.map((q, idx) => {
                    const status = getStatus(idx);
                    return (
                      <button
                        key={q._id}
                        onClick={() => setCurrentQIndex(idx)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentQIndex === idx
                          ? "bg-red-600 text-white ring-4 ring-red-300"
                          : status === "answered"
                            ? "bg-green-500 text-white"
                            : status === "marked"
                              ? "bg-primary-400 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-9 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Answered
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-primary-400 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Marked
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Not Visited
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
            >
              <FaTimes className="text-white text-xl" />
            </button>
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white">
                Ready to submit?
              </h2>
              <p className="text-sm text-white/80">
                You won't be able to change your answers after submission.
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {answeredCount}
                  </div>
                  <div className="text-xs font-semibold text-green-700 dark:text-green-200 uppercase tracking-wide">
                    Answered
                  </div>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4">
                  <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                    {markedCount}
                  </div>
                  <div className="text-xs font-semibold text-primary-700 dark:text-primary-200 uppercase tracking-wide">
                    Marked
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                    {unansweredCount}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Unanswered
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    Total Questions
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {questionCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    Questions Answered
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {answeredCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    Marked for Review
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {markedCount}
                  </span>
                </div>
                {markedOnlyCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      Marked Without Answer
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {markedOnlyCount}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    Time Remaining
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {markedCount > 0 && (
                <div className="text-sm text-primary-700 dark:text-primary-200 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl px-4 py-3">
                  You still have some questions marked for review. Make sure
                  you've finalized your answers before submitting.
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 px-6 py-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                disabled={submitting}
              >
                Review Again
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleAutoSubmit();
                }}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-secondary-600 text-white font-semibold hover:from-green-700 hover:to-secondary-700 transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TestStart;
