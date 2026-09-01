'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronRight, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Loader2, Save, RefreshCw,
  BookOpen, Layers, Target, Clock, BarChart3,
  Globe, Languages, AlertCircle, Eye, EyeOff,
  Zap, FileText, Shield, Trophy
} from 'lucide-react';
import API from '../../../lib/api';
import { getCurrentUser } from '../../../utils/authUtils';
import { useSSR } from '../../../hooks/useSSR';
import Loading from '../../Loading';
import Sidebar from '../../Sidebar';
import { toast } from 'react-toastify';

// ─────────────────────────────────────────────
// STATUS CONSTANTS
// ─────────────────────────────────────────────
const STATUS = {
  IDLE: 'idle',
  GENERATING: 'generating',
  DONE: 'done',
  ERROR: 'error',
};

// ─────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Select Exam', 'Select Pattern', 'Generate'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((label, i) => {
        const active = i + 1 === step;
        const done = i + 1 < step;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#22c55e' : active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.08)',
                border: active ? '2px solid #8b5cf6' : done ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.15)',
                fontWeight: 700, fontSize: 14,
                color: (active || done) ? '#fff' : '#64748b',
                transition: 'all 0.3s',
                boxShadow: active ? '0 0 16px rgba(139,92,246,0.5)' : 'none',
              }}>
                {done ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span style={{
                fontSize: 11, fontWeight: active ? 700 : 500,
                color: active ? '#a78bfa' : done ? '#22c55e' : '#64748b',
                whiteSpace: 'nowrap',
              }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 8px', marginBottom: 22,
                background: done ? '#22c55e' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.4s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────
function SectionCard({ section, status, error, questions, expanded, onToggle }) {
  const statusColor = {
    [STATUS.IDLE]: '#64748b',
    [STATUS.GENERATING]: '#f59e0b',
    [STATUS.DONE]: '#22c55e',
    [STATUS.ERROR]: '#ef4444',
  }[status];

  const statusIcon = {
    [STATUS.IDLE]: <Target size={15} color="#64748b" />,
    [STATUS.GENERATING]: <Loader2 size={15} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} />,
    [STATUS.DONE]: <CheckCircle2 size={15} color="#22c55e" />,
    [STATUS.ERROR]: <XCircle size={15} color="#ef4444" />,
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${status === STATUS.GENERATING ? 'rgba(245,158,11,0.4)' : status === STATUS.DONE ? 'rgba(34,197,94,0.25)' : status === STATUS.ERROR ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 14,
        marginBottom: 12,
        overflow: 'hidden',
        transition: 'border-color 0.3s',
        boxShadow: status === STATUS.GENERATING ? '0 0 20px rgba(245,158,11,0.1)' : 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
          cursor: status === STATUS.DONE && questions.length > 0 ? 'pointer' : 'default',
        }}
        onClick={() => status === STATUS.DONE && questions.length > 0 && onToggle()}
      >
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: statusColor,
          boxShadow: status === STATUS.GENERATING ? '0 0 10px rgba(245,158,11,0.8)' : 'none',
          animation: status === STATUS.GENERATING ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }} />
        <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>
          {section.name}
        </span>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          {section.totalQuestions} questions • {section.marksPerQuestion} marks each
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {statusIcon}
          <span style={{ fontSize: 12, color: statusColor, fontWeight: 600 }}>
            {status === STATUS.IDLE && 'Waiting'}
            {status === STATUS.GENERATING && 'Generating…'}
            {status === STATUS.DONE && `${questions.length} Generated`}
            {status === STATUS.ERROR && 'Error'}
          </span>
          {status === STATUS.DONE && questions.length > 0 && (
            expanded ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />
          )}
        </div>
      </div>

      {/* Error message */}
      {status === STATUS.ERROR && error && (
        <div style={{ padding: '8px 18px 14px', color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {/* Questions preview */}
      <AnimatePresence>
        {expanded && questions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {questions.map((q, qi) => (
                <QuestionPreview key={qi} question={q} index={qi} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// QUESTION PREVIEW
// ─────────────────────────────────────────────
function QuestionPreview({ question, index }) {
  const [showExplanation, setShowExplanation] = useState(false);

  const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <span style={{
          minWidth: 24, height: 24, borderRadius: 6,
          background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#a78bfa',
        }}>
          {index + 1}
        </span>
        <p style={{ margin: 0, fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, flex: 1 }}>
          {question.questionText}
        </p>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
          background: `${diffColors[question.difficulty] || '#f59e0b'}22`,
          color: diffColors[question.difficulty] || '#f59e0b',
        }}>
          {question.difficulty}
        </span>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
        {question.options.map((opt, oi) => (
          <div key={oi} style={{
            padding: '6px 10px', borderRadius: 7, fontSize: 12,
            background: oi === question.correctAnswerIndex ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${oi === question.correctAnswerIndex ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.06)'}`,
            color: oi === question.correctAnswerIndex ? '#86efac' : '#94a3b8',
            fontWeight: oi === question.correctAnswerIndex ? 600 : 400,
          }}>
            {['A', 'B', 'C', 'D'][oi]}. {opt}
          </div>
        ))}
      </div>

      {/* Hint */}
      {question.hint && (
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, display: 'flex', gap: 5, alignItems: 'flex-start' }}>
          <span style={{ color: '#f59e0b', fontWeight: 700, minWidth: 30 }}>Hint:</span>
          <span>{question.hint}</span>
        </div>
      )}

      {/* Explanation toggle */}
      <button
        onClick={() => setShowExplanation(!showExplanation)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 11, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4,
          padding: 0, fontFamily: 'inherit',
        }}
      >
        {showExplanation ? <EyeOff size={11} /> : <Eye size={11} />}
        {showExplanation ? 'Hide' : 'Show'} explanation
      </button>
      {showExplanation && (
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0', lineHeight: 1.5 }}>
          {question.explanation}
        </p>
      )}

      {/* Tags */}
      {question.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
          {question.tags.map((t, ti) => (
            <span key={ti} style={{
              fontSize: 10, padding: '2px 6px', borderRadius: 10,
              background: 'rgba(99,102,241,0.12)', color: '#818cf8',
            }}>#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const AdminGenerateTests = () => {
  const { router } = useSSR();
  const user = getCurrentUser();

  // Step
  const [step, setStep] = useState(1);

  // Step 1 — Exam selection
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  // Step 2 — Pattern selection
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(null);

  // Step 3 — Generation
  const [language, setLanguage] = useState('en');
  const [testTitle, setTestTitle] = useState('');
  const [accessLevel, setAccessLevel] = useState('FREE');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sectionStates, setSectionStates] = useState([]); // [{status, error, questions, expanded}]
  const [generationDone, setGenerationDone] = useState(false);
  const [allSectionResults, setAllSectionResults] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const abortRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // ── Fetch categories
  const fetchCategories = async () => {
    setLoadingInit(true);
    try {
      const res = await API.getRealExamCategories();
      if (res?.success) setCategories(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingInit(false); }
  };

  // ── When category changes, load exams
  const handleCategoryChange = async (catId) => {
    setSelectedCategory(catId);
    setSelectedExam(null);
    setExams([]);
    if (!catId) return;
    try {
      const res = await API.getExamsByCategory(catId);
      if (res?.success) setExams(res.data || []);
    } catch (e) { console.error(e); }
  };

  // ── When exam selected, go step 2 and load patterns
  const handleExamSelect = async (exam) => {
    setSelectedExam(exam);
    setPatterns([]);
    setSelectedPattern(null);
    setStep(2);
    try {
      const res = await API.getPatternsByExam(exam._id);
      if (res?.success) setPatterns(res.data || []);
    } catch (e) { console.error(e); }
  };

  // ── When pattern selected, go step 3
  const handlePatternSelect = (pattern) => {
    setSelectedPattern(pattern);
    setTestTitle(`${selectedExam.name} — ${pattern.title} (AI Generated)`);
    setSectionStates(
      pattern.sections.map(() => ({ status: STATUS.IDLE, error: null, questions: [], expanded: false }))
    );
    setGenerationDone(false);
    setAllSectionResults([]);
    setStep(3);
  };

  // ── Toggle section question preview
  const toggleSection = useCallback((idx) => {
    setSectionStates((prev) =>
      prev.map((s, i) => i === idx ? { ...s, expanded: !s.expanded } : s)
    );
  }, []);

  // ── Start generation
  const handleGenerate = async () => {
    if (!selectedPattern || !selectedExam) return;
    setGenerating(true);
    setGenerationDone(false);
    setAllSectionResults([]);
    setSectionStates(
      selectedPattern.sections.map(() => ({ status: STATUS.IDLE, error: null, questions: [], expanded: false }))
    );

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const response = await fetch('/api/admin/generate-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examName: selectedExam.name,
          patternTitle: selectedPattern.title,
          sections: selectedPattern.sections,
          language,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            handleSSEEvent(event);
          } catch (_) {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Generation failed: ' + err.message);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSSEEvent = (event) => {
    switch (event.type) {
      case 'section_start':
        setSectionStates((prev) =>
          prev.map((s, i) =>
            i === event.index ? { ...s, status: STATUS.GENERATING, error: null, questions: [] } : s
          )
        );
        break;

      case 'section_done':
        setSectionStates((prev) =>
          prev.map((s, i) =>
            i === event.index ? { ...s, status: STATUS.DONE, questions: event.questions || [] } : s
          )
        );
        break;

      case 'section_error':
        setSectionStates((prev) =>
          prev.map((s, i) =>
            i === event.index ? { ...s, status: STATUS.ERROR, error: event.error } : s
          )
        );
        break;

      case 'complete':
        setAllSectionResults(event.sections || []);
        setGenerationDone(true);
        toast.success(`✅ Generated ${event.totalGenerated} questions!`);
        break;

      default:
        break;
    }
  };

  // ── Cancel generation
  const handleCancel = () => {
    abortRef.current?.abort();
    setGenerating(false);
  };

  // ── Save test
  const handleSave = async () => {
    if (!selectedPattern || !testTitle.trim()) return;
    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const res = await fetch('/api/admin/generate-tests/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patternId: selectedPattern._id,
          title: testTitle.trim(),
          sections: allSectionResults,
          accessLevel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Practice test saved!');
      } else {
        toast.error(data.error || 'Save failed');
      }
    } catch (e) {
      toast.error('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Reset
  const handleReset = () => {
    abortRef.current?.abort();
    setStep(1);
    setSelectedCategory('');
    setSelectedExam(null);
    setExams([]);
    setPatterns([]);
    setSelectedPattern(null);
    setTestTitle('');
    setSectionStates([]);
    setGenerationDone(false);
    setAllSectionResults([]);
    setGenerating(false);
  };

  if (loadingInit) return <Loading />;

  const totalGenerated = sectionStates.reduce((acc, s) => acc + s.questions.length, 0);
  const totalExpected = selectedPattern?.sections.reduce((acc, s) => acc + (s.totalQuestions || 0), 0) || 0;

  return (
    <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }
        select option { background: #1e2532; color: #e2e8f0; }
      `}</style>

      <Sidebar />

      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99,102,241,0.4)',
              }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>
                AI Test Generator
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Generate section-wise practice test questions using local Ollama AI
            </p>
          </div>
          {step > 1 && (
            <button onClick={handleReset} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: 13,
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}>
              <RefreshCw size={13} /> Start Over
            </button>
          )}
        </div>

        {/* Step Bar */}
        <StepBar step={step} />

        {/* ── STEP 1: SELECT EXAM ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>
              <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} color="#8b5cf6" /> Select Exam
              </h2>

              {/* Category */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Exam Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">— Select Category —</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Exams */}
              {exams.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Exam
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                    {exams.map((exam) => (
                      <button
                        key={exam._id}
                        onClick={() => handleExamSelect(exam)}
                        style={{
                          padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#e2e8f0', textAlign: 'left', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{exam.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{exam.code}</div>
                        </div>
                        <ChevronRight size={16} color="#6366f1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: SELECT PATTERN ── */}
        {step === 2 && selectedExam && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={16} color="#8b5cf6" /> Select Exam Pattern
                </h2>
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                  {selectedExam.name}
                </span>
              </div>

              {patterns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ margin: 0 }}>Loading patterns…</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {patterns.map((pattern) => (
                    <button
                      key={pattern._id}
                      onClick={() => handlePatternSelect(pattern)}
                      style={{
                        padding: '18px 20px', borderRadius: 14, cursor: 'pointer',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#e2e8f0', textAlign: 'left', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{pattern.title}</span>
                        <ChevronRight size={16} color="#6366f1" />
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <StatChip icon={<Clock size={11} />} label={`${pattern.duration} min`} />
                        <StatChip icon={<Trophy size={11} />} label={`${pattern.totalMarks} marks`} />
                        <StatChip icon={<Layers size={11} />} label={`${pattern.sections?.length || 0} sections`} />
                        {pattern.negativeMarking > 0 && (
                          <StatChip icon={<Shield size={11} />} label={`-${pattern.negativeMarking} negative`} color="#ef4444" />
                        )}
                      </div>
                      {pattern.sections?.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                          {pattern.sections.map((s, si) => (
                            <span key={si} style={{
                              fontSize: 11, padding: '3px 8px', borderRadius: 8,
                              background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                            }}>
                              {s.name} ({s.totalQuestions}Q)
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: GENERATE ── */}
        {step === 3 && selectedPattern && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Config card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={15} color="#8b5cf6" /> Generation Config
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Title */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Test Title</label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    disabled={generating}
                    style={inputStyle}
                    placeholder="Practice Test Title"
                  />
                </div>

                {/* Language */}
                <div>
                  <label style={labelStyle}>Language</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['en', '🇬🇧 English'], ['hi', '🇮🇳 Hindi']].map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => !generating && setLanguage(val)}
                        style={{
                          flex: 1, padding: '10px 12px', borderRadius: 10, cursor: generating ? 'not-allowed' : 'pointer',
                          background: language === val ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${language === val ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                          color: language === val ? '#a78bfa' : '#94a3b8',
                          fontFamily: 'inherit', fontSize: 13, fontWeight: language === val ? 700 : 400,
                          transition: 'all 0.2s',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Access Level */}
                <div>
                  <label style={labelStyle}>Access Level</label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    disabled={generating}
                    style={selectStyle}
                  >
                    <option value="FREE">🆓 Free</option>
                    <option value="PRO">⭐ Pro</option>
                  </select>
                </div>
              </div>

              {/* Pattern summary */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <StatChip icon={<BookOpen size={11} />} label={selectedExam?.name} />
                <StatChip icon={<Layers size={11} />} label={selectedPattern.title} />
                <StatChip icon={<Clock size={11} />} label={`${selectedPattern.duration} min`} />
                <StatChip icon={<Trophy size={11} />} label={`${selectedPattern.totalMarks} marks`} />
                <StatChip icon={<Target size={11} />} label={`${totalExpected} questions total`} />
              </div>
            </div>

            {/* Generate button */}
            {!generating && !generationDone && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                style={{
                  width: '100%', padding: '16px', marginBottom: 20, borderRadius: 14,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
                }}
              >
                <Zap size={16} /> Generate {totalExpected} Questions with AI
              </motion.button>
            )}

            {generating && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <div style={{
                  flex: 1, padding: '14px 18px', borderRadius: 12,
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <Loader2 size={16} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 13, color: '#fcd34d', fontWeight: 600 }}>
                    Generating questions… ({totalGenerated}/{totalExpected} done)
                  </span>
                </div>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '12px 18px', borderRadius: 12, cursor: 'pointer',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#fca5a5', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Section cards */}
            <div>
              {selectedPattern.sections.map((section, i) => {
                const state = sectionStates[i] || { status: STATUS.IDLE, error: null, questions: [], expanded: false };
                return (
                  <SectionCard
                    key={i}
                    section={section}
                    status={state.status}
                    error={state.error}
                    questions={state.questions}
                    expanded={state.expanded}
                    onToggle={() => toggleSection(i)}
                  />
                );
              })}
            </div>

            {/* Save panel */}
            <AnimatePresence>
              {generationDone && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 24, padding: '20px 24px', borderRadius: 16,
                    background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)',
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  }}
                >
                  <CheckCircle2 size={22} color="#22c55e" />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#86efac', fontSize: 15 }}>
                      Generation complete — {totalGenerated} questions ready
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4ade80' }}>
                      Review the questions above, then save as a Practice Test
                    </p>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving || !testTitle.trim()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px',
                      borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer',
                      background: saving ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                      border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
                      boxShadow: saving ? 'none' : '0 4px 16px rgba(34,197,94,0.35)',
                      opacity: !testTitle.trim() ? 0.5 : 1,
                    }}
                  >
                    {saving
                      ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                      : <><Save size={14} /> Save Practice Test</>
                    }
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Regenerate button */}
            {generationDone && (
              <button
                onClick={handleGenerate}
                style={{
                  marginTop: 12, width: '100%', padding: '12px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <RefreshCw size={13} /> Regenerate All
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SHARED MINI COMPONENTS
// ─────────────────────────────────────────────
function StatChip({ icon, label, color = '#64748b' }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color, fontWeight: 500 }}>
      {icon} {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// SHARED STYLES
// ─────────────────────────────────────────────
const selectStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', cursor: 'pointer',
};

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#64748b', marginBottom: 7,
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

export default AdminGenerateTests;
