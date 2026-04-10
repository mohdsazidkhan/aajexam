"use client";

import React, { useState, useEffect } from "react";
import API from '../../../lib/api';
import { toast } from "react-toastify";
import Sidebar from '../../Sidebar';
import { useSelector } from "react-redux";
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  Flame, ArrowLeft, HelpCircle, BookOpen, Zap, Newspaper, BarChart3,
  Plus, Trash2, Save
} from 'lucide-react';

const TYPE_LABELS = {
  question: 'Question',
  fact: 'Fact',
  tip: 'Tip / Trick',
  current_affairs: 'Current Affairs',
  poll: 'Poll',
};

const TYPE_COLORS = {
  question: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  fact: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  tip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  current_affairs: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  poll: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400";
const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

const AdminReelEdit = () => {
  const router = useRouter();
  const reelId = router.query?.id;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState('');

  // Common fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [examType, setExamType] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('published');

  // Question fields
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [shortcutTrick, setShortcutTrick] = useState('');

  // Fact fields
  const [highlightText, setHighlightText] = useState('');
  const [keyPoints, setKeyPoints] = useState(['']);

  // Tip fields
  const [formula, setFormula] = useState('');
  const [steps, setSteps] = useState(['']);
  const [tryYourself, setTryYourself] = useState(['']);

  // CA fields
  const [caDate, setCaDate] = useState('');
  const [caCategory, setCaCategory] = useState('');
  const [tableData, setTableData] = useState([{ key: '', value: '' }]);
  const [keyTakeaway, setKeyTakeaway] = useState('');

  // Poll fields
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState([{ text: '' }, { text: '' }]);

  // Load reel data
  useEffect(() => {
    if (!reelId) return;
    const loadReel = async () => {
      try {
        const res = await API.getReelById(reelId);
        if (res?.success && res.data) {
          const r = res.data;
          setType(r.type || '');
          setTitle(r.title || '');
          setContent(r.content || '');
          setSubject(r.subject || '');
          setTopic(r.topic || '');
          setExamType(r.examType || '');
          setDifficulty(r.difficulty || 'medium');
          setTags((r.tags || []).join(', '));
          setStatus(r.status || 'published');

          // Question
          setQuestionText(r.questionText || '');
          setOptions(r.options?.length === 4 ? r.options : ['', '', '', '']);
          setCorrectAnswerIndex(r.correctAnswerIndex ?? 0);
          setExplanation(r.explanation || '');
          setShortcutTrick(r.shortcutTrick || '');

          // Fact
          setHighlightText(r.highlightText || '');
          setKeyPoints(r.keyPoints?.length ? r.keyPoints : ['']);

          // Tip
          setFormula(r.formula || '');
          setSteps(r.steps?.length ? r.steps : ['']);
          setTryYourself(r.tryYourself?.length ? r.tryYourself : ['']);

          // CA
          setCaDate(r.caDate ? new Date(r.caDate).toISOString().split('T')[0] : '');
          setCaCategory(r.caCategory || '');
          setTableData(r.tableData?.length ? r.tableData : [{ key: '', value: '' }]);
          setKeyTakeaway(r.keyTakeaway || '');

          // Poll
          setPollQuestion(r.pollQuestion || '');
          setPollOptions(r.pollOptions?.length ? r.pollOptions.map(o => ({ text: o.text || '' })) : [{ text: '' }, { text: '' }]);
        } else {
          toast.error('Reel not found');
          router.push('/admin/reels');
        }
      } catch (err) {
        toast.error('Failed to load reel');
        router.push('/admin/reels');
      } finally {
        setLoading(false);
      }
    };
    loadReel();
  }, [reelId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        type, title, content, subject, topic, examType, difficulty, status,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };

      if (type === 'question') {
        Object.assign(data, { questionText, options, correctAnswerIndex, explanation, shortcutTrick });
      } else if (type === 'fact') {
        Object.assign(data, { highlightText, keyPoints: keyPoints.filter(Boolean) });
      } else if (type === 'tip') {
        Object.assign(data, { formula, steps: steps.filter(Boolean), tryYourself: tryYourself.filter(Boolean) });
      } else if (type === 'current_affairs') {
        Object.assign(data, { caDate, caCategory, tableData: tableData.filter(t => t.key && t.value), keyTakeaway });
      } else if (type === 'poll') {
        Object.assign(data, { pollQuestion, pollOptions: pollOptions.filter(o => o.text) });
      }

      const res = await API.updateAdminReel(reelId, data);
      if (res?.success) {
        toast.success('Reel updated successfully');
        router.push('/admin/reels');
      } else {
        toast.error(res?.message || 'Failed to update');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating reel');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminMobileAppWrapper>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : ''}`}>
            <div className="p-6 flex items-center justify-center min-h-screen"><Loading /></div>
          </main>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : ''}`}>
          <div className="p-0 lg:p-6 max-w-4xl mx-auto mt-4 lg:mt-2">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => router.push('/admin/reels')} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" /> Edit Reel
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">ID: {reelId}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${TYPE_COLORS[type]}`}>
                {TYPE_LABELS[type] || type}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Status + Common Fields */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Common Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Difficulty</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputClass}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Card title" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Subject</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Quantitative" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Topic</label>
                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Profit & Loss" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Exam Type</label>
                    <input type="text" value={examType} onChange={e => setExamType(e.target.value)} placeholder="e.g. SSC, Banking" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Tags (comma separated)</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. maths, shortcuts" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Content / Description</label>
                  <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className={inputClass} />
                </div>
              </div>

              {/* Question Fields */}
              {type === 'question' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-5 space-y-4">
                  <h3 className="font-bold text-blue-700 dark:text-blue-400">Question Details</h3>
                  <div>
                    <label className={labelClass}>Question Text *</label>
                    <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={3} className={inputClass} required />
                  </div>
                  <div className="space-y-3">
                    <label className={labelClass}>Options (4 required) *</label>
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <button type="button" onClick={() => setCorrectAnswerIndex(i)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${correctAnswerIndex === i
                            ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400 hover:border-green-400'}`}>
                          {String.fromCharCode(65 + i)}
                        </button>
                        <input type="text" value={opt}
                          onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                          placeholder={`Option ${String.fromCharCode(65 + i)}`} className={`flex-1 ${inputClass}`} required />
                      </div>
                    ))}
                    <p className="text-xs text-green-600 dark:text-green-400">Correct: {String.fromCharCode(65 + correctAnswerIndex)}</p>
                  </div>
                  <div>
                    <label className={labelClass}>Explanation</label>
                    <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={3} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Shortcut / Trick</label>
                    <textarea value={shortcutTrick} onChange={e => setShortcutTrick(e.target.value)} rows={2} className={inputClass} />
                  </div>
                </div>
              )}

              {/* Fact Fields */}
              {type === 'fact' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800 p-5 space-y-4">
                  <h3 className="font-bold text-purple-700 dark:text-purple-400">Fact Details</h3>
                  <div>
                    <label className={labelClass}>Highlight Text</label>
                    <input type="text" value={highlightText} onChange={e => setHighlightText(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Key Points</label>
                    {keyPoints.map((kp, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
                        <input type="text" value={kp}
                          onChange={e => { const n = [...keyPoints]; n[i] = e.target.value; setKeyPoints(n); }}
                          className={`flex-1 ${inputClass}`} />
                        <button type="button" onClick={() => { if (keyPoints.length > 1) setKeyPoints(keyPoints.filter((_, j) => j !== i)); }}
                          className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setKeyPoints([...keyPoints, ''])}
                      className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add point</button>
                  </div>
                </div>
              )}

              {/* Tip Fields */}
              {type === 'tip' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 p-5 space-y-4">
                  <h3 className="font-bold text-amber-700 dark:text-amber-400">Trick / Shortcut Details</h3>
                  <div>
                    <label className={labelClass}>Formula</label>
                    <input type="text" value={formula} onChange={e => setFormula(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Steps</label>
                    {steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-400 w-14">Step {i + 1}</span>
                        <input type="text" value={s}
                          onChange={e => { const n = [...steps]; n[i] = e.target.value; setSteps(n); }}
                          className={`flex-1 ${inputClass}`} />
                        <button type="button" onClick={() => { if (steps.length > 1) setSteps(steps.filter((_, j) => j !== i)); }}
                          className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setSteps([...steps, ''])}
                      className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add step</button>
                  </div>
                  <div>
                    <label className={labelClass}>Try Yourself Examples</label>
                    {tryYourself.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input type="text" value={t}
                          onChange={e => { const n = [...tryYourself]; n[i] = e.target.value; setTryYourself(n); }}
                          className={`flex-1 ${inputClass}`} />
                        <button type="button" onClick={() => { if (tryYourself.length > 1) setTryYourself(tryYourself.filter((_, j) => j !== i)); }}
                          className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setTryYourself([...tryYourself, ''])}
                      className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add example</button>
                  </div>
                </div>
              )}

              {/* CA Fields */}
              {type === 'current_affairs' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 p-5 space-y-4">
                  <h3 className="font-bold text-red-700 dark:text-red-400">Current Affairs Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Date</label>
                      <input type="date" value={caDate} onChange={e => setCaDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>CA Category</label>
                      <select value={caCategory} onChange={e => setCaCategory(e.target.value)} className={inputClass}>
                        <option value="">Select</option>
                        <option value="National">National</option>
                        <option value="International">International</option>
                        <option value="Economy">Economy</option>
                        <option value="Sports">Sports</option>
                        <option value="Science & Tech">Science & Tech</option>
                        <option value="Defence">Defence</option>
                        <option value="Awards">Awards</option>
                        <option value="Appointments">Appointments</option>
                        <option value="Schemes">Schemes</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Data Table</label>
                    {tableData.map((row, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input type="text" value={row.key}
                          onChange={e => { const n = [...tableData]; n[i] = { ...n[i], key: e.target.value }; setTableData(n); }}
                          placeholder="Label" className={`flex-1 ${inputClass}`} />
                        <input type="text" value={row.value}
                          onChange={e => { const n = [...tableData]; n[i] = { ...n[i], value: e.target.value }; setTableData(n); }}
                          placeholder="Value" className={`flex-1 ${inputClass}`} />
                        <button type="button" onClick={() => { if (tableData.length > 1) setTableData(tableData.filter((_, j) => j !== i)); }}
                          className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setTableData([...tableData, { key: '', value: '' }])}
                      className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add row</button>
                  </div>
                  <div>
                    <label className={labelClass}>Key Takeaway</label>
                    <textarea value={keyTakeaway} onChange={e => setKeyTakeaway(e.target.value)} rows={2} className={inputClass} />
                  </div>
                </div>
              )}

              {/* Poll Fields */}
              {type === 'poll' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-green-200 dark:border-green-800 p-5 space-y-4">
                  <h3 className="font-bold text-green-700 dark:text-green-400">Poll Details</h3>
                  <div>
                    <label className={labelClass}>Poll Question</label>
                    <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Poll Options</label>
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
                        <input type="text" value={opt.text}
                          onChange={e => { const n = [...pollOptions]; n[i] = { text: e.target.value }; setPollOptions(n); }}
                          placeholder={`Option ${i + 1}`} className={`flex-1 ${inputClass}`} />
                        {pollOptions.length > 2 && (
                          <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                            className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 6 && (
                      <button type="button" onClick={() => setPollOptions([...pollOptions, { text: '' }])}
                        className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add option</button>
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <button type="button" onClick={() => router.push('/admin/reels')}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminReelEdit;
