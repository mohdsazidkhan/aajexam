'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import API from '../../lib/api';
import MobileAppWrapper from '../MobileAppWrapper';
import Button from '../ui/Button';
import { isAuthenticated } from '../../lib/auth';
import {
  ArrowLeft, Flame, HelpCircle, BookOpen, Zap, Newspaper, BarChart3, Plus, Trash2
} from 'lucide-react';

const TYPES = [
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30', desc: 'MCQ with explanation' },
  { value: 'fact', label: 'Fact', icon: BookOpen, color: 'border-purple-400 bg-purple-50 dark:bg-purple-950/30', desc: 'Quick fact or one-liner' },
  { value: 'tip', label: 'Tip / Trick', icon: Zap, color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/30', desc: 'Shortcut or formula' },
  { value: 'current_affairs', label: 'Current Affairs', icon: Newspaper, color: 'border-red-400 bg-red-50 dark:bg-red-950/30', desc: 'Daily CA card' },
  { value: 'poll', label: 'Poll', icon: BarChart3, color: 'border-green-400 bg-green-50 dark:bg-green-950/30', desc: 'Community poll' },
];

const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400";
const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

const ReelCreate = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [examType, setExamType] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [tags, setTags] = useState('');

  // Question
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [shortcutTrick, setShortcutTrick] = useState('');

  // Fact
  const [highlightText, setHighlightText] = useState('');
  const [keyPoints, setKeyPoints] = useState(['']);

  // Tip
  const [formula, setFormula] = useState('');
  const [steps, setSteps] = useState(['']);

  // Poll
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState([{ text: '' }, { text: '' }]);

  if (!isAuthenticated()) {
    return (
      <MobileAppWrapper>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-3">Login required to create reels</p>
            <Link href="/login" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">Login</Link>
          </div>
        </div>
      </MobileAppWrapper>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) { toast.error('Select card type'); return; }
    setLoading(true);
    try {
      const data = { type, title, content, subject, topic, examType, difficulty, tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [] };

      if (type === 'question') Object.assign(data, { questionText, options, correctAnswerIndex, explanation, shortcutTrick });
      if (type === 'fact') Object.assign(data, { highlightText, keyPoints: keyPoints.filter(Boolean) });
      if (type === 'tip') Object.assign(data, { formula, steps: steps.filter(Boolean) });
      if (type === 'poll') Object.assign(data, { pollQuestion, pollOptions: pollOptions.filter(o => o.text) });

      const res = await API.createReel(data);
      if (res?.success) { toast.success(res.message || 'Submitted!'); router.push('/reels'); }
      else toast.error(res?.message || 'Failed');
    } catch (err) { toast.error('Error'); }
    finally { setLoading(false); }
  };

  return (
    <MobileAppWrapper>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <Link href="/reels" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Create Reel
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          {!type ? (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Choose Card Type</p>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                {TYPES.map(t => (
                  <motion.button key={t.value} whileTap={{ scale: 0.97 }} onClick={() => setType(t.value)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${t.color}`}>
                    <t.icon className="w-8 h-8 mb-3 opacity-70" />
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{t.label}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{t.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-primary-500 text-white uppercase tracking-widest">{type === 'current_affairs' ? 'CA' : type}</span>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">New Reel</p>
                </div>
                <button type="button" onClick={() => setType('')} className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest bg-primary-50 dark:bg-primary-950/30 px-3 py-1 rounded-lg">Change Type</button>
              </div>

              {/* Common */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>Subject</label><input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Quantitative" className={inputClass} /></div>
                  <div><label className={labelClass}>Topic</label><input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Profit & Loss" className={inputClass} /></div>
                  <div><label className={labelClass}>Exam</label><input value={examType} onChange={e => setExamType(e.target.value)} placeholder="e.g. SSC" className={inputClass} /></div>
                  <div><label className={labelClass}>Difficulty</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputClass}>
                      <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div><label className={labelClass}>Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Card title" className={inputClass} /></div>
              </div>

              {/* Question */}
              {type === 'question' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-4 space-y-3">
                  <div><label className={labelClass}>Question *</label><textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={3} className={inputClass} required /></div>
                  <div className="space-y-2">
                    {options.map((o, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button type="button" onClick={() => setCorrectAnswerIndex(i)}
                          className={`w-7 h-7 rounded-full border-2 text-xs font-bold flex items-center justify-center ${correctAnswerIndex === i ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                          {String.fromCharCode(65 + i)}
                        </button>
                        <input value={o} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className={`flex-1 ${inputClass}`} required />
                      </div>
                    ))}
                  </div>
                  <div><label className={labelClass}>Explanation</label><textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={2} className={inputClass} /></div>
                  <div><label className={labelClass}>Trick</label><input value={shortcutTrick} onChange={e => setShortcutTrick(e.target.value)} className={inputClass} /></div>
                </div>
              )}

              {/* Fact */}
              {type === 'fact' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800 p-4 space-y-3">
                  <div><label className={labelClass}>Highlight Text</label><input value={highlightText} onChange={e => setHighlightText(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Content</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Key Points</label>
                    {keyPoints.map((kp, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input value={kp} onChange={e => { const n = [...keyPoints]; n[i] = e.target.value; setKeyPoints(n); }} className={`flex-1 ${inputClass}`} />
                        {keyPoints.length > 1 && <button type="button" onClick={() => setKeyPoints(keyPoints.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-400" /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => setKeyPoints([...keyPoints, ''])} className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                  </div>
                </div>
              )}

              {/* Tip */}
              {type === 'tip' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 p-4 space-y-3">
                  <div><label className={labelClass}>Formula</label><input value={formula} onChange={e => setFormula(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Content</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Steps</label>
                    {steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-400 w-10">Step {i + 1}</span>
                        <input value={s} onChange={e => { const n = [...steps]; n[i] = e.target.value; setSteps(n); }} className={`flex-1 ${inputClass}`} />
                        {steps.length > 1 && <button type="button" onClick={() => setSteps(steps.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-400" /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => setSteps([...steps, ''])} className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                  </div>
                </div>
              )}

              {/* Poll */}
              {type === 'poll' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-green-200 dark:border-green-800 p-4 space-y-3">
                  <div><label className={labelClass}>Poll Question *</label><input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} className={inputClass} required /></div>
                  <div>
                    {pollOptions.map((o, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input value={o.text} onChange={e => { const n = [...pollOptions]; n[i] = { text: e.target.value }; setPollOptions(n); }} placeholder={`Option ${i + 1}`} className={`flex-1 ${inputClass}`} required={i < 2} />
                        {pollOptions.length > 2 && <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-400" /></button>}
                      </div>
                    ))}
                    {pollOptions.length < 6 && <button type="button" onClick={() => setPollOptions([...pollOptions, { text: '' }])} className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Add option</button>}
                  </div>
                </div>
              )}

              {/* CA */}
              {type === 'current_affairs' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 p-4 space-y-3">
                  <div><label className={labelClass}>Title *</label><input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required /></div>
                  <div><label className={labelClass}>Content *</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className={inputClass} required /></div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Submitting...' : 'Submit Reel'}</Button>
            </form>
          )}
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default ReelCreate;
